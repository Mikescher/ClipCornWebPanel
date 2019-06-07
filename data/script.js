$(window).on('load', function()
{
	$.ajax({
		//url: "/ajax/list_elements.php?limit=100&fmt=1",
		url: "/ajax/list_elements.php",
		success: function(data)
		{
			let json = JSON.parse(data);

			let groups = [];
			let genres = [];
			let langs  = [];

			for (let e of json)
			{
				if (e['ser']) addSeriesEntry(e);
				else          addMovieEntry(e);

				for (let vvv of e['grp']) if (!groups.includes(vvv)) groups.push(vvv);
				for (let vvv of e['gnr']) if (!genres.includes(vvv)) genres.push(vvv);
				for (let vvv of e['lng']) if (!langs.includes(vvv))  langs.push(vvv);
			}

			$('#rippleloader').remove();

			setSidebarValues(false, groups, true, $('#sc_1'), null, null);
			setSidebarValues(false, genres, false, $('#sc_2'), null, getGenreTitle);
			setSidebarValues(false, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], false, $('#sc_3'), 'onlinescore-', null);
			setSidebarValues(false, [0, 1, 2, 3, 4, 5, 6], false, $('#sc_4'), 'score-', getScoreTitle);
			setSidebarValues(false, [0, 1, 2, 3, 4], false, $('#sc_5'), 'fsk-', getFSKTitle);
			setSidebarValues(false, [0, 1, 2, 3, 4, 5, 6, 7, 8], false, $('#sc_6'), 'format-', getFormatTitle);
			setSidebarValues(false, [0, 1, 2, 3, 4], false, $('#sc_7'), 'fsk-', getQualityTitle);
			setSidebarValues(false, [0, 1, 2, 3, 4, 5, 6, 7, 8], false, $('#sc_8'), 'tag-', getTagTitle);
			setSidebarValues(true,  langs, false, $('#sc_9'), 'lang-', getLangTitle);
			setSidebarValues(false, [0, 1], false, $('#sc_A'), 'typ-', function (i) {return (i===0)?'Movie':'Series'});
			setSidebarValues(false, [0, 1], false, $('#sc_B'), 'view-', function (i) {return (i===1)?'Viewed':'Not viewed'});

			return data;
		}
	});

	$("#sb_0").click(function () { collapseSidebar(0x0); });
	$("#sb_1").click(function () { collapseSidebar(0x1); });
	$("#sb_2").click(function () { collapseSidebar(0x2); });
	$("#sb_3").click(function () { collapseSidebar(0x3); });
	$("#sb_4").click(function () { collapseSidebar(0x4); });
	$("#sb_5").click(function () { collapseSidebar(0x5); });
	$("#sb_6").click(function () { collapseSidebar(0x6); });
	$("#sb_7").click(function () { collapseSidebar(0x7); });
	$("#sb_8").click(function () { collapseSidebar(0x8); });
	$("#sb_9").click(function () { collapseSidebar(0x9); });
	$("#sb_A").click(function () { collapseSidebar(0xA); });
	$("#sb_B").click(function () { collapseSidebar(0xB); });

	collapseSidebar(0);
});

function collapseSidebar(v) {
	if (v !== 0x0) $("#sc_0").css('visibility', 'collapse'); else $("#sc_0").css('visibility', 'visible');
	if (v !== 0x1) $("#sc_1").css('visibility', 'collapse'); else $("#sc_1").css('visibility', 'visible');
	if (v !== 0x2) $("#sc_2").css('visibility', 'collapse'); else $("#sc_2").css('visibility', 'visible');
	if (v !== 0x3) $("#sc_3").css('visibility', 'collapse'); else $("#sc_3").css('visibility', 'visible');
	if (v !== 0x4) $("#sc_4").css('visibility', 'collapse'); else $("#sc_4").css('visibility', 'visible');
	if (v !== 0x5) $("#sc_5").css('visibility', 'collapse'); else $("#sc_5").css('visibility', 'visible');
	if (v !== 0x6) $("#sc_6").css('visibility', 'collapse'); else $("#sc_6").css('visibility', 'visible');
	if (v !== 0x7) $("#sc_7").css('visibility', 'collapse'); else $("#sc_7").css('visibility', 'visible');
	if (v !== 0x8) $("#sc_8").css('visibility', 'collapse'); else $("#sc_8").css('visibility', 'visible');
	if (v !== 0x9) $("#sc_9").css('visibility', 'collapse'); else $("#sc_9").css('visibility', 'visible');
	if (v !== 0xA) $("#sc_A").css('visibility', 'collapse'); else $("#sc_A").css('visibility', 'visible');
	if (v !== 0xB) $("#sc_B").css('visibility', 'collapse'); else $("#sc_B").css('visibility', 'visible');
}


