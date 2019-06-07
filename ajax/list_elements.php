<?php

require_once (__DIR__ . '/../model/Base.php');

$db = Database::connect();

if (isset($_GET['limit']))
	$data = $db->sql_query_assoc("SELECT * FROM ELEMENTS ORDER BY ADDDATE DESC LIMIT " . $_GET['limit']);
else
	$data = $db->sql_query_assoc("SELECT * FROM ELEMENTS ORDER BY ADDDATE DESC");

$json = [];

foreach ($data as $dat)
{
	$json []=
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
}

if (isset($_GET['fmt']) && $_GET['fmt'] == '1')
	echo json_encode($json, JSON_PRETTY_PRINT);
else
	echo json_encode($json);