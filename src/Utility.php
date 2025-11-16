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