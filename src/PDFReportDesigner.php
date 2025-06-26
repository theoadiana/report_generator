<?php

class PDFReportDesigner
{
    private string $title = '';
    private string $titleStyle = '';
    private string $headerStyle = 'font-size: 16px; font-weight: bold; text-align: left; background-color: #f0f0f0;';
    private string $rowStyle = 'font-size: 12px;';
    private string $tableStyle = 'width: 100%; border-collapse: collapse;';
    private string $headerColor = '#f0f0f0';
    private string $fontStyle = 'font-family: Arial, sans-serif;';
    private string|array $paperSize = 'A4';
    private string $paperOrientation = 'portrait';
    private string $footer = '';
    private array $columnWidths = [];
    private array $customHeaders = [];


    // Metadata
    private string $metaTitle = '';
    private string $metaAuthor = '';
    private string $metaSubject = '';

    // Setter untuk judul
    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function setTitleStyle(string $titleStyle): void
    {
        $this->titleStyle = $titleStyle;
    }

    public function setHeaderStyle(string $headerStyle): void
    {
        $this->headerStyle = $headerStyle;
    }

    public function setRowStyle(string $rowStyle): void
    {
        $this->rowStyle = $rowStyle;
    }

    public function setTableStyle(string $tableStyle): void
    {
        $this->tableStyle = $tableStyle;
    }

    public function setHeaderColor(string $headerColor): void
    {
        $this->headerColor = $headerColor;
    }

    public function setFontStyle(string $fontStyle): void
    {
        $this->fontStyle = $fontStyle;
    }

    public function setPaperSize(array|string $paperSize): void
    {
        $this->paperSize = $paperSize;
    }

    public function setPaperOrientation(string $paperOrientation): void
    {
        $this->paperOrientation = $paperOrientation;
    }

    public function setMetadata(string $metaTitle, string $metaAuthor, string $metaSubject): void
    {
        $this->metaTitle = $metaTitle;
        $this->metaAuthor = $metaAuthor;
        $this->metaSubject = $metaSubject;
    }

    public function setFooter(string $footer): void
    {
        $this->footer = $footer;
    }

    public function setColumnWidths(array $widths): void
    {
        $this->columnWidths = $widths;
    }

    public function setCustomHeaders(array $headers): void
    {
        $this->customHeaders = $headers;
    }


    public function getTitleStyle(): string
    {
        return $this->titleStyle;
    }

    public function getFontStyle(): string
    {
        return $this->fontStyle;
    }


    public function getPaperSize(): array|string
    {
        return $this->paperSize;
    }

    public function getPaperOrientation(): string
    {
        return $this->paperOrientation;
    }

    public function getMetadata(): array
    {
        return [
            'title' => $this->metaTitle,
            'author' => $this->metaAuthor,
            'subject' => $this->metaSubject
        ];
    }

    public function getColumnWidths(): array
    {
        return $this->columnWidths;
    }

    public function getCustomHeaders(): array
    {
        return $this->customHeaders;
    }


    public function generateHTML(array $data): string
    {
        if (empty($data)) {
            return '<p>Tidak ada data untuk ditampilkan.</p>';
        }

        $footerText = addslashes($this->footer); // Hindari karakter khusus

        $html = '<html><head>
        <meta name="title" content="' . htmlspecialchars($this->metaTitle) . '">
        <meta name="author" content="' . htmlspecialchars($this->metaAuthor) . '">
        <meta name="subject" content="' . htmlspecialchars($this->metaSubject) . '">
        <style>
            body { ' . $this->fontStyle . ' }
            @page {
                margin: 100px 50px 100px 50px;
            }
            table {
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse;
                word-wrap: break-word;
            }
            th, td {
                max-width: 100%;
                border: 1px solid #000;
                padding: 8px;
            }
        </style>
    </head><body>';

        // Judul
        if (!empty($this->title)) {
            $html .= '<h1 style="' . $this->titleStyle . '">' . htmlspecialchars($this->title) . '</h1>';
        }

        // Tabel
        $html .= '<table style="' . $this->tableStyle . '">';
        $columns = array_keys($data[0]);

        // Header
        $html .= '<thead><tr>';
        foreach ($columns as $index => $column) {
            $customLabel = $this->customHeaders[$column] ?? $column;
            $width = $this->columnWidths[$index] ?? null;
            $widthStyle = $width ? "width: $width;" : "";
            $html .= '<th style="' . $widthStyle . $this->headerStyle . '">' . htmlspecialchars($customLabel) . '</th>';
        }
        $html .= '</tr></thead>';

        // Data
        $html .= '<tbody>';
        foreach ($data as $row) {
            $html .= '<tr>';
            $rowValues = array_values($row);
            foreach ($rowValues as $i => $cell) {
                $width = $this->columnWidths[$i] ?? null;
                $widthStyle = $width ? "width: $width;" : "";
                $html .= '<td style="' . $widthStyle . $this->rowStyle . '">' . htmlspecialchars($cell) . '</td>';
            }
            $html .= '</tr>';
        }
        $html .= '</tbody>';

        // Footer tabel opsional (HTML level)
        if (!empty($this->footer)) {
            $html .= '<tfoot><tr><td colspan="' . count($columns) . '" style="text-align: center; font-weight: bold;">' . htmlspecialchars($this->footer) . '</td></tr></tfoot>';
        }

        $html .= '</table>';

        // Footer PDF (page number)
        $html .= '
    <script type="text/php">
        if (isset($pdf)) {
            $pdf->page_script(function ($pageNumber, $pageCount, $pdf) {
                $font = $pdf->getFontMetrics()->getFont("Helvetica", "normal");
                $text = "' . $footerText . ' - Halaman $pageNumber dari $pageCount";
                $width = $pdf->get_width();
                $textWidth = $pdf->getFontMetrics()->getTextWidth($text, $font, 10);
                $x = ($width - $textWidth) / 2;
                $pdf->text($x, 820, $text, $font, 10);
            });
        }
    </script>';

        $html .= '</body></html>';

        echo2file($html); // Logging ke file jika diperlukan
        return $html;
    }

    public function getTemplateAsArray(): array
    {
        $template = [
            'title' => $this->title,
            'titleStyle' => $this->titleStyle,
            'headerStyle' => $this->headerStyle,
            'rowStyle' => $this->rowStyle,
            'tableStyle' => $this->tableStyle,
            'headerColor' => $this->headerColor,
            'fontStyle' => $this->fontStyle,
            'paperSize' => $this->paperSize,
            'paperOrientation' => $this->paperOrientation,
            'footer' => $this->footer,
            'columnWidths' => $this->columnWidths,
            'customHeaders' => $this->customHeaders,
            'metaTitle' => $this->metaTitle,
            'metaAuthor' => $this->metaAuthor,
            'metaSubject' => $this->metaSubject
        ];

        return $template;
    }


    public function echo2file_arr($handle, $arr, $space)
    {
        $space += 2;
        fwrite($handle, "\n");
        foreach ($arr as $key => $value)
            if (is_array($value)) {
                fwrite($handle, $key . "=>");
                echo2file_arr($handle, $value, $space);
            } else {
                fwrite($handle, str_repeat("", $space) . $key . "=>" . $value . "\n");
            }
    }

    public function echo2file($par)
    {
        $handle = fopen("errorCheckPHP.txt", 'a');
        if (is_array($par))
            echo2file_arr($handle, $par, 0);
        else
            fwrite($handle, $par . "\n");
    }

}
