<?php

class PDFReportDesigner
{
    private string $title = '';
    private string $headerStyle = 'font-size: 16px; font-weight: bold; text-align: left; background-color: #f0f0f0;';
    private string $rowStyle = 'font-size: 12px;';
    private string $tableStyle = 'width: 100%; border-collapse: collapse;';
    private string $headerColor = '#f0f0f0';
    private string $borderStyle = '1px solid #000';
    private string $fontStyle = 'font-family: Arial, sans-serif;';
    private string|array $paperSize = 'A4';
    private string $paperOrientation = 'portrait';

    // Metadata
    private string $metaTitle = '';
    private string $metaAuthor = '';
    private string $metaSubject = '';

    // Setter untuk judul
    public function setTitle(string $title): void
    {
        $this->title = $title;
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

    public function setBorderStyle(string $borderStyle): void
    {
        $this->borderStyle = $borderStyle;
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

    public function generateHTML(array $data): string
    {
        if (empty($data)) {
            return '<p>Tidak ada data untuk ditampilkan.</p>';
        }

        $html = '<html><head><style>body{' . $this->fontStyle . '}</style></head><body>';

        if (!empty($this->title)) {
            $html .= '<h1 style="text-align: center;">' . htmlspecialchars($this->title) . '</h1>';
        }

        $html .= '<table style="' . $this->tableStyle . '" border="1">';
        $html .= '<tr style="background-color: ' . $this->headerColor . ';">';

        foreach (array_keys($data[0]) as $column) {
            $html .= '<th style="' . $this->headerStyle . '">' . htmlspecialchars($column) . '</th>';
        }
        $html .= '</tr>';

        foreach ($data as $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $html .= '<td style="' . $this->rowStyle . '; border: ' . $this->borderStyle . ';">' . htmlspecialchars($cell) . '</td>';
            }
            $html .= '</tr>';
        }

        $html .= '</table></body></html>';
        return $html;
    }
}
