<?php
namespace Theob\ReportGenerator;

use ReflectionClass;

class ProjectRootFinder
{
    private static $cache = null;
    
    public static function find(): string
    {
        if (self::$cache !== null) {
            return self::$cache;
        }
        
        // Coba beberapa strategi secara berurutan
        
        // 1. Cek dari vendor directory (prioritas utama untuk kasus composer)
        if ($root = self::fromVendor()) {
            return self::$cache = $root;
        }
        
        // 2. Cek environment variable (jika ada)
        if ($root = self::fromEnvironment()) {
            return self::$cache = $root;
        }
        
        // 3. Cek dari current working directory
        if ($root = self::fromCurrentDirectory()) {
            return self::$cache = $root;
        }
        
        // 4. Fallback ke current directory
        return self::$cache = getcwd();
    }
    
    private static function fromEnvironment(): ?string
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
    
    private static function fromCurrentDirectory(): ?string
    {
        $currentDir = getcwd();
        return self::findProjectRoot($currentDir);
    }
    
    private static function fromVendor(): ?string
    {
        // Strategi 1: Cari dari path class ini sendiri
        $reflector = new ReflectionClass(self::class);
        $classPath = $reflector->getFileName();
        $classDir = dirname($classPath);
        
        // Jika class berada di dalam vendor, cari root project
        if (strpos($classDir, DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR) !== false) {
            $rootFromClass = self::findProjectRootFromVendorPath($classDir);
            if ($rootFromClass) {
                return $rootFromClass;
            }
        }
        
        // Strategi 2: Cari melalui Composer autoloader
        if (class_exists('Composer\Autoload\ClassLoader')) {
            $composerReflector = new ReflectionClass('Composer\Autoload\ClassLoader');
            $vendorPath = dirname($composerReflector->getFileName());
            $projectRoot = dirname($vendorPath);
            
            if (self::isProjectRoot($projectRoot)) {
                return $projectRoot;
            }
        }
        
        return null;
    }
    
    private static function findProjectRootFromVendorPath(string $vendorPath): ?string
    {
        // Split path berdasarkan 'vendor'
        $parts = explode(DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR, $vendorPath);
        
        if (count($parts) > 1) {
            $potentialRoot = $parts[0];
            
            // Verifikasi bahwa ini benar-benar root project
            if (self::isProjectRoot($potentialRoot)) {
                return $potentialRoot;
            }
            
            // Jika verifikasi gagal, coba naik satu level
            $parentDir = dirname($potentialRoot);
            if (self::isProjectRoot($parentDir)) {
                return $parentDir;
            }
        }
        
        return null;
    }
    
    private static function findProjectRoot(string $startPath): ?string
    {
        $currentDir = $startPath;
        $maxDepth = 15;
        $depth = 0;
        
        while ($depth < $maxDepth) {
            if (self::isProjectRoot($currentDir)) {
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
    
    private static function isProjectRoot(string $path): bool
    {
        // Indicator yang lebih kuat untuk project root
        $indicators = [
            '/composer.json',
            '/composer.lock',
            '/package.json',
            '/.git',
            '/vendor',
        ];
        
        foreach ($indicators as $indicator) {
            if (file_exists($path . $indicator)) {
                return true;
            }
        }
        
        // Cek jika ini adalah root project dengan struktur umum
        $commonDirs = ['/src', '/app', '/public', '/config', '/tests'];
        $dirCount = 0;
        
        foreach ($commonDirs as $dir) {
            if (is_dir($path . $dir)) {
                $dirCount++;
            }
        }
        
        // Jika menemukan minimal 2 directory umum, anggap sebagai project root
        return $dirCount >= 2;
    }
    
    // Helper method untuk mendapatkan path relatif dari root
    public static function path(string $relativePath = ''): string
    {
        $root = self::find();
        
        if ($relativePath === '') {
            return $root;
        }
        
        // Normalize path separator
        $relativePath = ltrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath), DIRECTORY_SEPARATOR);
        
        return $root . DIRECTORY_SEPARATOR . $relativePath;
    }
    
    // Method untuk debug
    public static function debug(): void
    {
        $reflector = new ReflectionClass(self::class);
        $classPath = $reflector->getFileName();
        
        echo "Debug Info:\n";
        echo "Class path: " . $classPath . "\n";
        echo "Class dir: " . dirname($classPath) . "\n";
        echo "CWD: " . getcwd() . "\n";
        echo "From vendor: " . (self::fromVendor() ?: 'NOT FOUND') . "\n";
        echo "From current: " . (self::fromCurrentDirectory() ?: 'NOT FOUND') . "\n";
        echo "From env: " . (self::fromEnvironment() ?: 'NOT FOUND') . "\n";
        
        // Test vendor path detection
        $vendorPath = dirname($classPath);
        if (strpos($vendorPath, DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR) !== false) {
            $parts = explode(DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR, $vendorPath);
            echo "Vendor parts: " . implode(' | ', $parts) . "\n";
            echo "Potential root: " . $parts[0] . "\n";
            echo "Is project root: " . (self::isProjectRoot($parts[0]) ? 'YES' : 'NO') . "\n";
        }
    }
}