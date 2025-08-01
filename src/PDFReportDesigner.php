<?php

class PDFReportDesigner
{
    private string $headerTableStyle = 'font-size: 14px; font-weight: bold; color: #000000; text-align: center; background-color: #ffffff; border: 1px solid #000000; padding: 8px;';
    private string $rowTableStyle = 'font-size: 12px; font-weight: normal; color: #000000; text-align: left; background-color: #f9f9f9; border: 1px solid #000000; padding: 6px;';
    private string $tableStyle = 'width: 100%; border-collapse: collapse; table-layout: fixed; word-wrap: break-word;';
    private string $fontStyle = 'font-family: Arial, sans-serif;';
    private array $headerStyle = [];
    private array $footerStyle = [];
    private string|array $paperSize = 'A4';
    private string $paperOrientation = 'portrait';
    private array $columnWidths = [];
    private array $customHeaders = [];
    private string $query = '';
    private string $bodyStyle = 'margin: 20px; padding: 50px; box-sizing: border-box; font-family: Arial, sans-serif; background-color: #ffffff;';


    // Metadata
    private string $metaTitle = '';
    private string $metaAuthor = '';
    private string $metaSubject = '';

    public function setHeaderTableStyle(string $headerTableStyle): void
    {
        $this->headerTableStyle = $headerTableStyle;
    }

    public function setRowTableStyle(string $rowTableStyle): void
    {
        $this->rowTableStyle = $rowTableStyle;
    }

