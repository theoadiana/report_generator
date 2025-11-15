<?php
$configPath = __DIR__ . '/../reportGenerator.config.php';
$content = <<<'EOT'
<?php
$host = '<host>';
$dbname = '<database name>';
$username = '<username>';
$password = '<password>';
EOT;
file_put_contents($configPath, $content);