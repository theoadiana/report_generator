<?php
namespace Theob\ReportGenerator;
use Exception;
session_start();

require_once __DIR__ . '/../vendor/autoload.php';
// require_once __DIR__ . '/DatabaseConnection.php';
// require_once __DIR__ . '/ExportHandler.php';
// require_once __DIR__ . '/ExportHandlerCSV.php';
// require_once __DIR__ . '/ExportHandlerPDF.php';
// require_once __DIR__ . '/ExportHandlerExcel.php';
// require_once __DIR__ . '/ReportGenerator.php';
// require_once __DIR__ . '/PDFReportDesigner.php';
// require_once __DIR__ . '/Utility.php';
require_once __DIR__ . '/../reportGenerator.config.php';

// Untuk debug, panggil ini dulu
// ProjectRootFinder::debug();

// Kemudian cari root
// $rootPath = ProjectRootFinder::find();
// echo "Project root: " . $rootPath . "\n";
// Buat instance ReportGenerator
$reportGenerator = new ReportGenerator($dbname, $username, $password, $host);

// ✅ Ambil query dari session jika ada
if (isset($_SESSION['report_query'])) {
    $reportGenerator->setQuery($_SESSION['report_query']);
    if ($reportGenerator->getDesignerPDF()) {
        $reportGenerator->getDesignerPDF()->setQuery($_SESSION['report_query']); // ✅ Simpan ke designer
    }
}



