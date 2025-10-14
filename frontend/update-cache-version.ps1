# Cache Version Updater for Addition Game
# Run this script to update cache-busting version numbers

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$indexFile = "index-dev.html"

Write-Host "🚀 Updating cache-busting version to: $timestamp" -ForegroundColor Green

# Read the current file
$content = Get-Content $indexFile -Raw

# Update version numbers in CSS and JS references
$content = $content -replace '\?v=\d{8}-\d{3}', "?v=$timestamp"

# Write back to file
Set-Content $indexFile $content -NoNewline

Write-Host "✅ Updated $indexFile with new version: $timestamp" -ForegroundColor Green
Write-Host "💡 Now refresh your browser with F5 or Ctrl+F5" -ForegroundColor Yellow