function setSidebarValues(presorted, values, sorted, target, icon, txtconvert)
{
	if (presorted) values.sort();

	if (txtconvert !== null)
	{
		let values2 = [];
		for(let val of values)
		{
			let txt = txtconvert(val);
			let icn = '';
			if (icon !== null) icn = '<i class="icn ' + icon + val + '"></i>';
			values2.push(icn + txt);
		}
		values = values2;
	}
	else if (icon !== null)
	{
		let values2 = [];
		for(let val of values)
		{
			values2.push('<i class="icn ' + icon + val + '"></i>');
		}
		values = values2;
	}

	if (sorted) values.sort();

	let html = '';

	for(let val of values)
	{
		html += '<a href="#" class="sidebar-level-2">'+val+'</a>';
	}

	target.append(html)
}

function fmtZyklusNum(num)
{
	if (num === -1) return '';

	let digits = String(+num).split("");
	let key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM","","X","XX","XXX","XL","L","LX","LXX","LXXX","XC","","I","II","III","IV","V","VI","VII","VIII","IX"];
	let roman = "";
	let i = 3;
	while (i--) roman = (key[+digits.pop() + (i * 10)] || "") + roman;
	return ' ' + Array(+digits.join("") + 1).join("M") + roman;
}

function getScoreTitle(scr)
{
	return ['Crappy Movie', 'Bad Movie', 'Not recommended', 'Good enough', 'Recommended', 'Masterpiece', '<i>Unset</i>'][scr];
}

function getLangTitle(lng)
{
	if (lng===-1) return 'None';
	return ['German', 'English', 'Muted', 'French', 'Japanese', 'Italian', 'Spanish', 'Portuguese', 'Danish', 'Finnish', 'Swedisch', 'Norwegian', 'Dutch', 'Czech', 'Polish', 'Turkish', 'Hungarian', 'Bulgarian', 'Russian', 'Chinese'][lng];
}

function getQualityTitle(qal)
{
	return ['Stream', 'CD', 'CD\'s', 'DVD', 'BluRay'][qal];
}

function getFSKTitle(fsk)
{
	return ['FSK-0', 'FSK-6', 'FSK-12', 'FSK-16', 'FSK-18'][fsk];
}

function getFormatTitle(fmt)
{
	return ['MKV', 'AVI', 'MPEG', 'IMG', 'IFO', 'WMV', 'MP4', 'DIVX', 'FLV'][fmt];
}

function getTagTitle(tag)
{
	return ['Low Quality', 'Missing Time', 'Broken File', 'Watch later', 'Wrong Language', 'Watch never', 'CamRip', 'MicDubbed', 'Cancelled'][tag];
}

