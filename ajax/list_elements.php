<?php

require_once (__DIR__ . '/../model/Base.php');

$db = Database::connect();

$data = $db->sql_query_assoc("SELECT * FROM ELEMENTS");

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
		'siz'  => intval($dat['FILESIZE']),
		'grp'  => ($dat['GROUPS']=='') ? [] : explode(';', $dat['GROUPS']),
	];
}

echo json_encode($json);