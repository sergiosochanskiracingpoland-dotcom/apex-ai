# Apex AI 0.3.4.5 — only CC0/public-domain motorsport photos.
# Runs on the Windows CI builder. Downloads verified Wikimedia originals, crops to 16:9
# 1920x1080 and compresses to efficient JPEG for reliable OFFLINE use.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$target = Join-Path $PSScriptRoot '..\ui\wallpapers'
New-Item -ItemType Directory -Force -Path $target | Out-Null
$assets = @(
  @{Id='gt3';   Name='Toyota_GR_GT3_Prototype_cropped.jpg';                 Author='TTTNIS';         Group='GT3'},
  @{Id='gt3b';  Name='Toyota_GR_GT3_Prototype_rear.jpg';                    Author='TTTNIS';         Group='GT3'},
  @{Id='wec';   Name='Car_65_Manuel_Maldonado_in_Le_Mans_2023.jpg';        Author='Briansoprano';   Group='Endurance'},
  @{Id='wecb';  Name='24_hours_of_Le_Mans_1990.jpg';                        Author='RandolphGuffey'; Group='Endurance'},
  @{Id='f1';    Name='2026_f1_regulation.jpg';                              Author='BlackFlash06';   Group='F1'},
  @{Id='f1b';   Name='Audi_Revolut_F1.jpg';                                 Author='Mustang Joe';    Group='F1'}
)
$userAgent = 'ApexAI-Wallpapers/0.3.4.5 (https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai; CC0-only offline installer)'
$meta = @()
foreach ($asset in $assets) {
  Write-Host "Fetching CC0 wallpaper $($asset.Id): $($asset.Name)"
  $title = 'File:' + ($asset.Name -replace '_',' ')
  $api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=2200&titles=' + [uri]::EscapeDataString($title)
  $response = $null
  for ($attempt=1; $attempt -le 4; $attempt++) {
    try {
      $response = Invoke-RestMethod -Uri $api -Headers @{'User-Agent'=$userAgent} -TimeoutSec 50
      if ($response.query.pages[0].imageinfo[0].thumburl -or $response.query.pages[0].imageinfo[0].url) { break }
      throw 'Wikimedia response has no image URL'
    } catch {
      if ($attempt -eq 4) { throw }
      Start-Sleep -Seconds ($attempt * 3)
    }
  }
  $imageInfo=$response.query.pages[0].imageinfo[0]
  if (-not $imageInfo) { throw "Wikimedia image missing: $($asset.Name)" }
  $license = [string]$imageInfo.extmetadata.LicenseShortName.value
  if ($license -notmatch '(?i)^CC0(?:\s|$|\s*1\.0)') {
    throw "Refusing to package non-CC0 image: $($asset.Name), declared license: $license"
  }
  $url=if ($imageInfo.thumburl) {$imageInfo.thumburl} else {$imageInfo.url}
  $temp=Join-Path $env:RUNNER_TEMP ($asset.Id + '-source.jpg')
  $downloaded=$false
  for ($attempt=1; $attempt -le 4; $attempt++) {
    try {
      Invoke-WebRequest -Uri $url -OutFile $temp -Headers @{'User-Agent'=$userAgent} -TimeoutSec 100
      if ((Get-Item $temp).Length -lt 20000) { throw 'Image unexpectedly small' }
      $downloaded=$true
      break
    } catch {
      if ($attempt -eq 4) {throw}
      Start-Sleep -Seconds ($attempt*3)
    }
  }
  if (-not $downloaded) { throw "Unable to download $($asset.Name)" }
  $source=[System.Drawing.Image]::FromFile($temp)
  $output=Join-Path $target ($asset.Id + '.jpg')
  try {
    $width=1920; $height=1080; $desired=$width/$height
    $sourceAspect=[double]$source.Width/[double]$source.Height
    if ($sourceAspect -gt $desired) {
      $cropHeight=[double]$source.Height
      $cropWidth=$cropHeight*$desired
      $cropX=([double]$source.Width-$cropWidth)/2
      $cropY=0
    } else {
      $cropWidth=[double]$source.Width
      $cropHeight=$cropWidth/$desired
      $cropX=0
      $cropY=([double]$source.Height-$cropHeight)/2
    }
    $bitmap=[System.Drawing.Bitmap]::new($width,$height)
    $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,$width,$height),
        [single]$cropX,[single]$cropY,[single]$cropWidth,[single]$cropHeight,
        [System.Drawing.GraphicsUnit]::Pixel)
      $encoder=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
        Where-Object {$_.MimeType -eq 'image/jpeg'} | Select-Object -First 1
      $parameters=[System.Drawing.Imaging.EncoderParameters]::new(1)
      $parameters.Param[0]=[System.Drawing.Imaging.EncoderParameter]::new(
        [System.Drawing.Imaging.Encoder]::Quality,[long]85)
      try { $bitmap.Save($output,$encoder,$parameters) }
      finally { $parameters.Dispose() }
    } finally {
      $graphics.Dispose();$bitmap.Dispose()
    }
  } finally {
    $source.Dispose();Remove-Item $temp -ErrorAction SilentlyContinue
  }
  $meta+=@{
    id=$asset.Id;file=($asset.Id+'.jpg');width=1920;height=1080;
    category=$asset.Group;license='CC0 1.0';
    author=$asset.Author;
    source=('https://commons.wikimedia.org/wiki/File:' + [uri]::EscapeDataString($asset.Name))
  }
  $mb=[math]::Round((Get-Item $output).Length / 1MB,2)
  Write-Host "Bundled: $output (1920x1080, $mb MB, CC0)"
}
# Also create the attribution manifest in a format that can be inspected offline.
$meta | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $target 'credits.json') -Encoding utf8
Write-Host "All $($assets.Count) verified-CC0 wallpapers packaged."