function getGenreTitle(tag)
{
	return ['NO_GENRE', 'Disaster Movie', 'Road Movie', 'Western', 'Italo-Western', 'Sentimental film', 'Thriller', 'Actionthriller', 'Psychothriller', 'Science Fiction', 'Comedy', 'Slapstick-Comedy', 'Screwball-Comedy', 'Gangstermovie', 'Crime Story', 'War Movie', 'Porno', 'Softporno', 'Hardcore-Porno', 'Actionmovie', 'Animation', 'Cartoon', 'Anime', 'Stop-Motion-Movie', 'Puppet Movie', 'Claymation', 'Computer Animation Movie', 'Martial-Arts-Movie', 'Samuraimovie', 'Horror Movie', 'Slasher', 'Teenhorror', 'Creature', 'ComingOfAge', 'Documentary', 'Adventure', 'Romance', 'Mystery', 'Fantasy', 'Family', 'Drama', 'Anti-War Movie', 'Biographie', 'Sport', 'Music', 'Musical', 'History', 'Film Noir', 'Kids movie', 'Soap opera', 'Slice of Life', 'Shounen', 'Shoujo', 'School', 'Mecha', 'Parody', 'Isekai'][tag];
}

function formatLength(mins) {
	let res = ""; //$NON-NLS-1$

	let fullmins = mins % 60;
	mins -= fullmins;
	mins /= 60;
	mins = Math.floor(mins);
	let fullhours = mins % 24;
	mins -= fullhours;
	mins /= 24;
	mins = Math.floor(mins);
	let fulldays = mins % 365;
	mins -= fulldays;
	mins /= 365;
	mins = Math.floor(mins);
	let fullyears = mins;

	let render = false;
	if (fullyears !== 0 || render) {
		if (fullyears !== 1) {
			res += fullyears + " Years, "; //$NON-NLS-1$ //$NON-NLS-2$
		} else {
			res += fullyears + " Year, "; //$NON-NLS-1$ //$NON-NLS-2$
		}
		render = true;
	}

	if (fulldays !== 0 || render) {
		if (fulldays !== 1) {
			res += fulldays + " Days, "; //$NON-NLS-1$ //$NON-NLS-2$
		} else {
			res += fulldays + " Day, "; //$NON-NLS-1$ //$NON-NLS-2$
		}
		render = true;
	}

	if (fullhours !== 0 || render) {
		res += fullhours + " h, "; //$NON-NLS-1$ //$NON-NLS-2$
		render = true;
	}

	if (fullmins !== 0 || render) {
		res += fullmins + " min"; //$NON-NLS-1$
		render = true;
	}

	return res;
}

function formatSize(bytes) {
	let UNITS = ["B", "KB","MB","GB","TB","PB","EB"];

	let digitGroups = Math.floor((Math.log10(bytes) / Math.log10(1024)));

	return (bytes / Math.pow(1024, digitGroups)).toFixed(1) + " " + UNITS[digitGroups];
}

