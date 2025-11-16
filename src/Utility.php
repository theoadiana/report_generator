<?php
namespace Theob\ReportGenerator;
use ReflectionClass;

function saveHTMLTemplate_arr($handle, $arr, $space)
{
    $space += 2;
    fwrite($handle, "\n");
    foreach ($arr as $key => $value) {
        if (is_array($value)) {
            fwrite($handle, $key . "=>");
            saveHTMLTemplate_arr($handle, $value, $space);
        } else {
            fwrite($handle, str_repeat("", $space) . $key . "=>" . $value . "\n");
        }
    }
}

function saveHTMLTemplate($par, $filename = "template", $customPath = null)
{
    // Folder default
    $defaultFolder = __DIR__ . '/../template_report_generator_pdf';

    // Jika path tidak ditentukan, gunakan default folder
    $folder = $customPath ?? $defaultFolder;

    // Buat folder jika belum ada
    if (!file_exists($folder)) {
        mkdir($folder, 0777, true); // Buat folder beserta parent-nya jika perlu
    }

    // Tambahkan timestamp dan uniqid jika nama file default
    if ($filename === "template") {
        $filename .= "_" . date("Ymd_His") . "_" . uniqid();
    }

    // Tentukan full path
    $filePath = $folder . DIRECTORY_SEPARATOR . $filename . ".html";

    $handle = fopen($filePath, 'a');

    if (is_array($par)) {
        saveHTMLTemplate_arr($handle, $par, 0);
    } else {
        fwrite($handle, $par . "\n");
    }

    fclose($handle);

    return $filePath; // Jika Anda ingin mendapatkan lokasi file yang disimpan
}

function savePDFTemplate(array $template, ?string $filename = null, string $prefix = 'template') {
    $folder = __DIR__ . '/../template_report_generator_pdf';

    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }

    // Jika user kasih nama file
    if ($filename && $filename !== '') {
        // Pastikan ada ekstensi .json
        if (!str_ends_with($filename, '.json')) {
            $filename .= '.json';
        }
    } else {
        // Nama default jika user tidak isi
        $filename = $prefix . '_' . date('Ymd_His') . '.json';
    }

    // Path lengkap file
    $filepath = $folder . '/' . $filename;

    // Simpan file
    file_put_contents($filepath, json_encode($template, JSON_PRETTY_PRINT));

    return $filename; // kembalikan ke frontend
}


function loadPDFTemplate(string $filename = 'template.json'): ?array {
    $path = __DIR__ . '/../template_report_generator_pdf/' . $filename;
    if (file_exists($path)) {
        $json = file_get_contents($path);
        return json_decode($json, true);
    }
    return null;
}

/**
 * PROJECT ROOT FINDER - STANDALONE FUNCTIONS
 * Fungsi-fungsi untuk menemukan root directory project
 */

// Cache untuk menyimpan hasil pencarian
$projectRootCache = null;

/**
 * Temukan root directory project
 */
function findProjectRoot(): string
{
    global $projectRootCache;
    
    if ($projectRootCache !== null) {
        return $projectRootCache;
    }
    
    // Coba beberapa strategi secara berurutan
    
    // 1. Cek environment variable (jika ada)
    if ($root = findFromEnvironment()) {
        return $projectRootCache = $root;
    }
    
    // 2. Cek dari current working directory
    if ($root = findFromCurrentDirectory()) {
        return $projectRootCache = $root;
    }
    
    // 3. Cek dari vendor directory
    if ($root = findFromVendor()) {
        return $projectRootCache = $root;
    }
    
    // 4. Fallback ke current directory
    return $projectRootCache = getcwd();
}

/**
 * Cari root dari environment variables
 */
function findFromEnvironment(): ?string
{
    // Cek environment variables yang umum digunakan
    $envVars = ['PROJECT_ROOT', 'APP_ROOT', 'ROOT_PATH'];
    
    foreach ($envVars as $envVar) {
        if ($path = getenv($envVar)) {
            if (file_exists($path) && is_dir($path)) {
                return realpath($path);
            }
        }
    }
    
    return null;
}

/**
 * Cari root dari current directory
 */
function findFromCurrentDirectory(): ?string
{
    $currentDir = getcwd();
    $maxDepth = 10;
    $depth = 0;
    
    while ($depth < $maxDepth) {
        if (isProjectRoot($currentDir)) {
            return $currentDir;
        }
        
        $parentDir = dirname($currentDir);
        if ($parentDir === $currentDir) {
            break;
        }
        
        $currentDir = $parentDir;
        $depth++;
    }
    
    return null;
}

/**
 * Cari root dari vendor directory
 */
function findFromVendor(): ?string
{
    // Coba detect melalui Composer autoloader
    if (class_exists('Composer\Autoload\ClassLoader')) {
        $reflector = new ReflectionClass('Composer\Autoload\ClassLoader');
        $vendorPath = dirname(dirname($reflector->getFileName()));
        $projectRoot = dirname($vendorPath);
        
        if (isProjectRoot($projectRoot)) {
            return $projectRoot;
        }
    }
    
    // Coba cari vendor directory secara manual
    $currentDir = __DIR__;
    $maxDepth = 5;
    $depth = 0;
    
    while ($depth < $maxDepth) {
        if (file_exists($currentDir . '/vendor/autoload.php')) {
            $projectRoot = dirname($currentDir);
            if (isProjectRoot($projectRoot)) {
                return $projectRoot;
            }
        }
        
        $parentDir = dirname($currentDir);
        if ($parentDir === $currentDir) {
            break;
        }
        
        $currentDir = $parentDir;
        $depth++;
    }
    
    return null;
}

/**
 * Cek apakah directory adalah project root
 */
function isProjectRoot(string $path): bool
{
    $indicators = [
        '/composer.json',
        '/composer.lock', 
        '/vendor',
        '/src',
        '/package.json',
        '/.git'
    ];
    
    foreach ($indicators as $indicator) {
        if (file_exists($path . $indicator)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Helper method untuk mendapatkan path relatif dari root
 */
function getProjectPath(string $relativePath = ''): string
{
    $root = findProjectRoot();
    
    if ($relativePath === '') {
        return $root;
    }
    
    // Normalize path separator
    $relativePath = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath), DIRECTORY_SEPARATOR);
    
    return $root . DIRECTORY_SEPARATOR . $relativePath;
}

/**
 * Reset cache (berguna untuk testing)
 */
function resetProjectRootCache(): void
{
    global $projectRootCache;
    $projectRootCache = null;
}