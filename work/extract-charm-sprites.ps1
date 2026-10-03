Add-Type -AssemblyName System.Drawing

function Remove-ConnectedBackground([System.Drawing.Bitmap]$bitmap) {
    $width = $bitmap.Width; $height = $bitmap.Height
    $visited = New-Object 'bool[]' ($width * $height)
    $queue = New-Object 'System.Collections.Generic.Queue[int]'
    $isBackground = {
        param($pixel)
        $max = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
        $min = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
        return (($max - $min) -lt 19 -and $min -gt 208)
    }
    $enqueue = {
        param([int]$x, [int]$y)
        $id = $y * $width + $x
        if (-not $visited[$id] -and (& $isBackground $bitmap.GetPixel($x, $y))) {
            $visited[$id] = $true; $queue.Enqueue($id)
        }
    }
    for ($x = 0; $x -lt $width; $x++) { & $enqueue $x 0; & $enqueue $x ($height - 1) }
    for ($y = 0; $y -lt $height; $y++) { & $enqueue 0 $y; & $enqueue ($width - 1) $y }
    while ($queue.Count -gt 0) {
        $id = $queue.Dequeue(); $x = $id % $width; $y = [int][Math]::Floor($id / $width)
        $bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        if ($x -gt 0) { & $enqueue ($x - 1) $y }; if ($x -lt $width - 1) { & $enqueue ($x + 1) $y }
        if ($y -gt 0) { & $enqueue $x ($y - 1) }; if ($y -lt $height - 1) { & $enqueue $x ($y + 1) }
    }
}

function Keep-LargestAlphaComponent([System.Drawing.Bitmap]$bitmap) {
    $width=$bitmap.Width; $height=$bitmap.Height; $visited=New-Object 'bool[]' ($width*$height)
    $largest=New-Object 'System.Collections.Generic.List[int]'
    for($seed=0;$seed-lt$width*$height;$seed++){
        if($visited[$seed]){continue};$sx=$seed%$width;$sy=[int][Math]::Floor($seed/$width)
        if($bitmap.GetPixel($sx,$sy).A-le12){$visited[$seed]=$true;continue}
        $component=New-Object 'System.Collections.Generic.List[int]';$queue=New-Object 'System.Collections.Generic.Queue[int]';$queue.Enqueue($seed);$visited[$seed]=$true
        while($queue.Count){$id=$queue.Dequeue();$component.Add($id);$x=$id%$width;$y=[int][Math]::Floor($id/$width);foreach($next in @($id-1,$id+1,$id-$width,$id+$width)){if($next-lt0-or$next-ge$width*$height-or$visited[$next]){continue};$nx=$next%$width;$ny=[int][Math]::Floor($next/$width);if([Math]::Abs($nx-$x)+[Math]::Abs($ny-$y)-ne1){continue};$visited[$next]=$true;if($bitmap.GetPixel($nx,$ny).A-gt12){$queue.Enqueue($next)}}}
        if($component.Count-gt$largest.Count){$largest=$component}
    }
    $keep=New-Object 'System.Collections.Generic.HashSet[int]';foreach($id in $largest){[void]$keep.Add($id)}
    for($id=0;$id-lt$width*$height;$id++){if(-not$keep.Contains($id)){$bitmap.SetPixel($id%$width,[int][Math]::Floor($id/$width),[System.Drawing.Color]::Transparent)}}
}

$sheets = @(
    @{ Path = 'C:\Users\brico\.codex\generated_images\01a0438c-21e6-75a0-bf84-4c3a1b23aa07\exec-d4d214aa-63d6-4d3b-9268-57c39d3bf3e2.png'; Start = 1; Crop = 205; X = @(0.31, 0.505, 0.70); RemoveGrid = $true },
    @{ Path = 'C:\Users\brico\.codex\generated_images\01a0438c-21e6-75a0-bf84-4c3a1b23aa07\exec-d9e2d2c6-9fb8-4fe2-bde4-f316b9799626.png'; Start = 7; Crop = 165; Crops = @(165, 165, 165, 170, 170, 112); X = @(0.31, 0.505, 0.70); Y = @(117, 300, 481, 664, 845, 1168); RemoveGrid = $true },
    @{ Path = 'C:\Users\brico\.codex\generated_images\01a0438c-21e6-75a0-bf84-4c3a1b23aa07\exec-3a6e79bf-f653-45a3-945c-d9f2b22e3a09.png'; Start = 13; Crop = 200; Crops = @(190, 190, 200, 198, 198, 240); X = @(0.287, 0.502, 0.724); Y = @(100, 297, 499, 708, 904, 1127); RemoveGrid = $false }
)
$types = @('infantry', 'lancer', 'marksman')
$destination = Join-Path $PSScriptRoot '..\assets\generated\charms'
New-Item -ItemType Directory -Force -Path $destination | Out-Null

