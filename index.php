<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<title>jClipCorn - Web panel</title>
	<link rel="icon" type="image/png" href="/data/icon.png"/>
    <link rel="stylesheet" href="/data/styles.css"/>
    <link rel="stylesheet" href="/data/styles-icons.css"/>
    <link rel="stylesheet" href="/data/styles-ext.css"/>
</head>
<body>

	<div id="root">

		<div id="sidebar">
            <a href="#" id="sb_0" class="sidebar-level-1">All</a>
            <div id="sc_0"></div>
            <a href="#" id="sb_1" class="sidebar-level-1">Groups</a>
            <div id="sc_1"></div>
            <a href="#" id="sb_2" class="sidebar-level-1">Genres</a>
            <div id="sc_2"></div>
            <a href="#" id="sb_3" class="sidebar-level-1">Rating</a>
            <div id="sc_3"></div>
            <a href="#" id="sb_4" class="sidebar-level-1">User score</a>
            <div id="sc_4"></div>
            <a href="#" id="sb_5" class="sidebar-level-1">Parental rating</a>
            <div id="sc_5"></div>
            <a href="#" id="sb_6" class="sidebar-level-1">Format</a>
            <div id="sc_6"></div>
            <a href="#" id="sb_7" class="sidebar-level-1">Quality</a>
            <div id="sc_7"></div>
            <a href="#" id="sb_8" class="sidebar-level-1">Tags</a>
            <div id="sc_8"></div>
            <a href="#" id="sb_9" class="sidebar-level-1">Language</a>
            <div id="sc_9"></div>
            <a href="#" id="sb_A" class="sidebar-level-1">Type</a>
            <div id="sc_A"></div>
            <a href="#" id="sb_B" class="sidebar-level-1">Viewed</a>
            <div id="sc_B"></div>
		</div>

		<div id="content">

			<div id="header">
				<div id="headertext"><img src="/data/icon.png" /><span>jClipCorn</span></div>
				<input type="text" id="filter" placeholder="Search" >
			</div>

            <div id="maintable">

                <!-- AJAX -->
                <div id="rippleloader" class="lds-ripple"><div></div><div></div></div>

            </div>

            <div id="footer">

                <a href="#" id="prevpage">Previous page</a>
                <!-- AJAX -->
                <a href="#" id="nextpage">Next page</a>

            </div>

		</div>

	</div>

    <script src="/data/jquery-3.4.1.js" type="text/javascript" ></script>
    <script src="/data/script.js" type="text/javascript" ></script>
    <script src="/data/jquery.lazy.min.js" type="text/javascript" ></script>

</body>
</html>