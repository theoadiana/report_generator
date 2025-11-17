<?php
namespace Theob\ReportGenerator;
require_once __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ExportHandlerExcel extends ExportHandler {

    public function export(string $filename = 'export.xlsx'): void
    {
        if (empty($this->data)) {
            echo 'Tidak ada data untuk diekspor.';
            return;
        }

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $columns = array_keys($this->data[0]);
        $columnIndex = 'A';

        foreach ($columns as $column) {
            $sheet->setCellValue($columnIndex . '1', $column);
            $columnIndex++;
        }

        $rowIndex = 2;
        foreach ($this->data as $row) {
            $columnIndex = 'A';
            foreach ($row as $cellValue) {
                $sheet->setCellValue($columnIndex . $rowIndex, $cellValue);
                $columnIndex++;
            }
            $rowIndex++;
        }

        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        $writer->save('php://output');
        exit();
    }
}
