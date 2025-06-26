<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/DatabaseConnection.php';
require_once __DIR__ . '/../src/ExportHandler.php';
require_once __DIR__ . '/../src/ExportHandlerCSV.php';
require_once __DIR__ . '/../src/ExportHandlerPDF.php';
require_once __DIR__ . '/../src/ExportHandlerExcel.php';
require_once __DIR__ . '/../src/ReportGenerator.php';
require_once __DIR__ . '/../src/PDFReportDesigner.php';
require_once __DIR__ . '/../src/Utility.php';

// Konfigurasi database
$host = 'localhost';
$dbname = 'stok_gudang_djohartex';
$username = 'root';
$password = '';

// Membuat instance ReportGenerator
$reportGenerator = new ReportGenerator($dbname, $username, $password, $host);

// Handle request save template
if (isset($_GET['action']) && $_GET['action'] === 'save_template_PDF') {
    header('Content-Type: text/plain');

    $query = "SELECT * FROM pencatatan"; // Query contoh
    $designer = buildDesignerFromRequest();

    // Simpan template
    savePDFTemplate($designer->getTemplateAsArray()); // Jika ingin simpan struktur saja
    // Jika ingin simpan dengan data: saveHTMLTemplate($designer->generateHTML($reportGenerator->getTableData($query)));

    echo 'Template berhasil disimpan.';
    exit;
}

// Handle permintaan data JSON dari DB
if (isset($_GET['action']) && $_GET['action'] === 'get_data') {
    header('Content-Type: application/json');

    try {
        $query = "SELECT * FROM pencatatan LIMIT 10";
        $data = $reportGenerator->getTableData($query);
        echo json_encode($data);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }

    exit;
}

// Proses Export File
if (isset($_GET['type'])) {
    $type = $_GET['type'] ?? '';
    $filename = 'laporan_' . date('Y-m-d') . '.' . $type;

    $query = "SELECT * FROM pencatatan";

    if ($type === 'pdf') {
        $designer = buildDesignerFromRequest();
        $reportGenerator->setDesignerPDF($designer);
    }

    $reportGenerator->export($query, $type, $filename);
}

/**
 * Builder Designer dari parameter URL
 */
function buildDesignerFromRequest(): PDFReportDesigner {
    function getStyleFromQuery(string $key, string $default): string {
        if (!isset($_GET[$key])) return $default;
        $json = urldecode($_GET[$key]);
        $arr = json_decode($json, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($arr)) {
            return implode('; ', array_map(fn($k, $v) => "$k: $v", array_keys($arr), $arr)) . ';';
        }
        return $default;
    }

    $title = $_GET['title'] ?? 'Laporan';
    $titleStyle = getStyleFromQuery('titleStyle', 'font-size: 24px;');
    $headerStyle = getStyleFromQuery('headerStyle', 'font-size: 14px; font-weight: bold;');
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

    $customHeaders = [];
    if (isset($_GET['headers'])) {
        $decoded = json_decode(urldecode($_GET['headers']), true);
        if (is_array($decoded)) {
            $customHeaders = $decoded;
        }
    }

    $designer = new PDFReportDesigner();
    $designer->setTitle($title);
    $designer->setTitleStyle($titleStyle);
    $designer->setHeaderStyle($headerStyle);
    $designer->setRowStyle($rowStyle);
    $designer->setTableStyle($tableStyle);
    $designer->setHeaderColor($headerColor);
    $designer->setCustomHeaders($customHeaders);

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
    }

    return $designer;
}

function echo2file_arr($handle, $arr, $space) {
    $space += 2;
    fwrite($handle, "\n");
    foreach ($arr as $key => $value) {
        if (is_array($value)) {
            fwrite($handle, $key . "=>");
            echo2file_arr($handle, $value, $space);
        } else {
            fwrite($handle, str_repeat("", $space) . $key . "=>" . $value . "\n");
        }
    }
}

function echo2file($par) {
    $handle = fopen("errorCheckPHP.txt", 'a');
    if (is_array($par)) echo2file_arr($handle, $par, 0);
    else fwrite($handle, $par . "\n");
    fclose($handle);
}
?>