// Handle edit/rename template
if (isset($_GET['action']) && $_GET['action'] === 'edit_template') {
    header('Content-Type: application/json');

    $templateDir = __DIR__ . '/../template_report_generator_pdf';

    $input = json_decode(file_get_contents('php://input'), true);
    $oldName = basename($input['oldName'] ?? '');
    $newName = basename($input['newName'] ?? '');

    if (!$oldName || !$newName) {
        echo json_encode(['success' => false, 'error' => 'Nama template tidak valid.']);
        exit;
    }

    // pastikan ekstensi .json
    if (!str_ends_with($oldName, '.json')) $oldName .= '.json';
    if (!str_ends_with($newName, '.json')) $newName .= '.json';

    $oldPath = $templateDir . '/' . $oldName;
    $newPath = $templateDir . '/' . $newName;

    if (!file_exists($oldPath)) {
        echo json_encode(['success' => false, 'error' => 'Template lama tidak ditemukan.']);
        exit;
    }

    // jika file baru sudah ada, hapus dulu (overwrite)
    if (file_exists($newPath)) {
        echo json_encode(['success' => false, 'error' => 'Template sudah ada.']);
        exit;
    }

    if (rename($oldPath, $newPath)) {
        echo json_encode(['success' => true, 'newName' => $newName]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Gagal mengganti nama template.']);
    }
    exit;
}

// ✅ Handle POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');

    $input = json_decode(file_get_contents('php://input'), true);
    $query = $input['query'] ?? '';

    if (empty($query)) {
        echo json_encode(['success' => false, 'error' => 'Query kosong.']);
        exit;
    }

    try {
        $reportGenerator->setQuery($query);
        $_SESSION['report_query'] = $query; // ✅ Simpan ke session

        $data = $reportGenerator->getTableData();
        if (empty($data)) {
            echo json_encode(['success' => true, 'columns' => [], 'rows' => []]);
            exit;
        }

        $columns = array_keys($data[0]);
        $rows = $data;

        echo json_encode([
            'success' => true,
            'columns' => $columns,
            'rows' => $rows
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ✅ GET tetap bisa akses query yang sudah disimpan
if (isset($_GET['action']) && $_GET['action'] === 'get_data') {
    header('Content-Type: application/json');
    try {
        echo json_encode(['success' => true, 'data' => $reportGenerator->getTableData()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Proses Export File
if (isset($_GET['type'])) {
    $type = $_GET['type'] ?? '';
    $filename = 'laporan_' . date('Y-m-d') . '.' . $type;

    $query = $_GET['query'] ?? '';
    if (!empty($query)) {
        $reportGenerator->setQuery($query);
        if ($reportGenerator->getDesignerPDF()) {
            $reportGenerator->getDesignerPDF()->setQuery($query);
        }
    }
    

    if ($type === 'pdf') {
        $designer = buildDesignerFromRequest();
        $reportGenerator->setDesignerPDF($designer);
    }

    $reportGenerator->export(null, $type, $filename); // ✅ Query otomatis diambil dari object
}

// Handle request save template (GET)
if (isset($_GET['action']) && $_GET['action'] === 'save_template_PDF') {
    header('Content-Type: application/json');

    $designer = buildDesignerFromRequest();
    $designer->setQuery($reportGenerator->getQuery());

    // Ambil nama file dari request jika ada
    $filename = $_GET['filename'] ?? null;

    // Simpan template
    $savedFilename = savePDFTemplate($designer->getTemplateAsArray(), $filename);

    echo json_encode([
        'success' => true,
        'message' => 'Template berhasil disimpan.',
        'filename' => $savedFilename
    ]);
    exit;
}


// Handle untuk mendapatkan daftar file template
if (isset($_GET['action']) && $_GET['action'] === 'get_template_list') {
    header('Content-Type: application/json');
    $templateDir = __DIR__ . '/../template_report_generator_pdf';
    $files = array_diff(scandir($templateDir), ['.', '..']);
    $templates = array_values(array_filter($files, fn($file) => pathinfo($file, PATHINFO_EXTENSION) === 'json'));
    echo json_encode($templates);
    exit;
}

//Handle delete template
if (isset($_GET['action']) && $_GET['action'] === 'delete_template' && isset($_GET['filename'])) {
    header('Content-Type: application/json');

    $templateDir = __DIR__ . '/../template_report_generator_pdf';
    $filename = basename($_GET['filename']); // hindari path traversal
    $filePath = $templateDir . '/' . $filename;

    if (file_exists($filePath)) {
        if (unlink($filePath)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Gagal menghapus file.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan.']);
    }
    exit;
}


// Handle untuk load template spesifik
if (isset($_GET['action']) && $_GET['action'] === 'load_template' && isset($_GET['filename'])) {
    header('Content-Type: application/json');
    $templateDir = __DIR__ . '/../template_report_generator_pdf';
    $filename = basename($_GET['filename']); // Hindari path traversal
    $filePath = $templateDir . '/' . $filename;

    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        $template = json_decode($content, true);
    
        // ✅ Jika ada query di template, simpan ke session
        if (isset($template['query'])) {
            $_SESSION['report_query'] = $template['query'];
        }
    
        echo json_encode($template);
    } else {
        echo json_encode(['error' => 'Template not found']);
    }
    exit;
    
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
    
    $headerTableStyle = getStyleFromQuery('headerTableStyle', 'font-size: 14px; font-weight: bold;');
    $rowTableStyle = getStyleFromQuery('rowTableStyle', 'font-size: 12px;');
    $tableStyle = getStyleFromQuery('tableStyle', 'width: 100%; border-collapse: collapse;');
    $paperSize = $_GET['paperSize'] ?? 'A4';
    $customWidth = isset($_GET['customWidth']) ? (float)$_GET['customWidth'] * 2.83464567 : 0.0;
    $customHeight = isset($_GET['customHeight']) ? (float)$_GET['customHeight'] * 2.83464567 : 0.0;
    $paperOrientation = $_GET['paperOrientation'] ?? 'portrait';
    $metaTitle = $_GET['metaTitle'] ?? '';
    $metaAuthor = $_GET['metaAuthor'] ?? '';
    $metaSubject = $_GET['metaSubject'] ?? '';
    $columnWidths = isset($_GET['columnWidths']) ? json_decode(urldecode($_GET['columnWidths']), true) : [];
    $headerStyle = json_decode(urldecode($_GET['headerStyle']), true);
    $footerStyle = json_decode(urldecode($_GET['footerStyle']), true);
    $bodyStyle = getStyleFromQuery('bodyStyle', 'margin: 20px; padding: 20px; box-sizing: border-box; font-family: Arial, sans-serif; background-color: #ffffff;');
    $customHeaders = [];
    if (isset($_GET['headers'])) {
        $decoded = json_decode(urldecode($_GET['headers']), true);
        if (is_array($decoded)) {
            $customHeaders = $decoded;
        }
    }
    $headerDisplayRule = $_GET['headerDisplayRule'] ?? 'every-page';
    $footerDisplayRule = $_GET['footerDisplayRule'] ?? 'every-page';
    $pageNumberPosition = $_GET['pageNumberPosition'] ?? 'none';

    $designer = new PDFReportDesigner();
    $designer->setHeaderTableStyle($headerTableStyle);
    $designer->setRowTableStyle($rowTableStyle);
    $designer->setTableStyle($tableStyle);
    $designer->setCustomHeaders($customHeaders);
    $designer->setBodyStyle($bodyStyle);
    $designer->setHeaderStyle($headerStyle);
    $designer->setFooterStyle($footerStyle);
    $designer->setHeaderDisplayRule($headerDisplayRule);
    $designer->setFooterDisplayRule($footerDisplayRule);
    $designer->setPageNumberPosition($pageNumberPosition);

    if ($paperSize === 'custom') {
        $designer->setPaperSize([0, 0, $customWidth, $customHeight]);
    } else {
        $designer->setPaperSize($paperSize);
    }

    $designer->setPaperOrientation($paperOrientation);
    $designer->setMetadata($metaTitle, $metaAuthor, $metaSubject);

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
