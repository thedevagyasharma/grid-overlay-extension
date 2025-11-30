# Grid Overlay Extension - Build Script
# This script creates a clean ZIP file for Chrome Web Store submission

Write-Host "🚀 Building Grid Overlay Extension..." -ForegroundColor Cyan
Write-Host ""

# Define source and output paths
$sourceDir = $PSScriptRoot
$buildDir = Join-Path $sourceDir "build"
$zipPath = Join-Path $sourceDir "grid-overlay-extension.zip"

# Files to include in the extension package
$requiredFiles = @(
    "manifest.json",
    "content.js",
    "overlay.css",
    "popup.html",
    "popup.js",
    "icon16.png",
    "icon48.png",
    "icon128.png"
)

# Clean up previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path $buildDir) {
    Remove-Item $buildDir -Recurse -Force
}
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Create build directory
Write-Host "📁 Creating build directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $buildDir | Out-Null

# Copy required files
Write-Host "📋 Copying extension files..." -ForegroundColor Yellow
$missingFiles = @()

foreach ($file in $requiredFiles) {
    $sourcePath = Join-Path $sourceDir $file
    $destPath = Join-Path $buildDir $file

    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $missingFiles += $file
        Write-Host "  ✗ $file (missing)" -ForegroundColor Red
    }
}

# Check for missing files
if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Build failed. Please ensure all required files exist." -ForegroundColor Red
    exit 1
}

# Verify manifest.json
Write-Host ""
Write-Host "🔍 Verifying manifest.json..." -ForegroundColor Yellow
$manifestPath = Join-Path $buildDir "manifest.json"
try {
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    Write-Host "  ✓ Name: $($manifest.name)" -ForegroundColor Green
    Write-Host "  ✓ Version: $($manifest.version)" -ForegroundColor Green
    Write-Host "  ✓ Manifest Version: $($manifest.manifest_version)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Invalid JSON in manifest.json" -ForegroundColor Red
    exit 1
}

# Create ZIP file
Write-Host ""
Write-Host "📦 Creating ZIP package..." -ForegroundColor Yellow
Compress-Archive -Path "$buildDir\*" -DestinationPath $zipPath -Force

# Verify ZIP was created
if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length
    $zipSizeKB = [math]::Round($zipSize / 1KB, 2)
    Write-Host "  ✓ Package created: grid-overlay-extension.zip ($zipSizeKB KB)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to create ZIP package" -ForegroundColor Red
    exit 1
}

# Clean up build directory (optional)
Write-Host ""
Write-Host "🧹 Cleaning up build directory..." -ForegroundColor Yellow
Remove-Item $buildDir -Recurse -Force

# Success!
Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package location: $zipPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the extension locally (chrome://extensions/)" -ForegroundColor White
Write-Host "  2. Go to Chrome Web Store Developer Dashboard" -ForegroundColor White
Write-Host "     https://chrome.google.com/webstore/devconsole" -ForegroundColor Cyan
Write-Host "  3. Click 'New Item' and upload grid-overlay-extension.zip" -ForegroundColor White
Write-Host "  4. Fill out the store listing and submit for review" -ForegroundColor White
Write-Host ""
Write-Host "📖 See PUBLISHING_GUIDE.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""
