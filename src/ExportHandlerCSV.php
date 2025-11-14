<?php
namespace Theob\ReportGenerator;
class ExportHandlerCSV extends ExportHandler {
    public function export(string $filename = 'export.csv'): void
    {
        if (empty($this->data)) {
            echo 'Tidak ada data untuk diekspor.';
            return;
        }

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        $output = fopen('php://output', 'w');

        fputcsv($output, array_keys($this->data[0], "\t"));

        foreach ($this->data as $row) {
            fputcsv($output, $row, "\t");
        }

        fclose($output);
        exit();
    }
}
