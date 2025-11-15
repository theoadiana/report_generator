<?php
namespace Theob\ReportGenerator;

class ConfigHelper
{
    /**
     * Get configuration from user's project
     */
    public static function getConfig(): array
    {
        $configPaths = [
            getcwd() . '/config/reportGenerator.config.php',
            dirname(__DIR__, 3) . '/config/reportGenerator.config.php'
        ];

        foreach ($configPaths as $path) {
            if (file_exists($path)) {
                $config = require $path;
                if (is_array($config)) {
                    return $config;
                }
            }
        }

        // Return default config if not found
        return [
            'database' => [
                'host' => 'localhost',
                'dbname' => '',
                'username' => '',
                'password' => ''
            ],
            'export' => [
                'default_format' => 'html'
            ]
        ];
    }

    /**
     * Get database configuration specifically
     */
    public static function getDatabaseConfig(): array
    {
        $config = self::getConfig();
        return $config['database'] ?? [];
    }

    /**
     * Ensure directory exists
     */
    public static function ensureDirectory(string $path): string
    {
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
        return realpath($path);
    }

    /**
     * Get exports path
     */
    public static function getExportsPath(string $type = ''): string
    {
        $config = self::getConfig();
        $basePath = $config['paths']['exports'] ?? 'exports/';
        $fullPath = getcwd() . '/' . trim($basePath, '/') . '/' . $type;
        
        return self::ensureDirectory($fullPath);
    }
}