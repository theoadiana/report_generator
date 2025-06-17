<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/DatabaseConnection.php';
require_once __DIR__ . '/../src/ExportHandler.php';
require_once __DIR__ . '/../src/ExportHandlerCSV.php';
require_once __DIR__ . '/../src/ExportHandlerPDF.php';
require_once __DIR__ . '/../src/ExportHandlerExcel.php';
require_once __DIR__ . '/../src/ReportGenerator.php';
require_once __DIR__ . '/../src/PDFReportDesigner.php';

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
        // Ambil parameter dan decode JSON style (jika tersedia)
        function getStyleFromQuery(string $key, string $default): string {
            if (!isset($_GET[$key])) return $default;
            $json = urldecode($_GET[$key]);
            $arr = json_decode($json, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($arr)) {
                // Ubah array menjadi string style: "key1: value1; key2: value2;"
                return implode('; ', array_map(fn($k, $v) => "$k: $v", array_keys($arr), $arr)) . ';';
            }
            return $default;
        }
    
        $title = $_GET['title'] ?? 'Laporan';
        $titleStyle = getStyleFromQuery('titleStyle', 'font-size: 3px;');
        $headerStyle = getStyleFromQuery('headerStyle', 'font-size: 16px; font-weight: bold;');
        $rowStyle = getStyleFromQuery('rowStyle', 'font-size: 12px;');
        $tableStyle = getStyleFromQuery('tableStyle', 'width: 100%; border-collapse: collapse;');
    
        $headerColor = $_GET['headerColor'] ?? '#f0f0f0';
        $paperSize = $_GET['paperSize'] ?? 'A4';
        $customWidth = isset($_GET['customWidth']) ? (float)$_GET['customWidth'] * 2.83464567 : 0.0;
        $customHeight = isset($_GET['customHeight']) ? (float)$_GET['customHeight'] * 2.83464567 : 0.0;
        $paperOrientation = $_GET['paperOrientation'] ?? 'portrait';
        $metaTitle = $_GET['metaTitle'] ?? '';
        $metaAuthor = $_GET['metaAuthor'] ?? '';
        $metaSubject = $_GET['metaSubject'] ?? '';
        $footer = $_GET['footer'] ?? '';
        $columnWidths = isset($_GET['columnWidths']) ? json_decode(urldecode($_GET['columnWidths']), true) : [];

    
        // Buat designer
        $designer = new PDFReportDesigner();
        $designer->setTitle($title);
        $designer->setTitleStyle($titleStyle);
        $designer->setHeaderStyle($headerStyle);
        $designer->setRowStyle($rowStyle);
        $designer->setTableStyle($tableStyle);
        $designer->setHeaderColor($headerColor);
    
        if ($paperSize === 'custom') {
            $designer->setPaperSize([0, 0, $customWidth, $customHeight]);
        } else {
            $designer->setPaperSize($paperSize);
        }
    
        $designer->setPaperOrientation($paperOrientation);
        $designer->setMetadata($metaTitle, $metaAuthor, $metaSubject);
        $designer->setFooter($footer);
        if (!empty($columnWidths) && is_array($columnWidths)) {
            $designer->setColumnWidths($columnWidths);
            // echo2file("columnWidths OK: " . json_encode($columnWidths));
        } else {
            // echo2file("columnWidths is empty or invalid");
        }
        
    
        // Debug log (optional)
        // echo2file("columnWidths: $columnWidths");
    
        // Kirim ke report generator
        $reportGenerator->setDesignerPDF($designer);
    }
    

    // Mengekspor file
    $reportGenerator->export($query, $type, $filename);

}

function echo2file_arr($handle, $arr, $space) {
    $space += 2;
    fwrite($handle, "\n");
    foreach($arr as $key=>$value)
        if (is_array($value)) {
            fwrite($handle, $key . "=>");
            echo2file_arr($handle,$value,$space);
        } else {
            fwrite($handle, str_repeat("",$space).$key."=>".$value."\n");
        }
}

function echo2file($par) {
    $handle = fopen("errorCheckPHP.txt",'a');
    if (is_array($par)) echo2file_arr($handle,$par,0);
    else fwrite($handle, $par."\n");
}