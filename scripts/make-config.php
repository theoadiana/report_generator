<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Theob\ReportGenerator\ProjectRootFinder;
$rootPath = ProjectRootFinder::find();
$configPath = $rootPath . '\reportGenerator.config.php';
$content = <<<'EOT'
<?php
$host = '<host>';
$dbname = '<database name>';
$username = '<username>';
$password = '<password>';
EOT;
file_put_contents($configPath, $content);