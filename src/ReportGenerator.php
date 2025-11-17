<?php
namespace Theob\ReportGenerator;
use PDO, PDOException;

class ReportGenerator extends DatabaseConnection
{
    private ?PDFReportDesigner $designer;
    private string $query = '';

    public function __construct(string $dbname, string $username = 'root', string $password = '', string $host = 'localhost', ?PDFReportDesigner $designer = null)
    {
        parent::__construct($host, $dbname, $username, $password);
        $this->designer = $designer ?? new PDFReportDesigner();
    }

    public function setQuery(string $query): void
    {
        $this->query = $query;
    }

    public function getQuery(): string
    {
        return $this->query;
    }

    public function getTableData(?string $query = null): array
    {
        $pdo = $this->connect();

        if ($pdo === null) {
            return [];
        }

        $queryToExecute = $query ?? $this->query;

        if (empty($queryToExecute)) {
            echo "Query kosong.";
            return [];
        }

        try {
            $statement = $pdo->prepare($queryToExecute);
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
    public function getDesignerPDF(): ?PDFReportDesigner
    {
        return $this->designer;
    }


    public function export(?string $query = null, string $type, string $filename): void
    {
        $data = $this->getTableData($query);

        if (empty($data)) {
            echo "Tidak ada data yang ditemukan.";
            return;
        }

        $exportHandler = match ($type) {
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
