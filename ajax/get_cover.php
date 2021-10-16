<?php

try
{
	require_once (__DIR__ . '/../model/Base.php');

	Util::appendLog('AJAX', 'get_cover');

	$db = Database::connect();

	$dbresult = $db->sql_query_single("SELECT PREVIEW FROM COVERS WHERE ID=".intval($_GET['cid']))['PREVIEW'];

	$data = unpack('C*', $dbresult);

	$w = $data[1+0];
	$h = $data[1+1];

	$im = imagecreate($w, $h);
	$c0 = imagecolorallocate($im, 0, 0, 0);

	$palette = [];

	for ($i = 0; $i < 16; $i++)
	{
		$r = $data[1+2 + $i*3    ];
		$g = $data[1+2 + $i*3 + 1];
		$b = $data[1+2 + $i*3 + 2];

		$palette []= imagecolorallocate($im, $r, $g, $b);
	}

	$offset = 0;
	for ($y = 0; $y < $h; $y++)
	{
		for ($x = 0; $x < $w; $x++)
		{
			if ($offset % 2 == 0)
			{
				$idx = $data[1+2 + 16*3 + $offset/2];
				$idx = ($idx>>4)&0x0F;

				imagesetpixel($im, $x, $y, $palette[$idx]);
			}
			else
			{
				$idx = $data[1+2 + 16*3 + $offset/2];
				$idx = $idx&0x0F;

				imagesetpixel($im, $x, $y, $palette[$idx]);
			}
			$offset++;
		}
	}

	header("Content-type: image/png");
	imagepng($im);
	imagedestroy($im);
}
catch (Throwable $e)
{
	@header('Content-Type: text/plain');
	@http_response_code(500);
	echo $e;
}