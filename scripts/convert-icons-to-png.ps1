Param(
  [string]$IconsPath = "public/icons"
)

# Convert existing JPG icons to PNG format required for PWA install
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function Convert-ToPng($inputPath, $outputPath) {
  if (-Not (Test-Path $inputPath)) {
    Write-Host "Source not found: $inputPath" -ForegroundColor Yellow
    return
  }
  $dir = Split-Path -Parent $outputPath
  if (-Not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $img = [System.Drawing.Image]::FromFile($inputPath)
  try {
    $img.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Wrote $outputPath" -ForegroundColor Green
  } finally {
    $img.Dispose()
  }
}

$root = Split-Path $PSScriptRoot -Parent
$clientRoot = Join-Path $PSScriptRoot ".."
$pubPath = Join-Path $clientRoot $IconsPath

Convert-ToPng (Join-Path $pubPath 'logo-192.jpg') (Join-Path $pubPath 'logo-192.png')
Convert-ToPng (Join-Path $pubPath 'logo-512.jpg') (Join-Path $pubPath 'logo-512.png')
