<?php

require_once 'ExportHandler.php';
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
        $options->set('defaultFont', $this->designer->getFontStyle());
        $dompdf = new Dompdf($options);

        $html = $this->designer->generateHTML($this->data);

        $dompdf->loadHtml($html);
        // Dapatkan paper size dan orientasi
        $paperSize = $this->designer->getPaperSize();
        $orientation = $this->designer->getPaperOrientation();

        // Jika paper size adalah array (custom), gunakan paper size kustom
        if (is_array($paperSize)) {
            // Format paper: [0, 0, width, height]
            $dompdf->setPaper($paperSize, $orientation);
        } else {
            // Jika menggunakan ukuran kertas standar (misalnya "A4")
            $dompdf->setPaper($paperSize, $orientation);
        }
        $dompdf->render();

        $metadata = $this->designer->getMetadata();

        if (!empty($metadata['title'])) {
            $dompdf->addInfo('Title', $metadata['title']);
        }
        if (!empty($metadata['author'])) {
            $dompdf->addInfo('Author', $metadata['author']);
        }
        if (!empty($metadata['subject'])) {
            $dompdf->addInfo('Subject', $metadata['subject']);
        }


        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        echo $dompdf->output();
        exit();
    }
}
