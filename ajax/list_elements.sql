SELECT
       LOCALID, COVERID,
       0 AS TYPE,
	   NAME, ZYKLUS, ZYKLUSNUMBER,
       VIEWED_HISTORY, SCORE, GROUPS, TAGS,
	   ONLINESCORE_NUM, ONLINESCORE_DENOM, MOVIEYEAR, LENGTH, FILESIZE, LANGUAGE, FORMAT, FSK, GENRE, ONLINEREF,
       ADDDATE
FROM MOVIES

UNION

SELECT
	LOCALID, COVERID,
	1 AS TYPE,
	NAME, '' AS ZYKLUS, 0 AS ZYKLUSNUMBER,
	'' AS VIEWED_HISTORY, SCORE, GROUPS, TAGS,
	ONLINESCORE_NUM, ONLINESCORE_DENOM, 0 AS MOVIEYEAR, 0 AS LENGTH, 0 AS FILESIZE, 0 AS LANGUAGE, 0 AS FORMAT, FSK, GENRE, ONLINEREF,
	'' AS ADDDATE
FROM SERIES

ORDER BY ADDDATE DESC