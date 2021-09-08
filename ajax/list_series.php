<?php

require_once (__DIR__ . '/../model/Base.php');

Util::appendLog('AJAX', 'list_series');

$db = Database::connect();

$data_ser  = $db->sql_query_assoc("SELECT * FROM SERIES WHERE LOCALID = " . intval($_GET['id']))[0];
$data_seas = $db->sql_query_assoc("SELECT * FROM SEASONS WHERE SERIESID = " . intval($_GET['id']));
$data_epis = $db->sql_query_assoc("SELECT SEASONS.LOCALID, EPISODES.* FROM EPISODES LEFT JOIN SEASONS ON EPISODES.SEASONID = SEASONS.LOCALID WHERE SERIESID = " . intval($_GET['id']));

$json =
[
	'lid' => intval($data_ser['LOCALID']),
	'cid'  => intval($data_ser['COVERID']),
	'name' => $data_ser['NAME'],
];

$json_seasons = [];
foreach ($data_seas as $dbseas)
{
	$seaid = intval($dbseas['LOCALID']);

	$jdat_seas =
	[
		'id'   => intval($dbseas['LOCALID']),
		'name' => $dbseas['NAME'],
		'cid'  => intval($dbseas['COVERID']),
		'year'  => intval($dbseas['SEASONYEAR']),
	];

	$json_episodes = [];
	foreach ($data_epis as $dbepis)
	{
		if (intval($dbepis['SEASONID']) !== $seaid) continue;

		$jdat_epis =
		[
			'id'   => intval($dbepis['LOCALID']),
			'epis' => intval($dbepis['EPISODE']),
			'name' => $dbepis['NAME'],
			'vwd'  => ($dbepis['VIEWED_HISTORY']!==''),
			'his'  => ($dbepis['VIEWED_HISTORY']=='') ? [] : explode(',', $dbepis['VIEWED_HISTORY']),
			//'qal'  => intval($dbepis['QUALITY']),
			'len'  => intval($dbepis['LENGTH']),
			'fmt'  => intval($dbepis['FORMAT']),
			'siz'  => longval($dbepis['FILESIZE']),
			'add'  => $dbepis['ADDDATE'],
			'tgs'  => Util::getBits(intval($dbepis['TAGS'])),
			'lng'  => Util::getBits(intval($dbepis['LANGUAGE'])),
		];

		$json_episodes []= $jdat_epis;
	}

	usort($json_episodes, function ($a, $b) { return $a['epis'] <=> $b['epis']; });

	$jdat_seas['e'] = $json_episodes;

	$json_seasons []= $jdat_seas;
}

usort($json_seasons, function ($a, $b) { return $a['id'] <=> $b['id']; });

$json['s'] = $json_seasons;

header('Content-Type: application/json');

if (isset($_GET['fmt']) && $_GET['fmt'] == '1')
	echo json_encode($json, JSON_PRETTY_PRINT);
else
	echo json_encode($json);