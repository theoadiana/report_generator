<?php
namespace Theob\ReportGenerator;

class Installer
{
    public static function postInstall()
    {
        self::createConfigFile();
        self::createDirectories();
        self::showWelcomeMessage();
    }

    public static function postUpdate()
    {
        self::createConfigFile();
        self::createDirectories();
    }

    private static function createConfigFile()
    {
        $projectRoot = self::getProjectRoot();
        $configDir = $projectRoot . '/config';
        $configFile = $configDir . '/reportGenerator.config.php';
        
        // Create config directory if not exists
        if (!is_dir($configDir)) {
            mkdir($configDir, 0755, true);
        }
        
        // Create config file if not exists
        if (!file_exists($configFile)) {
            $configContent = self::getConfigTemplate();
            file_put_contents($configFile, $configContent);
            echo "✅ Created config file: " . $configFile . "\n";
        } else {
            echo "ℹ️ Config file already exists: " . $configFile . "\n";
        }
    }

    private static function createDirectories()
    {
        $projectRoot = self::getProjectRoot();
        $directories = [
            '/exports/excel',
            '/exports/pdf', 
            '/exports/csv',
            '/exports/html',
            '/storage/reports/temp'
        ];

        foreach ($directories as $dir) {
            $fullPath = $projectRoot . $dir;
            if (!is_dir($fullPath)) {
                mkdir($fullPath, 0755, true);
                echo "✅ Created directory: " . $fullPath . "\n";
            }
        }
    }

    private static function getConfigTemplate()
    {
        return <<<'EOT'
<?php
/**
 * Report Generator Configuration
 * Edit these values with your actual database credentials
 */

return [
    'database' => [
        'host' => 'localhost',
        'dbname' => 'your_database_name',
        'username' => 'your_username',
        'password' => 'your_password',
        'port' => 3306,
        'charset' => 'utf8mb4'
    ],
    'export' => [
        'excel' => [
            'creator' => 'Report Generator',
            'title' => 'Generated Report'
        ],
        'pdf' => [
            'paper_size' => 'A4',
            'orientation' => 'portrait'
        ],
        'default_format' => 'html'
    ]
];
EOT;
    }

    private static function getProjectRoot()
    {
        // Try to find the project root (where composer.json is located)
        $possiblePaths = [
            getcwd(),
            dirname(__DIR__, 3) // vendor/theob/report-generator/src
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path . '/composer.json')) {
                return realpath($path);
            }
        }

        return getcwd(); // Fallback
    }

    private static function showWelcomeMessage()
    {
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "🎉 Report Generator Installed Successfully!\n";
        echo str_repeat("=", 50) . "\n";
        echo "Next steps:\n";
        echo "1. Edit config/reportGenerator.config.php with your database settings\n";
        echo "2. Use in your code:\n";
        echo "   use Theob\\ReportGenerator\\ReportGenerator;\n";
        echo "   \$report = new ReportGenerator();\n";
        echo str_repeat("=", 50) . "\n\n";
    }
}