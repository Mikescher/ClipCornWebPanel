<?php

require_once (__DIR__ . '/../model/Base.php');

$db = Database::connect();

if (isset($_GET['limit']))
	$data = $db->sql_query_assoc("SELECT * FROM ELEMENTS ORDER BY ADDDATE DESC LIMIT " . intval($_GET['limit']));
else
	$data = $db->sql_query_assoc("SELECT * FROM ELEMENTS ORDER BY ADDDATE DESC");

$json = [];

foreach ($data as $dat)
{
	$jdat =
	[
		'id'   => intval($dat['LOCALID']),
		'sid'  => intval($dat['SERIESID']),
		'cid'  => intval($dat['COVERID']),
		'name' => $dat['NAME'],
		'vwd'  => $dat['VIEWED']=='1',
		'his'  => ($dat['VIEWED_HISTORY']=='') ? [] : explode(',', $dat['VIEWED_HISTORY']),
		'zykl' => $dat['ZYKLUS'],
		'znum' => $dat['ZYKLUSNUMBER'],
		'oscr' => intval($dat['ONLINESCORE']),
		'scr'  => intval($dat['SCORE']),
		'year' => intval($dat['MOVIEYEAR']),
		'ser'  => $dat['TYPE']=='1',
		'len'  => intval($dat['LENGTH']),
		'siz'  => longval($dat['FILESIZE']),
		'grp'  => ($dat['GROUPS']=='') ? [] : explode(';', $dat['GROUPS']),
		'lng'  => Util::getBits(intval($dat['LANGUAGE'])),
		'fmt'  => intval($dat['FORMAT']),
		'fsk'  => intval($dat['FSK']),
		'qal'  => intval($dat['QUALITY']),
		'tgs'  => Util::getBits(intval($dat['TAGS'])),
		'gnr'  => Util::getGenres(longval($dat['GENRE'])),
		'add'  => $dat['ADDDATE'],
	];

	if ($dat['TYPE']=='1')
	{
		$episodes = $db->sql_query_assoc("SELECT SEASONS.SEASONID AS tmp1,SEASONS.SERIESID AS tmp2,SEASONS.SEASONYEAR AS SYEAR,EPISODES.* FROM SEASONS INNER JOIN EPISODES ON SEASONS.SEASONID=EPISODES.SEASONID WHERE tmp2=".$dat['SERIESID']);

		$jdat['sepc'] = count($episodes);

		$add = array_map(function ($a){ return $a['ADDDATE']; }, $episodes);
		sort($add);
		$jdat['sadd'] = (count($add)===0) ? '1900-01-01' : $add[0];

		$jdat['slen'] = array_sum(array_map(function ($a){ return $a['LENGTH']; }, $episodes));

		$jdat['ssiz'] = array_sum(array_map(function ($a){ return $a['FILESIZE']; }, $episodes));

		$jdat['syer'] = min(array_map(function ($a){ return $a['SYEAR']; }, $episodes)) . ' - ' . max(array_map(function ($a){ return $a['SYEAR']; }, $episodes));
	}

	$json []= $jdat;
}

usort($json, function ($a, $b) { return -strcmp($a['ser']?$a["sadd"]:$a["add"], $b['ser']?$b["sadd"]:$b["add"]); });

if (isset($_GET['fmt']) && $_GET['fmt'] == '1')
	echo json_encode($json, JSON_PRETTY_PRINT);
else
	echo json_encode($json);