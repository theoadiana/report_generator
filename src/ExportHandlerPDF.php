<?php
namespace Theob\ReportGenerator;

// require_once 'ExportHandler.php';
require_once __DIR__ . '/../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class ExportHandlerPDF extends ExportHandler
{
    private PDFReportDesigner $designer;

    public function __construct(array $data, PDFReportDesigner $designer)
    {
        parent::__construct($data);
        $this->designer = $designer;
    }

    public function export(string $filename = 'export.pdf'): void
    {
        if (empty($this->data)) {
            echo 'Tidak ada data untuk diekspor.';
            return;
        }

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', true);
        $options->set('defaultFont', $this->designer->getFontStyle());

        $dompdf = new Dompdf($options);

        // Ambil HTML utama, header, dan footer
        $contentHtml = $this->designer->generateHTML($this->data);
        $headerHtml = $this->designer->getHeaderHTML();
        $footerHtml = $this->designer->getFooterHTML();

        // ==============================
        // Hitung tinggi headerStyle & footerStyle
        // ==============================
        $convertValue = 1.41;
        $headerHeight = 0;
        $footerHeight = 0;

        $headerDisplayRule = $this->designer->getHeaderDisplayRule();
        $footerDisplayRule = $this->designer->getFooterDisplayRule();

        $headerStyle = $this->designer->getHeaderStyle() ?? [];
        $footerStyle = $this->designer->getFooterStyle() ?? [];

        if (!empty($headerStyle['rows']) && is_array($headerStyle['rows'])) {
            foreach ($headerStyle['rows'] as $row) {
                // Ambil tinggi maksimum dari setiap baris
                $rowHeights = array_map(fn($cell) => $cell['height'] ?? 0, $row);
                $headerHeight += max($rowHeights);
            }
        }

        if (!empty($footerStyle['rows']) && is_array($footerStyle['rows'])) {
            foreach ($footerStyle['rows'] as $row) {
                $rowHeights = array_map(fn($cell) => $cell['height'] ?? 0, $row);
                $footerHeight += max($rowHeights);
            }
        }

        $bottomSafeMargin = 10 * $convertValue;

        // Tambahkan sedikit jarak ekstra (10px) agar tidak terlalu rapat
        $paddingTop = $headerHeight * $convertValue + $this->designer->getBodyMarginTop();
        $paddingBottom = max(
            $footerHeight * $convertValue + $this->designer->getBodyMarginBottom(),
            $footerHeight + $bottomSafeMargin
        );

        // ==============================
        // CSS Visibility Logic
        // ==============================
        $headerVisibility = 'visible';
        $footerVisibility = 'visible';

        // Header rules
        switch ($headerDisplayRule) {
            case 'none':
                $headerVisibility = 'hidden';
                break;
            case 'every-page':
                $footerVisibility = 'visible';
                break;
            default: // every-page
                $headerVisibility = 'visible';
        }

        // Footer rules
        switch ($footerDisplayRule) {
            case 'none':
                $footerVisibility = 'hidden';
                break;
            case 'every-page':
                $footerVisibility = 'visible';
                break;
            default:
                $footerVisibility = 'visible';
        }

        // ==============================
        // Bangun HTML untuk Dompdf
        // ==============================
        $fullHtml = "
        <html>
        <head>
            <style>
                @page {
                    margin: 0;
                }
                body {
                    font-family: '{$this->designer->getFontStyle()}';
                    margin: 0;
                    padding-top: {$paddingTop}px;
                    padding-bottom: {$paddingBottom}px;
                    box-sizing: border-box;
                }
                .pdf-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: {$headerHeight}px;
                    text-align: center;
                    visibility: {$headerVisibility};
                }
                .pdf-footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    min-height: {$footerHeight}px;
                    text-align: center;
                    box-sizing: border-box;
                    visibility: {$footerVisibility};
                }
            </style>
        </head>
        <body>
            <div class='pdf-header'>{$headerHtml}</div>
            <div class='pdf-footer'>{$footerHtml}</div>
            {$contentHtml}
        </body>
        </html>";
        // echo2file($fullHtml);


        // Muat dan render ke Dompdf
        $dompdf->loadHtml($fullHtml);
        $dompdf->setPaper($this->designer->getPaperSize(), $this->designer->getPaperOrientation());
        $dompdf->render();

        // Tambahkan nomor halaman
        $canvas = $dompdf->getCanvas();
        $font = $dompdf->getFontMetrics()->get_font("helvetica", "normal");

        // Ambil posisi dari PDFReportDesigner
        $pageNumberPosition = $this->designer->getPageNumberPosition();

        // Hanya render nomor halaman jika bukan "none"
        if ($pageNumberPosition !== 'none') {
            $canvas->page_script(function ($pageNumber, $pageCount, $canvas, $fontMetrics) use ($font, $pageNumberPosition) {
                $w = $canvas->get_width();
                $h = $canvas->get_height();
                $text = "Page $pageNumber of $pageCount";
                $fontSize = 10;

                // Hitung lebar teks
                $textWidth = $fontMetrics->getTextWidth($text, $font, $fontSize);

                // Default posisi (bottom-right)
                $x = $w - $textWidth - 40;
                $y = $h - 40;

                switch ($pageNumberPosition) {
                    // --- TOP POSITIONS ---
                    case 'top-left':
                        $x = 40;
                        $y = 40;
                        break;

                    case 'top-center':
                        $x = ($w - $textWidth) / 2;
                        $y = 40;
                        break;

                    case 'top-right':
                        $x = $w - $textWidth - 40;
                        $y = 40;
                        break;

                    // --- BOTTOM POSITIONS ---
                    case 'bottom-left':
                        $x = 40;
                        $y = $h - 40;
                        break;

                    case 'bottom-center':
                        $x = ($w - $textWidth) / 2;
                        $y = $h - 40;
                        break;

                    case 'bottom-right':
                        $x = $w - $textWidth - 40;
                        $y = $h - 40;
                        break;
                }

                $canvas->text($x, $y, $text, $font, $fontSize, [0, 0, 0]);
            });
        }


        // Metadata PDF
        $metadata = $this->designer->getMetadata();
        if (!empty($metadata['title']))
            $dompdf->addInfo('Title', $metadata['title']);
        if (!empty($metadata['author']))
            $dompdf->addInfo('Author', $metadata['author']);
        if (!empty($metadata['subject']))
            $dompdf->addInfo('Subject', $metadata['subject']);

        // Output ke browser
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo $dompdf->output();
        exit();
    }

}
