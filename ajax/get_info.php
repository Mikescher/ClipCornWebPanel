<?php

require_once (__DIR__ . '/../model/Base.php');

Util::appendLog('AJAX', 'get_info');

$db = Database::connect();

$data = $db->sql_query_assoc("SELECT * FROM INFO");

$json = [];

foreach ($data as $dat) $json[$dat["IKEY"]] = $dat["IVALUE"];

$json['FILESIZE'] = filesize(UserConfig::get("sqlite_path"));

$json['COMMIT'] = strtoupper(substr(trim(exec("git rev-parse HEAD")), 0, 8));

header('Content-Type: application/json');
echo json_encode($json, JSON_PRETTY_PRINT);