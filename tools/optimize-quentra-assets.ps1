# Quentra web sayfasi icin gorsel optimizasyonu
# Kaynak: quentra\SuperHeroes  ->  Cikti: assets\quentra-web
# Windows PowerShell 5.1 + System.Drawing (dis bagimlilik yok). Tekrar calistirilabilir.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root   = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root 'quentra\SuperHeroes'
$outDir = Join-Path $root 'assets\quentra-web'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# Koyu adacik zemin rengi — RGBA -> JPG flatten bu renge yapilir (kenar halesi olmaz)
$islandHex = '#161320'

function Save-Jpeg([System.Drawing.Bitmap]$bmp, [string]$path, [long]$quality) {
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
             Where-Object { $_.MimeType -eq 'image/jpeg' }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
    $bmp.Save($path, $codec, $ep)
    $ep.Dispose()
}

function Resize-Image([string]$inPath, [string]$outPath, [int]$targetW, [long]$quality, [string]$flattenBg) {
    $img = [System.Drawing.Image]::FromFile($inPath)
    try {
        $w = [Math]::Min($targetW, $img.Width)   # kucuk kaynagi buyutme
        $h = [int][Math]::Round($img.Height * ($w / $img.Width))
        $bmp = New-Object System.Drawing.Bitmap($w, $h)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        if ($flattenBg) { $g.Clear([System.Drawing.ColorTranslator]::FromHtml($flattenBg)) }
        $g.DrawImage($img, 0, 0, $w, $h)
        $g.Dispose()
        if ($outPath -like '*.png') {
            $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        } else {
            Save-Jpeg $bmp $outPath $quality
        }
        $bmp.Dispose()
        return @{ W = $w; H = $h }
    } finally { $img.Dispose() }
}

# 12 kahraman — tam kompozisyonlu ana kartlar (kirpik "kopya" varyantlari DEGIL)
$heroes = @(
    @{ n='01'; f='01_Last SQL Bender.png' },
    @{ n='02'; f='02_Shield Guardian.png' },
    @{ n='03'; f='03_Key Breaker.png' },
    @{ n='04'; f='04_Cache Flash.png' },
    @{ n='05'; f='05_Observer.png' },
    @{ n='06'; f='06_Oracle AI.png' },
    @{ n='07'; f='07_Plan Architect.png' },
    @{ n='08'; f='08_Index Master.png' },
    @{ n='09'; f='09_Audit Keeper.png' },
    @{ n='10'; f='10_Data Sentinel.png' },
    @{ n='11'; f='11_Report Wizard.png' },
    @{ n='12'; f='12_PhantomMask.png' }
)

Write-Host "--- Kahraman kartlari ---"
foreach ($h in $heroes) {
    $src = Join-Path $srcDir $h.f
    $d = Resize-Image $src (Join-Path $outDir ("hero-{0}.jpg" -f $h.n)) 900 80 $islandHex
    $t = Resize-Image $src (Join-Path $outDir ("hero-{0}-thumb.jpg" -f $h.n)) 420 80 $islandHex
    Write-Host ("hero-{0}: detay {1}x{2}, thumb {3}x{4}" -f $h.n, $d.W, $d.H, $t.W, $t.H)
}

Write-Host "--- Masthead cutout (seffaf) ---"
$cutSrc = Join-Path $srcDir 'secilen\01_Last SQL BenderTransparent - Kopya.png'
$c = Resize-Image $cutSrc (Join-Path $outDir 'hero-01-cutout.png') 640 0 $null
Write-Host ("hero-01-cutout: {0}x{1}" -f $c.W, $c.H)

Write-Host "--- Logo ---"
Copy-Item (Join-Path $root 'quentra\QuentraLogoKucukMor.png') (Join-Path $outDir 'quentra-logo.png') -Force

Write-Host "--- Boyut raporu ---"
Get-ChildItem $outDir | Sort-Object Name |
    Select-Object Name, @{N='KB'; E={[Math]::Round($_.Length / 1KB)}} |
    Format-Table -AutoSize

$bad = Get-ChildItem $outDir -Filter '*-thumb.jpg' | Where-Object { $_.Length -gt 100KB }
$bad += Get-ChildItem $outDir -Filter 'hero-??.jpg' | Where-Object { $_.Length -gt 300KB }
if ($bad) {
    Write-Warning ("Butce asimi: " + (($bad | Select-Object -ExpandProperty Name) -join ', '))
} else {
    Write-Host "Tum dosyalar butce icinde (thumb <100 KB, detay <300 KB)."
}
