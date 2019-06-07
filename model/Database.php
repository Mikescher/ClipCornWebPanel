<?php

class Database
{
	/* @var PDO $PDO */
	private  $PDO = NULL;

	public static function connect()
	{
		$dsn = "sqlite:" . UserConfig::get("sqlite_path");
		$opt =
		[
			PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		];

		$db = new Database();

		$db->PDO = new PDO($dsn, '', '', $opt);

		return $db;
	}

	public function sql_query_assoc($query)
	{
		return $this->PDO->query($query)->fetchAll(PDO::FETCH_ASSOC);
	}

	public function sql_query_single($query)
	{
		return $this->PDO->query($query)->fetchAll(PDO::FETCH_ASSOC)[0];
	}

	public function sql_query_blob($query)
	{
		$query = $this->PDO->prepare($query);
		$query->execute([]);

		$query->bindColumn(1, $image, PDO::PARAM_LOB);
		$query->fetch(PDO::FETCH_BOUND);
		return $image;
	}

}