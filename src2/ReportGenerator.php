<?php

require_once 'DatabaseConnection.php';
require_once 'ExportHandler.php';
require_once 'ExportHandlerCSV.php';
require_once 'ExportHandlerExcel.php';
require_once 'ExportHandlerPDF.php';

class ReportGenerator extends DatabaseConnection {
    private ?PDFReportDesigner $designer;
    public function __construct(string $dbname, string $username = 'root', string $password = '', string $host = 'localhost', ?PDFReportDesigner $designer = null)
    {
        parent::__construct($host, $dbname, $username, $password);
        $this->designer = $designer ?? new PDFReportDesigner();
    }

    public function getTableData(string $query): array
    {
        $pdo = $this->connect();

        if ($pdo === null) {
            return [];
        }

        try {
            $statement = $pdo->prepare($query);
            $statement->execute();
            return $statement->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            echo "Query failed: " . $e->getMessage();
            return [];
        }
    }

    public function setDesignerPDF(PDFReportDesigner $designer): void
    {
        $this->designer = $designer;
    }

    public function export(string $query, string $type, string $filename): void
    {
        $data = $this->getTableData($query);

        if (empty($data)) {
            echo "Tidak ada data yang ditemukan.";
            return;
        }

        $exportHandler = match($type) {
            'csv' => new ExportHandlerCSV($data),
            'xlsx' => new ExportHandlerExcel($data),
            'pdf' => new ExportHandlerPDF($data, $this->designer),
            default => null,
        };

        if ($exportHandler !== null) {
            $exportHandler->export($filename);
        } else {
            echo "Tipe ekspor tidak dikenal.";
        }
    }
}