    public function setTableStyle(string $tableStyle): void
    {
        $this->tableStyle = $tableStyle;
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

    public function setColumnWidths(array $widths): void
    {
        $this->columnWidths = $widths;
    }
    public function setHeaderStyle(array $headerStyle): void
    {
        // Ambil background-color dari bodyStyle
        $bgColor = $this->parseStyleStringToArray($this->bodyStyle)['background-color'] ?? '#ffffff';

        if (isset($headerStyle['rows']) && is_array($headerStyle['rows'])) {
            foreach ($headerStyle['rows'] as $i => $row) {
                foreach ($row as $j => $cell) {
                    if (isset($cell['styles']) && is_array($cell['styles'])) {
                        $cellStyles = [];

                        foreach ($cell['styles'] as $key => $value) {
                            // Lewati properti yang tidak diinginkan
                            if (in_array($key, ['display'])) {
                                continue;
                            }

                            // Ubah border jadi 1px solid warna bodyStyle
                            if (in_array($key, ['border', 'border-top', 'border-right', 'border-bottom', 'border-left'])) {
                                // $cellStyles[$key] = '1px solid ' . $bgColor;
                            } else {
                                $cellStyles[$key] = $value;
                            }
                        }

                        // Tambahkan vertical-align: top jika belum ada
                        if (!isset($cellStyles['vertical-align'])) {
                            $cellStyles['vertical-align'] = 'top';
                        }

                        $headerStyle['rows'][$i][$j]['styles'] = $cellStyles;
                    }
                }
            }
        }

        $this->headerStyle = $headerStyle;
    }


    public function setFooterStyle(array $footerStyle): void
    {
        // Ambil background-color dari bodyStyle
        $bgColor = $this->parseStyleStringToArray($this->bodyStyle)['background-color'] ?? '#ffffff';

        if (isset($footerStyle['rows']) && is_array($footerStyle['rows'])) {
            foreach ($footerStyle['rows'] as $i => $row) {
                foreach ($row as $j => $cell) {
                    if (isset($cell['styles']) && is_array($cell['styles'])) {
                        $cellStyles = [];

                        foreach ($cell['styles'] as $key => $value) {
                            // Lewati properti yang tidak diinginkan
                            if (in_array($key, ['display'])) {
                                continue;
                            }

                            // Ubah border jadi 1px solid warna bodyStyle
                            if (in_array($key, ['border', 'border-top', 'border-right', 'border-bottom', 'border-left'])) {
                                // $cellStyles[$key] = '1px solid ' . $bgColor;
                            } else {
                                $cellStyles[$key] = $value;
                            }
                        }

                        // Tambahkan vertical-align: top jika belum ada
                        if (!isset($cellStyles['vertical-align'])) {
                            $cellStyles['vertical-align'] = 'top';
                        }

                        $footerStyle['rows'][$i][$j]['styles'] = $cellStyles;
                    }
                }
            }
        }

        $this->footerStyle = $footerStyle;
    }


    public function setCustomHeaders(array $headers): void
    {
        $this->customHeaders = $headers;
    }

    public function setQuery(string $query): void
    {
        $this->query = $query;
    }

    public function setBodyStyle(string $bodyStyle): void
    {
        $this->bodyStyle = $bodyStyle;
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
    public function getHeaderStyle(): array
    {
        return $this->headerStyle;
    }
    public function getFooterStyle(): array
    {
        return $this->footerStyle;
    }

    public function getCustomHeaders(): array
    {
        return $this->customHeaders;
    }

    public function getQuery(): string
    {
        return $this->query;
    }

    public function getBodyStyle(): string
    {
        return $this->bodyStyle;
    }

    private function styleArrayToString(array $styleArray): string
    {
        $styleString = '';
        foreach ($styleArray as $key => $value) {
            $styleString .= $key . ': ' . $value . '; ';
        }
        return trim($styleString);
    }

    private function replacePlaceholders(string $text): string
    {
        $replacements = [
            '{{nama_perusahaan}}' => $this->metaAuthor ?: 'Perusahaan',
            '{{current_date}}' => date('Y-m-d'),
            // Tambahkan placeholder lainnya jika diperlukan
        ];

        return strtr($text, $replacements);
    }

    public function generateHTML(array $data): string
    {
        if (empty($data)) {
            return '<p>Tidak ada data untuk ditampilkan.</p>';
        }

        $html = '<html><head>
                <meta name="title" content="' . htmlspecialchars($this->metaTitle) . '">
                <meta name="author" content="' . htmlspecialchars($this->metaAuthor) . '">
                <meta name="subject" content="' . htmlspecialchars($this->metaSubject) . '">
                <style>
                    body { ' . $this->bodyStyle . ' }
                    @page {
                        margin: -20px;
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
                        box-sizing: border-box;
                        overflow: hidden;
                    }
                </style>
            </head><body>';

        // HEADER STYLE SECTION
        if (!empty($this->headerStyle['rows']) && is_array($this->headerStyle['rows'])) {
            // Hitung total kolom maksimum (untuk fallback distribusi width)
            $maxCols = 0;
            foreach ($this->headerStyle['rows'] as $row) {
                $colCount = 0;
                foreach ($row as $cell) {
                    $colspan = isset($cell['colspan']) ? (int) $cell['colspan'] : 1;
                    $colCount += $colspan;
                }
                if ($colCount > $maxCols) {
                    $maxCols = $colCount;
                }
            }

            $html .= '<table style="width: 100%; border-collapse: collapse;">';

            foreach ($this->headerStyle['rows'] as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $tag = $cell['tag'] ?? 'div';
                    $content = $this->replacePlaceholders($cell['content'] ?? '');
                    $colspanVal = $cell['colspan'] ?? 1;
                    $rowspanVal = $cell['rowspan'] ?? 1;

                    $colspan = $colspanVal > 1 ? 'colspan="' . $colspanVal . '"' : '';
                    $rowspan = $rowspanVal > 1 ? 'rowspan="' . $rowspanVal . '"' : '';

                    // Handle style
                    $styles = $cell['styles'] ?? [];

                    // Remove conflicting keys if width/height is separately defined
                    unset($styles['width'], $styles['height']);

                    // Convert styles array to string
                    $styleStr = $this->styleArrayToString($styles);

                    // Calculate or use defined width
                    if (isset($cell['width'])) {
                        $width = 'width: ' . $cell['width'] . ';';
                    } else {
                        $widthPercent = round(($colspanVal / $maxCols) * 100, 2);
                        $width = "width: {$widthPercent}%;";
                    }

                    $height = isset($cell['height']) ? 'height: ' . $cell['height'] . ';' : '';

                    $combinedStyles = $width . $height . $styleStr;

                    $html .= "<td $colspan $rowspan style='$combinedStyles'><$tag>" . htmlspecialchars($content) . "</$tag></td>";
                }
                $html .= '</tr>';
            }

            $html .= '</table>';
        }

        // DATA TABLE SECTION
        $html .= '<table style="' . $this->tableStyle . '">';
        $columns = array_keys($data[0]);

        // Header
        $html .= '<thead><tr>';
        foreach ($columns as $index => $column) {
            $customLabel = $this->customHeaders[$column] ?? $column;
            $width = $this->columnWidths[$index] ?? null;
            $widthStyle = $width ? "width: $width;" : "";
            $html .= '<th style="' . $widthStyle . $this->headerTableStyle . '">' . htmlspecialchars($customLabel) . '</th>';
        }
        $html .= '</tr></thead>';

        // Data rows
        $html .= '<tbody>';
        foreach ($data as $row) {
            $html .= '<tr>';
            $rowValues = array_values($row);
            foreach ($rowValues as $i => $cell) {
                $width = $this->columnWidths[$i] ?? null;
                $widthStyle = $width ? "width: $width;" : "";
                $html .= '<td style="' . $widthStyle . $this->rowTableStyle . '">' . htmlspecialchars($cell) . '</td>';
            }
            $html .= '</tr>';
        }
        $html .= '</tbody>';

        $html .= '</table>';

        // FOOTER STYLE SECTION
        if (!empty($this->footerStyle['rows']) && is_array($this->footerStyle['rows'])) {
            // Hitung total kolom maksimum (untuk fallback distribusi width)
            $maxCols = 0;
            foreach ($this->footerStyle['rows'] as $row) {
                $colCount = 0;
                foreach ($row as $cell) {
                    $colspan = isset($cell['colspan']) ? (int) $cell['colspan'] : 1;
                    $colCount += $colspan;
                }
                if ($colCount > $maxCols) {
                    $maxCols = $colCount;
                }
            }

            $html .= '<table style="width: 100%; border-collapse: collapse;">';

            foreach ($this->footerStyle['rows'] as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $tag = $cell['tag'] ?? 'div';
                    $content = $this->replacePlaceholders($cell['content'] ?? '');
                    $colspanVal = $cell['colspan'] ?? 1;
                    $rowspanVal = $cell['rowspan'] ?? 1;

                    $colspan = $colspanVal > 1 ? 'colspan="' . $colspanVal . '"' : '';
                    $rowspan = $rowspanVal > 1 ? 'rowspan="' . $rowspanVal . '"' : '';

                    // Handle style
                    $styles = $cell['styles'] ?? [];

                    // Remove conflicting keys if width/height is separately defined
                    unset($styles['width'], $styles['height']);

                    // Convert styles array to string
                    $styleStr = $this->styleArrayToString($styles);

                    // Calculate or use defined width
                    if (isset($cell['width'])) {
                        $width = 'width: ' . $cell['width'] . ';';
                    } else {
                        $widthPercent = round(($colspanVal / $maxCols) * 100, 2);
                        $width = "width: {$widthPercent}%;";
                    }

                    $height = isset($cell['height']) ? 'height: ' . $cell['height'] . ';' : '';

                    $combinedStyles = $width . $height . $styleStr;

                    $html .= "<td $colspan $rowspan style='$combinedStyles'><$tag>" . htmlspecialchars($content) . "</$tag></td>";
                }
                $html .= '</tr>';
            }

            $html .= '</table>';
        }

        $html .= '</body></html>';
        return $html;
    }


    public function getTemplateAsArray(): array
    {
        return [
            'query' => $this->query,
            'headerTableStyle' => $this->parseStyleStringToArray($this->headerTableStyle),
            'rowTableStyle' => $this->parseStyleStringToArray($this->rowTableStyle),
            'tableStyle' => $this->parseStyleStringToArray($this->tableStyle),
            'fontStyle' => $this->fontStyle,
            'paperSize' => $this->paperSize,
            'paperOrientation' => $this->paperOrientation,
            'columnWidths' => $this->columnWidths,
            'customHeaders' => $this->customHeaders,
            'metaTitle' => $this->metaTitle,
            'metaAuthor' => $this->metaAuthor,
            'metaSubject' => $this->metaSubject,
            'bodyStyle' => $this->parseStyleStringToArray($this->bodyStyle),
            'headerStyle' => $this->headerStyle,
            'footerStyle' => $this->footerStyle,
        ];
    }

    private function parseStyleStringToArray(string $style): array
    {
        $styleArray = [];
        $rules = explode(';', $style);
        foreach ($rules as $rule) {
            if (strpos($rule, ':') !== false) {
                list($key, $value) = explode(':', $rule, 2);
                $styleArray[trim($key)] = trim($value);
            }
        }
        return $styleArray;
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
