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
    private string $headerDisplayRule = 'every-page'; // "every-page" atau "first-page-only"
    private string $footerDisplayRule = 'every-page'; // "every-page" atau "last-page-only"
    private string $pageNumberPosition = 'none';

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
                                $cellStyles[$key] = 'none';
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
                                $cellStyles[$key] = 'none';
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

    public function setHeaderDisplayRule(string $rule): void
    {
        $allowed = ['every-page', 'first-page-only', 'last-page-only', 'none'];
        $this->headerDisplayRule = in_array($rule, $allowed) ? $rule : 'every-page';
    }

    public function setPageNumberPosition(string $rule): void
    {
        $allowed = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'none'];
        $this->pageNumberPosition = in_array($rule, $allowed) ? $rule : 'none';
    }

    public function setFooterDisplayRule(string $rule): void
    {
        $allowed = ['every-page', 'first-page-only', 'last-page-only', 'none'];
        $this->footerDisplayRule = in_array($rule, $allowed) ? $rule : 'every-page';
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

    public function getHeaderDisplayRule(): string
    {
        return $this->headerDisplayRule;
    }

    public function getFooterDisplayRule(): string
    {
        return $this->footerDisplayRule;
    }

    public function getPageNumberPosition(): string
    {
        return $this->pageNumberPosition;
    }

    public function getBodyMarginTop(): string
    {
        $bodyStyleArray = $this->parseStyleStringToArray($this->bodyStyle);

        // Jika ada margin-top gunakan itu, jika tidak ada gunakan margin umum, default 20mm
        return $bodyStyleArray['margin-top']
            ?? $bodyStyleArray['margin']
            ?? '20mm';
    }

    public function getBodyMarginBottom(): string
    {
        $bodyStyleArray = $this->parseStyleStringToArray($this->bodyStyle);

        // Jika ada margin-bottom gunakan itu, jika tidak ada gunakan margin umum, default 20mm
        return $bodyStyleArray['margin-bottom']
            ?? $bodyStyleArray['margin']
            ?? '20mm';
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

        $bodyStyleArray = $this->parseStyleStringToArray($this->bodyStyle);

        // Ambil margin dengan unit default mm (lebih akurat untuk PDF)
        $marginTop = $bodyStyleArray['margin-top'] ?? ($bodyStyleArray['margin'] ?? '20mm');
        $marginRight = $bodyStyleArray['margin-right'] ?? ($bodyStyleArray['margin'] ?? '20mm');
        $marginBottom = $bodyStyleArray['margin-bottom'] ?? ($bodyStyleArray['margin'] ?? '20mm');
        $marginLeft = $bodyStyleArray['margin-left'] ?? ($bodyStyleArray['margin'] ?? '20mm');

        $html = '<html><head>
        <meta name="title" content="' . htmlspecialchars($this->metaTitle) . '">
        <meta name="author" content="' . htmlspecialchars($this->metaAuthor) . '">
        <meta name="subject" content="' . htmlspecialchars($this->metaSubject) . '">
        <style>
            body {
                font-family: sans-serif;
                font-size: 12pt;
            }
            @page {
                margin-top: ' . $marginTop . ';
                margin-right: ' . $marginRight . ';
                margin-bottom: ' . $marginBottom . ';
                margin-left: ' . $marginLeft . ';
            }
            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                word-wrap: break-word;
            }
            th, td {
                max-width: 100%;
                border: 1px solid #000;
                overflow: hidden;
            }
            .pdf-header {
                left: 0;
                right: 0;
                margin-left: ' . $marginLeft . ';
                margin-right: ' . $marginRight . ';
            }
            .pdf-footer {
                left: 0;
                right: 0;
                margin-left: ' . $marginLeft . ';
                margin-right: ' . $marginRight . ';
                margin-bottom: ' . $marginBottom . ';
            }
            .fixed-top { position: fixed; top: 0; }
            .fixed-bottom { position: fixed; bottom: 0; }
        </style>
    </head><body>';

        // ================= HEADER SECTION =================
        // if (!empty($this->headerStyle['rows']) && is_array($this->headerStyle['rows']) && $this->headerDisplayRule !== 'none') {
        //     $maxCols = 0;
        //     foreach ($this->headerStyle['rows'] as $row) {
        //         $colCount = 0;
        //         foreach ($row as $cell) {
        //             $colCount += isset($cell['colspan']) ? (int) $cell['colspan'] : 1;
        //         }
        //         if ($colCount > $maxCols) {
        //             $maxCols = $colCount;
        //         }
        //     }

        //     // Tambahkan margin-bottom agar tabel data tidak tertutup header
        //     $headerHtml = '<table style="width:100%; border-collapse: collapse; margin-bottom:10px;">';
        //     foreach ($this->headerStyle['rows'] as $row) {
        //         $headerHtml .= '<tr>';
        //         foreach ($row as $cell) {
        //             $tag = $cell['tag'] ?? 'div';
        //             $content = $this->replacePlaceholders($cell['content'] ?? '');
        //             $colspanVal = $cell['colspan'] ?? 1;
        //             $rowspanVal = $cell['rowspan'] ?? 1;
        //             $colspan = $colspanVal > 1 ? 'colspan="' . $colspanVal . '"' : '';
        //             $rowspan = $rowspanVal > 1 ? 'rowspan="' . $rowspanVal . '"' : '';

        //             $styles = $cell['styles'] ?? [];
        //             unset($styles['width'], $styles['height']);
        //             $styleStr = $this->styleArrayToString($styles);

        //             $widthPercent = round(($colspanVal / $maxCols) * 100, 2);
        //             $width = "width: {$widthPercent}%;";
        //             $height = isset($cell['height']) ? 'height: ' . $cell['height'] . ';' : '';
        //             $combinedStyles = $width . $height . $styleStr;

        //             $headerHtml .= "<td $colspan $rowspan style='$combinedStyles'><$tag>" . htmlspecialchars($content) . "</$tag></td>";
        //         }
        //         $headerHtml .= '</tr>';
        //     }
        //     $headerHtml .= '</table>';

        //     $html .= $headerHtml;
        // }


        // ================= DATA TABLE SECTION =================
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

        // ================= FOOTER SECTION =================
        // if (!empty($this->footerStyle['rows']) && is_array($this->footerStyle['rows']) && $this->footerDisplayRule !== 'none') {
        //     $footerClass = "pdf-footer fixed-bottom";

        //     $html .= '<div class="' . $footerClass . '"><table>';

        //     foreach ($this->footerStyle['rows'] as $row) {
        //         $html .= '<tr>';
        //         foreach ($row as $cell) {
        //             $tag = $cell['tag'] ?? 'div';
        //             $content = $this->replacePlaceholders($cell['content'] ?? '');
        //             $colspanVal = $cell['colspan'] ?? 1;
        //             $rowspanVal = $cell['rowspan'] ?? 1;
        //             $colspan = $colspanVal > 1 ? 'colspan="' . $colspanVal . '"' : '';
        //             $rowspan = $rowspanVal > 1 ? 'rowspan="' . $rowspanVal . '"' : '';

        //             $styles = $cell['styles'] ?? [];
        //             unset($styles['width'], $styles['height']);
        //             $styleStr = $this->styleArrayToString($styles);

        //             if (isset($cell['width'])) {
        //                 $width = 'width: ' . $cell['width'] . ';';
        //             } else {
        //                 $widthPercent = round(($colspanVal / $maxCols) * 100, 2);
        //                 $width = "width: {$widthPercent}%;";
        //             }

        //             $height = isset($cell['height']) ? 'height: ' . $cell['height'] . ';' : '';
        //             $combinedStyles = $width . $height . $styleStr;

        //             $html .= "<td $colspan $rowspan style='$combinedStyles'><$tag>" . htmlspecialchars($content) . "</$tag></td>";
        //         }
        //         $html .= '</tr>';
        //     }

        //     $html .= '</table></div>';
        // }

        $html .= '</body></html>';
        // echo2file($html);
        return $html;
    }

    public function getHeaderHTML(): string
    {
        if (empty($this->headerStyle['rows']) || !is_array($this->headerStyle['rows'])) {
            return '';
        }

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

        // Bangun tabel header
        $html = '<table style="width: 100%; border-collapse: collapse;">';

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

        return $html;
    }


    public function getFooterHTML(): string
    {
        if (empty($this->footerStyle['rows']) || !is_array($this->footerStyle['rows'])) {
            return '';
        }

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

        // Bangun tabel footer dengan batas bawah agar tidak hilang dari kertas
        $html = '<div style="border-bottom: 1px solid transparent; min-height: 10mm;">';
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

        $html .= '</table></div>';

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
            'headerDisplayRule' => $this->headerDisplayRule,
            'footerDisplayRule' => $this->footerDisplayRule,
            'pageNumberPosition' => $this->pageNumberPosition,
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
