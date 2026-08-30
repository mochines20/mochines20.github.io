Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$imageDir = Join-Path $root 'assets\images'
$out = Join-Path $imageDir 'portfolio-arcade.gif'
$background = [System.Drawing.Bitmap]::FromFile((Join-Path $imageDir 'pixel-night-mountains.png'))
$ufo = [System.Drawing.Bitmap]::FromFile((Join-Path $imageDir 'custom-ufo-v2.png'))
$cow = [System.Drawing.Bitmap]::FromFile((Join-Path $imageDir 'custom-cow-v2.png'))
$frames = @()

for ($i = 0; $i -lt 18; $i++) {
  $frame = New-Object System.Drawing.Bitmap 640,360
  $g = [System.Drawing.Graphics]::FromImage($frame)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $g.DrawImage($background, 0, 0, 640, 360)

  $ufoX = 250 + [int](18 * [Math]::Sin($i * 0.45))
  $ufoY = 38 + [int](4 * [Math]::Sin($i * 0.8))
  $ufoRect = New-Object System.Drawing.Rectangle $ufoX,$ufoY,150,100

  $g.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(34, 9, 233, 255))), 0, 0, 640, 360)
  $g.DrawImage($ufo, $ufoRect)

  $abducting = $i -ge 8
  if ($abducting) {
    $progress = [Math]::Min(1, ($i - 8) / 7)
    $cowX = 286
    $cowY = 230 - [int](125 * $progress)
    $beamTop = $ufoY + 67
    $beamBottom = $cowY + 64
    $beam = New-Object System.Drawing.Drawing2D.GraphicsPath
    $beam.AddPolygon(@([System.Drawing.Point]::new($ufoX+52,$beamTop), [System.Drawing.Point]::new($ufoX+98,$beamTop), [System.Drawing.Point]::new($cowX+86,$beamBottom), [System.Drawing.Point]::new($cowX+20,$beamBottom)))
    $g.FillPath((New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.Point]::new(0,$beamTop),[System.Drawing.Point]::new(0,$beamBottom),[System.Drawing.Color]::FromArgb(110,90,255,255),[System.Drawing.Color]::FromArgb(10,90,255,255))), $beam)
    $beam.Dispose()
  } else {
    $cowX = 72 + (($i * 9) % 46)
    $cowY = 230 + [int](2 * [Math]::Sin($i * 0.9))
  }

  if ($i -lt 16) {
    $g.DrawImage($cow, (New-Object System.Drawing.Rectangle $cowX,$cowY,105,70))
  }

  if ($abducting) {
    for ($p = 0; $p -lt 8; $p++) {
      $px = $ufoX + 45 + (($p * 19 + $i * 13) % 60)
      $py = $beamTop + (($p * 23 + $i * 9) % [Math]::Max(1, ($beamBottom-$beamTop)))
      $g.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(190, 255, 239, 89))), $px, $py, 3, 3)
    }
  }

  $font = New-Object System.Drawing.Font 'Consolas', 10, ([System.Drawing.FontStyle]::Bold)
  $g.DrawString('JEYSI.EXE // PORTFOLIO SYSTEM ONLINE', $font, [System.Drawing.Brushes]::White, 18, 14)
  $g.DrawString('AI / BI / AUTOMATION', $font, [System.Drawing.Brushes]::Yellow, 18, 332)
  $font.Dispose(); $g.Dispose(); $frames += $frame
}

$encoder = [System.Drawing.Imaging.Encoder]::SaveFlag
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([long][System.Drawing.Imaging.EncoderValue]::MultiFrame)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/gif'
$frames[0].Save($out, $codec, $params)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([long][System.Drawing.Imaging.EncoderValue]::FrameDimensionTime)
for ($i = 1; $i -lt $frames.Count; $i++) { $frames[0].SaveAdd($frames[$i], $params) }
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter $encoder, ([long][System.Drawing.Imaging.EncoderValue]::Flush)
$frames[0].SaveAdd($params)
$frames | ForEach-Object Dispose
$background.Dispose(); $ufo.Dispose(); $cow.Dispose()
Write-Output "Created $out"
