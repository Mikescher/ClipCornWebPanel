<?php


class Util
{
	public static function getBits($v, $max=32)
	{
		$r = [];
		for($i=0; $i<$max; $i++)
		{
			if (($v & (1<<$i)) != 0) $r []= $i;
		}
		return $r;
	}

	public static function getGenres($v)
	{
		$r = [];

		for ($i=0; $i<8; $i++)
		{
			$vv = $v & 0xFF;
			if ($vv !== 0) $r []= $vv;
			$v = $v >> 8;
		}

		return $r;
	}
}