# Package Extension Script
# Creates a clean distribution package ready for Chrome Web Store

$PACKAGE_NAME = "grid-overlay-extension"
$DIST_DIR = "dist"
$MODULES_DIR = "modules"

# Read version from manifest
$manifest = Get-Content "manifest.json" | ConvertFrom-Json
$VERSION = $manifest.version
$ZIP_NAME = "$PACKAGE_NAME-v$VERSION.zip"

# Files required for the extension to work
$REQUIRED_FILES = @(
    "manifest.json",
    "content.js",
    "overlay.css",
    "popup.html",
    "popup.js",
    "icon16.png",
    "icon48.png",
    "icon128.png"
)

# Optional files to include
$OPTIONAL_FILES = @(
    "README.md"
)

Write-Host "Grid Overlay Extension - Packaging Tool" -ForegroundColor Cyan
Write-Host ""

# Clean and create dist directory
Write-Host "Preparing distribution directory..." -ForegroundColor Yellow
if (Test-Path $DIST_DIR) {
    Remove-Item -Recurse -Force $DIST_DIR
}
New-Item -ItemType Directory -Path $DIST_DIR | Out-Null

# Copy required files
Write-Host "Copying required files..." -ForegroundColor Yellow
foreach ($file in ($REQUIRED_FILES + $OPTIONAL_FILES)) {
    if (Test-Path $file) {
        Copy-Item $file $DIST_DIR
        Write-Host "   $file" -ForegroundColor Green
    } elseif ($REQUIRED_FILES -contains $file) {
        Write-Host "   Required file missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Copy modules directory (for development reference)
Write-Host ""
Write-Host "Copying modules (development reference)..." -ForegroundColor Yellow
if (Test-Path $MODULES_DIR) {
    Copy-Item -Recurse $MODULES_DIR $DIST_DIR
    Write-Host "   modules/ directory" -ForegroundColor Green
}

# Create ZIP file
Write-Host ""
Write-Host "Creating ZIP package..." -ForegroundColor Yellow
if (Test-Path $ZIP_NAME) {
    Remove-Item $ZIP_NAME
}

# Use PowerShell Compress-Archive
Compress-Archive -Path "$DIST_DIR\*" -DestinationPath $ZIP_NAME -CompressionLevel Optimal

$zipSize = [math]::Round((Get-Item $ZIP_NAME).Length / 1KB, 2)
Write-Host "   Package created: $ZIP_NAME" -ForegroundColor Green
Write-Host "   Size: $zipSize KB" -ForegroundColor Green

# Print summary
Write-Host ""
Write-Host "Extension packaged successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Files included:" -ForegroundColor Cyan
foreach ($file in $REQUIRED_FILES) {
    Write-Host "   - $file"
}

Write-Host ""
Write-Host "Distribution files:" -ForegroundColor Cyan
Write-Host "   - dist/ (unpacked extension for testing)"
Write-Host "   - $ZIP_NAME (ready for Chrome Web Store)"

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Test: Load dist/ folder in Chrome (chrome://extensions/)"
Write-Host "   2. Publish: Upload $ZIP_NAME to Chrome Web Store"
Write-Host "   3. Share: Send ZIP file for manual installation"
Write-Host ""
