<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src2/DatabaseConnection.php';
require_once __DIR__ . '/../src2/ExportHandler.php';
require_once __DIR__ . '/../src2/ExportHandlerCSV.php';
require_once __DIR__ . '/../src2/ExportHandlerPDF.php';
require_once __DIR__ . '/../src2/ExportHandlerExcel.php';
require_once __DIR__ . '/../src2/ReportGenerator.php';
require_once __DIR__ . '/../src2/PDFReportDesigner.php';

// Konfigurasi database
$host = 'localhost';
$dbname = 'stok_gudang_djohartex';
$username = 'root';
$password = '';

// Membuat instance ReportGenerator
$reportGenerator = new ReportGenerator($dbname, $username, $password, $host);

// Handle permintaan data JSON dari DB
if (isset($_GET['action']) && $_GET['action'] === 'get_data') {
    header('Content-Type: application/json');

    try {
        $query = "SELECT * FROM pencatatan LIMIT 10"; // Query untuk contoh data
        $data = $reportGenerator->getTableData($query);
        echo json_encode($data);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit;
}

// Mendapatkan tipe ekspor dari URL
if (isset($_GET['type'])) {
    $type = $_GET['type'] ?? ''; // 'csv', 'excel', atau 'pdf'
    $filename = 'laporan_' . date('Y-m-d') . '.' . $type;

    // Mendefinisikan query
    $query = "SELECT * FROM pencatatan";
    // $data = $reportGenerator->getTableData($query);

    if ($type === 'pdf') {
        $title = $_GET['title'] ?? 'Laporan';
        $headerStyle = $_GET['headerStyle'] ?? 'font-size: 16px; font-weight: bold;';
        $rowStyle = $_GET['rowStyle'] ?? 'font-size: 12px;';
        $tableStyle = $_GET['tableStyle'] ?? 'width: 100%; border-collapse: collapse;';
        $headerColor = $_GET['headerColor'] ?? '#f0f0f0';
        $borderStyle = $_GET['borderStyle'] ?? '1px solid #000';
        $paperSize = $_GET['paperSize'] ?? 'A4';
        $customWidth = $_GET['customWidth'] * 2.83464567 ?? 0;
        $customHeight = $_GET['customHeight'] * 2.83464567 ?? 0;
        $paperOrientation = $_GET['paperOrientation'] ?? 'portrait';
        $metaTitle = $_GET['metaTitle'] ?? '';
        $metaAuthor = $_GET['metaAuthor'] ?? '';
        $metaSubject = $_GET['metaSubject'] ?? '';
        $footer = $_GET['footer'] ?? '';


        $designer = new PDFReportDesigner();
        $designer->setTitle($title);
        $designer->setHeaderStyle($headerStyle);
        $designer->setRowStyle($rowStyle);
        $designer->setTableStyle($tableStyle);
        $designer->setHeaderColor($headerColor);
        $designer->setBorderStyle($borderStyle);
        if ($paperSize === 'custom') {
            $designer->setPaperSize([0, 0, $customWidth, $customHeight]);
        } else {
            $designer->setPaperSize($paperSize);
        }
        $designer->setPaperOrientation($paperOrientation);
        $designer->setMetadata($metaTitle, $metaAuthor, $metaSubject);
        $designer->setFooter($footer);

        // Set desain ke ReportGenerator
        $reportGenerator->setDesignerPDF($designer);
    }

    // Mengekspor file
    $reportGenerator->export($query, $type, $filename);

}