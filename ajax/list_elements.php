<?php

try
{
	require_once (__DIR__ . '/../model/Base.php');

	Util::appendLog('AJAX', 'list_elements');

	$db = Database::connect();

	$sql = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'list_elements.sql');

	if (isset($_GET['limit']))
		$data = $db->sql_query_assoc($sql . " LIMIT " . intval($_GET['limit']));
	else
		$data = $db->sql_query_assoc($sql);

	$json = [];

	foreach ($data as $dat)
	{
		$jdat =
		[
			'id'   => intval($dat['LOCALID']),
			'cid'  => intval($dat['COVERID']),
			'name' => $dat['NAME'],
			'vwd'  => ($dat['VIEWED_HISTORY']!==''),
			'his'  => ($dat['VIEWED_HISTORY']==='') ? [] : explode(',', $dat['VIEWED_HISTORY']),
			'zykl' => $dat['ZYKLUS'],
			'znum' => $dat['ZYKLUSNUMBER'],
			'os_n' => intval($dat['ONLINESCORE_NUM']),
			'os_d' => intval($dat['ONLINESCORE_DENOM']),
			'os_f' => (int)round((intval($dat['ONLINESCORE_NUM']) * 10.0) / intval($dat['ONLINESCORE_DENOM'])),
			'scr'  => intval($dat['SCORE']),
			'year' => intval($dat['MOVIEYEAR']),
			'ser'  => $dat['TYPE']=='1',
			'len'  => intval($dat['LENGTH']),
			'siz'  => longval($dat['FILESIZE']),
			'grp'  => ($dat['GROUPS']=='') ? [] : explode(';', $dat['GROUPS']),
			'lng'  => Util::getBits(intval($dat['LANGUAGE'])),
			'fmt'  => intval($dat['FORMAT']),
			'fsk'  => intval($dat['FSK']),
			//'qal'  => intval($dat['QUALITY']),
			'tgs'  => Util::getBits(intval($dat['TAGS'])),
			'gnr'  => Util::getGenres(longval($dat['GENRE'])),
			'add'  => $dat['ADDDATE'],
			'ref'  => Util::getRefs($dat['ONLINEREF']),
		];

		if ($dat['TYPE']=='1')
		{
			$episodes = $db->sql_query_assoc("SELECT SEASONS.LOCALID AS tmp1,SEASONS.SERIESID AS tmp2,SEASONS.SEASONYEAR AS SYEAR,EPISODES.* FROM SEASONS INNER JOIN EPISODES ON SEASONS.LOCALID=EPISODES.SEASONID WHERE tmp2=".$dat['LOCALID']);

			$jdat['sepc'] = count($episodes);

			$add = array_map(function ($a){ return $a['ADDDATE']; }, $episodes);
			sort($add);
			$jdat['sadd'] = (count($add)===0) ? '1900-01-01' : $add[0];

			$jdat['slen'] = array_sum(array_map(function ($a){ return $a['LENGTH']; }, $episodes));

			$jdat['ssiz'] = array_sum(array_map(function ($a){ return $a['FILESIZE']; }, $episodes));

			$jdat['syer'] = min(array_map(function ($a){ return $a['SYEAR']; }, $episodes)) . ' - ' . max(array_map(function ($a){ return $a['SYEAR']; }, $episodes));

			$vtrue  = false;
			$vfalse = false;
			foreach ($episodes as $e) if ($e['VIEWED_HISTORY']!=='') $vtrue=true;
			foreach ($episodes as $e) if ($e['VIEWED_HISTORY']==='') $vfalse=true;
				 if (!$vtrue &&  $vfalse) $jdat['svwd'] = 0;
			else if ( $vtrue && !$vfalse) $jdat['svwd'] = 1;
			else if ( $vtrue &&  $vfalse) $jdat['svwd'] = 4;
			else if (!$vtrue && !$vfalse) $jdat['svwd'] = 0;

			$slng = [];
			foreach ($episodes as $xep) foreach (Util::getBits(intval($xep['LANGUAGE'])) as $lng)  if (!in_array($lng, $slng)) $slng []= $lng;
			$jdat['slng'] = $slng;
		}

		$json []= $jdat;
	}

	usort($json, function ($a, $b) { return -strcmp($a['ser']?$a["sadd"]:$a["add"], $b['ser']?$b["sadd"]:$b["add"]); });

	header('Content-Type: application/json');

	if (isset($_GET['fmt']) && $_GET['fmt'] == '1')
		echo json_encode($json, JSON_PRETTY_PRINT);
	else
		echo json_encode($json);
}
catch (Throwable $e)
{
	@header('Content-Type: text/plain');
	@http_response_code(500);
	echo $e;
}