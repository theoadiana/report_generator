<?php
namespace Theob\ReportGenerator;

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
    $defaultFolder = __DIR__ . '/../template_report_generator_pdf';
    $folder = $customPath ?? $defaultFolder;

    if (!file_exists($folder)) {
        mkdir($folder, 0777, true);
    }

    if ($filename === "template") {
        $filename .= "_" . date("Ymd_His") . "_" . uniqid();
    }
    $filePath = $folder . DIRECTORY_SEPARATOR . $filename . ".html";

    $handle = fopen($filePath, 'a');

    if (is_array($par)) {
        saveHTMLTemplate_arr($handle, $par, 0);
    } else {
        fwrite($handle, $par . "\n");
    }

    fclose($handle);

    return $filePath;
}

function savePDFTemplate(array $template, ?string $filename = null, string $prefix = 'template')
{
    $folder = __DIR__ . '/../template_report_generator_pdf';

    if (!is_dir($folder)) {
        mkdir($folder, 0777, true);
    }
    if ($filename && $filename !== '') {
        if (!str_ends_with($filename, '.json')) {
            $filename .= '.json';
        }
    } else {
        $filename = $prefix . '_' . date('Ymd_His') . '.json';
    }

    $filepath = $folder . '/' . $filename;

    file_put_contents($filepath, json_encode($template, JSON_PRETTY_PRINT));

    return $filename;
}


function loadPDFTemplate(string $filename = 'template.json'): ?array
{
    $path = __DIR__ . '/../template_report_generator_pdf/' . $filename;
    if (file_exists($path)) {
        $json = file_get_contents($path);
        return json_decode($json, true);
    }
    return null;
}

function echo2file_arr($handle, $arr, $space)
{
    $space += 2;
    fwrite($handle, "\n");
    foreach ($arr as $key => $value)
        if (is_array($value)) {
            fwrite($handle, $key . "=>");
            echo2file_arr($handle, $value, $space);
        } else {
            fwrite($handle, str_repeat("", $space) . $key . "=>" . $value . "\n");
        }
}

function echo2file($par)
{
    $handle = fopen("errorCheckPHP.txt", 'a');
    if (is_array($par))
        echo2file_arr($handle, $par, 0);
    else
        fwrite($handle, $par . "\n");
}