foreach ($sheet in $sheets) {
    $source = [System.Drawing.Bitmap]::FromFile($sheet.Path)
    try {
        for ($row = 0; $row -lt 6; $row++) {
            for ($column = 0; $column -lt 3; $column++) {
                $size = if ($sheet.Crops) { [int]$sheet.Crops[$row] } else { [int]$sheet.Crop }
                $centerX = [int]($source.Width * $sheet.X[$column])
                $centerY = if ($sheet.Y) { [int]$sheet.Y[$row] } else { [int]($source.Height * (($row + 0.5) / 6)) }
                $sourceRect = New-Object System.Drawing.Rectangle ($centerX - [int]($size / 2)), ($centerY - [int]($size / 2)), $size, $size
                $sprite = New-Object System.Drawing.Bitmap 256, 256, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
                $graphics = [System.Drawing.Graphics]::FromImage($sprite)
                try {
                    $graphics.Clear([System.Drawing.Color]::Transparent)
                    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle 0, 0, 256, 256), $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
                } finally { $graphics.Dispose() }

                if ($sheet.RemoveGrid) {
                    $uncut = $sprite.Clone()
                    Remove-ConnectedBackground $sprite
                    # The early gem silhouettes are convex. Restore neutral
                    # highlights between their left/right opaque edges so the
                    # white shine is not mistaken for the checkerboard.
                    for ($y = 0; $y -lt 256; $y++) {
                        $left = 256; $right = -1
                        for ($x = 0; $x -lt 256; $x++) {
                            if ($sprite.GetPixel($x, $y).A -gt 12) { if ($x -lt $left) { $left = $x }; $right = $x }
                        }
                        if ($right -ge $left) {
                            for ($x = $left; $x -le $right; $x++) {
                                if ($sprite.GetPixel($x, $y).A -eq 0) { $sprite.SetPixel($x, $y, $uncut.GetPixel($x, $y)) }
                            }
                        }
                    }
                    $uncut.Dispose()
                }

                # Replace the variable crop scale with one consistent visual
                # footprint while preserving each charm's aspect ratio.
                $minX = 256; $minY = 256; $maxX = -1; $maxY = -1
                for ($y = 0; $y -lt 256; $y++) {
                    for ($x = 0; $x -lt 256; $x++) {
                        if ($sprite.GetPixel($x, $y).A -gt 12) {
                            if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
                            if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
                        }
                    }
                }
                if ($maxX -ge $minX -and $maxY -ge $minY) {
                    $boxWidth = $maxX - $minX + 1; $boxHeight = $maxY - $minY + 1
                    $scale = [Math]::Min(210.0 / $boxWidth, 210.0 / $boxHeight)
                    $drawWidth = [int]($boxWidth * $scale); $drawHeight = [int]($boxHeight * $scale)
                    $normal = New-Object System.Drawing.Bitmap 256, 256, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
                    $normalGraphics = [System.Drawing.Graphics]::FromImage($normal)
                    try {
                        $normalGraphics.Clear([System.Drawing.Color]::Transparent)
                        $normalGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                        $destinationRect = New-Object System.Drawing.Rectangle ([int]((256-$drawWidth)/2)), ([int]((256-$drawHeight)/2)), $drawWidth, $drawHeight
                        $contentRect = New-Object System.Drawing.Rectangle $minX, $minY, $boxWidth, $boxHeight
                        $normalGraphics.DrawImage($sprite, $destinationRect, $contentRect, [System.Drawing.GraphicsUnit]::Pixel)
                    } finally { $normalGraphics.Dispose() }
                    $sprite.Dispose(); $sprite = $normal
                }

                $level = $sheet.Start + $row
                if ($level -eq 12) {
                    Keep-LargestAlphaComponent $sprite
                }
                $name = 'charm-{0:D2}-{1}.png' -f $level, $types[$column]
                $sprite.Save((Join-Path $destination $name), [System.Drawing.Imaging.ImageFormat]::Png)
                $sprite.Dispose()
            }
        }
    } finally { $source.Dispose() }
}