function addMovieEntry(e)
{
	let html = '';

	html += '<div class="entry">\r\n';
	html += '<div class="coverbox">';
	html += '<img class="cover" src="https://via.placeholder.com/24x33/000000/FFFFFF" alt="Cover">\r\n';
	if (e['vwd']) html += '<i class="viewed icn viewed-1"></i>\r\n';
	html += '</div>\r\n';

	if (e['scr'] !== 6) html += '<i title="'+getScoreTitle(e['scr'])+'" class="score icn score-'+e['scr']+'"></i>\r\n';

	html += '<div class="text">\r\n';
	if (e['zykl'] !== '')
	{
		html += '<span class="zyklus">' + e['zykl'] + fmtZyklusNum(e['znum']) + '</span>\r\n';
		html += '<span class="delim"> - </span>\r\n';
	}
	html += '<span class="title">' + e['name'] + '</span>\r\n';
	html += '</div>\r\n';

	html += '<div class="icons">\r\n';
	html += '<div class="language">\r\n';
	for (let lng of e['lng']) html += '<i class="icn lang-'+ lng +'" title="' + getLangTitle(lng) + '" ></i>';
	if (e['lng'].length === 0)  html += '<i class="icn lang-none" title="' + getLangTitle(-1) + '" ></i>';
	html += '</div>\r\n';
	html += '<div class="onlinescore" title="' + (e['oscr'] / 2) + ' / 10" ><i class="icn onlinescore-'+ e['oscr'] + '"></i></div>\r\n';
	html += '<div class="quality_fsk_format"><i class="icn quality-'+e['qal']+'" title="'+getQualityTitle(e['qal'])+'"></i><i title="'+getFSKTitle(e['fsk'])+'" class="icn fsk-'+e['fsk']+'"></i><i title="'+getFormatTitle(e['fmt'])+'" class="icn format-'+e['fmt']+'"></i></div>\r\n';
	html += '<div class="tags">\r\n';
	for (let tag of e['tgs']) html += '<i title="'+getTagTitle(tag)+'" class="icn tag-'+tag+'"></i>';
	html += '</div>\r\n';
	html += '</div>\r\n';

	html += '<div class="info">';
	html += '<div class="genres"><div class="cap">Genres:</div>\r\n';
	let f1 = false;
	for (let genre of e['gnr']) { if (f1) html+=' &#183; '; html += '<span>'+getGenreTitle(genre)+'</span>'; f1=true; }
	html += '</div>\r\n';
	if (e['grp'].length > 0)
	{
		html += '<div class="groups"><div class="cap">Groups:</div>\r\n';
		let f2 = false;
		for (let group of e['grp']) { if (f2) html+=' &#183; '; html += '<span>'+group+'</span>'; f2=true; }
		html += '</div>\r\n';
	}
	html += '<div class="length" title="'+formatLength(e['len'])+'"><div class="cap">Length:</div>'+e['len']+' min.</div>\r\n';
	html += '<div class="size"><div class="cap">Size:</div>'+formatSize(e['siz'])+'</div>\r\n';
	html += '<div class="year"><div class="cap">Year:</div>'+e['year']+'</div>\r\n';
	html += '</div>\r\n';

	html += '</div>\r\n';


	$("#maintable").append(html);
}

function addSeriesEntry(e)
{
	let html = '';

	html += '<div class="entry seriesentry">\r\n';
	html += '<div class="coverbox">';
	html += '<img class="coveroverlay" src="/data/mask_series.png" alt="Overlay">\r\n';
	html += '<img class="cover" src="https://via.placeholder.com/24x33/000000/FFFFFF" alt="Cover">\r\n';
	if (e['vwd']) html += '<i class="viewed icn viewed-1"></i>\r\n';
	html += '</div>\r\n';

	if (e['scr'] !== 6) html += '<i title="'+getScoreTitle(e['scr'])+'" class="score icn score-'+e['scr']+'"></i>\r\n';

	html += '<div class="text">\r\n';
	html += '<span class="title">' + e['name'] + '</span>\r\n';
	html += '</div>\r\n';

	html += '<div class="icons">\r\n';
	html += '<div class="onlinescore" title="' + (e['oscr'] / 2) + ' / 10" ><i class="icn onlinescore-'+ e['oscr'] + '"></i></div>\r\n';
	html += '<div class="quality_fsk_format"><i title="'+getFSKTitle(e['fsk'])+'" class="icn fsk-'+e['fsk']+'"></i></div>\r\n';
	html += '<div class="tags">\r\n';
	for (let tag of e['tgs']) html += '<i title="'+getTagTitle(tag)+'" class="icn tag-'+tag+'"></i>';
	html += '</div>\r\n';
	html += '</div>\r\n';

	html += '<div class="info">';
	html += '<div class="genres"><div class="cap">Genres:</div>\r\n';
	let f1 = false;
	for (let genre of e['gnr']) { if (f1) html+=' &#183; '; html += '<span>'+getGenreTitle(genre)+'</span>'; f1=true; }
	html += '</div>\r\n';
	if (e['grp'].length > 0)
	{
		html += '<div class="groups"><div class="cap">Groups:</div>\r\n';
		let f2 = false;
		for (let group of e['grp']) { if (f2) html+=' &#183; '; html += '<span>'+group+'</span>'; f2=true; }
		html += '</div>\r\n';
	}
	html += '</div>\r\n';

	html += '</div>\r\n';


	$("#maintable").append(html);
}