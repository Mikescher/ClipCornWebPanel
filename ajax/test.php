<?php


$im = imagecreate(24, 33);

$c0 = imagecolorallocate($im, 0, 0, 0);

$c1 = imagecolorallocate($im, 0, 0, 0);
$c2 = imagecolorallocate($im, 200, 222, 102);
$c3 = imagecolorallocate($im, 0, 0, 20);
$c4 = imagecolorallocate($im, 0, 120, 0);


imagesetpixel($im, 0, 3, $c2);
imagesetpixel($im, 1, 3, $c2);
imagesetpixel($im, 2, 3, $c2);
imagesetpixel($im, 3, 3, $c2);
imagesetpixel($im, 4, 3, $c2);

header("Content-Type: image/png");
imagepng($im);
imagedestroy($im);