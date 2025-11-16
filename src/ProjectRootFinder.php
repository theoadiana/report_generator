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
        
        // 1. Cek environment variable (jika ada)
        if ($root = self::fromEnvironment()) {
            return self::$cache = $root;
        }
        
        // 2. Cek dari current working directory
        if ($root = self::fromCurrentDirectory()) {
            return self::$cache = $root;
        }
        
        // 3. Cek dari vendor directory
        if ($root = self::fromVendor()) {
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
        $maxDepth = 10;
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
    
    private static function fromVendor(): ?string
    {
        // Coba detect melalui Composer autoloader
        if (class_exists('Composer\Autoload\ClassLoader')) {
            $reflector = new ReflectionClass('Composer\Autoload\ClassLoader');
            $vendorPath = dirname(dirname($reflector->getFileName()));
            $projectRoot = dirname($vendorPath);
            
            if (self::isProjectRoot($projectRoot)) {
                return $projectRoot;
            }
        }
        
        return null;
    }
    
    private static function isProjectRoot(string $path): bool
    {
        $indicators = [
            '/composer.json',
            '/composer.lock',
            '/vendor',
            '/src',
        ];
        
        foreach ($indicators as $indicator) {
            if (file_exists($path . $indicator)) {
                return true;
            }
        }
        
        return false;
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
}