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

	public static function getRefs($v)
	{
		$r = [];

		foreach (explode(';', $v) as $x)
		{
			$s = explode(':', $x);
			if (count($s) !== 2) continue;

			$r []= ['k' => $s[0], 'v' => $s[1]];
		}

		return $r;
	}

	public static function getClientIP()
	{
		if (getenv('HTTP_CLIENT_IP')) return getenv('HTTP_CLIENT_IP');
		else if(getenv('HTTP_X_FORWARDED_FOR')) return getenv('HTTP_X_FORWARDED_FOR');
		else if(getenv('HTTP_X_FORWARDED')) return getenv('HTTP_X_FORWARDED');
		else if(getenv('HTTP_FORWARDED_FOR')) return getenv('HTTP_FORWARDED_FOR');
		else if(getenv('HTTP_FORWARDED')) return getenv('HTTP_FORWARDED');
		else if(getenv('REMOTE_ADDR')) return getenv('REMOTE_ADDR');
		else if (isset($_SERVER['HTTP_CLIENT_IP'])) return $_SERVER['HTTP_CLIENT_IP'];
		else if(isset($_SERVER['HTTP_X_FORWARDED_FOR'])) return $_SERVER['HTTP_X_FORWARDED_FOR'];
		else if(isset($_SERVER['HTTP_X_FORWARDED'])) return $_SERVER['HTTP_X_FORWARDED'];
		else if(isset($_SERVER['HTTP_FORWARDED_FOR'])) return $_SERVER['HTTP_FORWARDED_FOR'];
		else if(isset($_SERVER['HTTP_FORWARDED'])) return $_SERVER['HTTP_FORWARDED'];
		else if(isset($_SERVER['REMOTE_ADDR'])) return $_SERVER['REMOTE_ADDR'];
		else return 'UNKNOWN';
	}

	public static function appendLog(string $type, string $path)
	{
		$line =
			'[' . (new DateTime())->format('Y-m-d H:i:s') . '] ' .
			str_pad($type, 6, ' ', STR_PAD_RIGHT) .
			str_pad($path, 16, ' ', STR_PAD_RIGHT) .
			str_pad(self::getClientIP(), 24, ' ', STR_PAD_RIGHT) .
			(isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '');

		file_put_contents(UserConfig::get('requestlog_path'), $line . PHP_EOL , FILE_APPEND | LOCK_EX);
	}
}