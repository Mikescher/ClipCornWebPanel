const PAGESIZE = 128;
const LAZY_IMAGES = false;

let ALL_DATA = null;
let SER_DATA = {};

let FILTER   = null;
let PAGE     = 0;
let SHOW_UD  = false;
let SBROW    = '#sb_0';

let SEL_SER  = null;
let SEL_SEAS = null;

let UNIQID   = 10000000;

let FIRST = true;

let INPUT_EVENT = 999;

$(window).on('load', function()
{
	if (!SHOW_UD) $(".pshouldhide").addClass("anyhidden"); else $(".pshouldhide").removeClass("anyhidden");

	preload();

	$.ajax({
		//url: "/ajax/list_elements.php?limit=100&fmt=1",
		url: "/ajax/list_elements.php",
		success: function(data)
		{
			$("#pagefooter").removeClass('preloadfooter');

			let json = JSON.parse(data);

			let groups = [];
			let genres = [];
			let langs  = [];

			for (let e of json)
			{
				for (let vvv of e['grp']) if (!groups.includes(vvv)) groups.push(vvv);
				for (let vvv of e['gnr']) if (!genres.includes(vvv)) genres.push(vvv);
				for (let vvv of e['lng']) if (!langs.includes(vvv))  langs.push(vvv);
			}

			ALL_DATA = json;
			FILTER = null;
			PAGE = 0;
			SEL_SER  = null;
			SEL_SEAS = null;
			refresh();

			$('#rippleloader').remove();
			$("#footer").css('display', 'block');

			setSidebarValues(false, groups, true, $('#sc_1'), null, null, function (e, v) { return e['grp'].includes(v); });
			setSidebarValues(false, genres, true, $('#sc_2'), null, getGenreTitle, function (e, v) { return e['gnr'].includes(v); });
			setSidebarValues(false, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], false, $('#sc_3'), 'onlinescore-', null, function (e, v) { return e['oscr'] === v; });
			setSidebarValues(false, [6, 0, 1, 2, 7, 3, 4, 5], false, $('#sc_4'), 'score-', getScoreTitle, function (e, v) { return e['scr'] === v; });
			setSidebarValues(false, [0, 1, 2, 3, 4], false, $('#sc_5'), 'fsk-', getFSKTitle, function (e, v) { return e['fsk'] === v; });
			setSidebarValues(false, [0, 1, 2, 3, 4, 5, 6, 7, 8], false, $('#sc_6'), 'format-', getFormatTitle, function (e, v) { return !e['ser'] && e['fmt'] === v; });
			//setSidebarValues(false, [0, 1, 2, 3, 4], false, $('#sc_7'), 'quality-', getQualityTitle, function (e, v) { return !e['ser'] && e['qal'] === v; });
			setSidebarValues(false, [0, 1, 2, 3, 4, 5, 6, 7, 8], false, $('#sc_8'), 'tag-', getTagTitle, function (e, v) { return e['tgs'].includes(v); });
			setSidebarValues(true,  langs, false, $('#sc_9'), 'lang-', getLangTitle, function (e, v) { return !e['ser'] && e['lng'].includes(v); });
			setSidebarValues(false, [0, 1], false, $('#sc_A'), 'typ-', function (i) {return (i===0)?'Movie':'Series'}, function (e, v) { return e['ser'] === (v===1); });
			setSidebarValues(false, [0, 4, 1], false, $('#sc_B'), 'view-', function (i) {return ["Not viewed","Viewed","Partially viewed"][i];}, function (e, v) { return (!e['ser'] && e['vwd'] && v===1) || (!e['ser'] && !e['vwd'] && v===0) ||(e['ser'] && e['svwd']===v); });

			let compFilter = $('.filter');

			compFilter.val('');

			compFilter.on('input', function()
			{
				let eid = ++INPUT_EVENT;
				let v = $(this).val();

				setTimeout(function ()
				{
					if (INPUT_EVENT !== eid) return;
					FILTER = function(e) { return econtains(e, v); };
					PAGE=0;
					SBROW=null;
					refresh();
					collapseSidebar(-1)
				}, 500);

			});

			return data;
		}
	});

	$.ajax({
		url: "/ajax/get_info.php",
		success: function(data)
		{
			let json = JSON.parse(data);

			$("#pagefooter").css('display', "block");

			$("#InfoVersion").text(json['VERSION_DB']);
			$("#InfoTimestamp").text(json['CREATION_DATE'] + ' ' + json['CREATION_TIME']);
			$("#InfoUUID").text(json['DATABASE_UNIVERSALLY_UNIQUE_IDENTIFIER']);
			$("#InfoSize").text(formatSize(json['FILESIZE'])).attr("title", json['FILESIZE'] + " bytes");
			$("#InfoCommit").text(json['COMMIT']);

			return data;
		}
	});

	$("#AnchorSho").click(function() {
		SHOW_UD = true;
		refresh();
		return false;
	});

	$("#prevpage").click(function () {
		PAGE = PAGE-1;
		SEL_SER  = null;
		SEL_SEAS = null;
		refresh();
		return true;
	});

	$("#nextpage").click(function () {
		PAGE = PAGE+1;
		SEL_SER  = null;
		SEL_SEAS = null;
		refresh();
		return true;
	});

	$("#sb_0").click(function () { collapseSidebar(0x0); FILTER = function(e){ return true; }; SBROW='#sb_0'; PAGE=0; refresh(); $('.filter').val(''); return true; });
	$("#sb_1").click(function () { collapseSidebar(0x1); return false; });
	$("#sb_2").click(function () { collapseSidebar(0x2); return false; });
	$("#sb_3").click(function () { collapseSidebar(0x3); return false; });
	$("#sb_4").click(function () { collapseSidebar(0x4); return false; });
	$("#sb_5").click(function () { collapseSidebar(0x5); return false; });
	$("#sb_6").click(function () { collapseSidebar(0x6); return false; });
	$("#sb_7").click(function () { collapseSidebar(0x7); return false; });
	$("#sb_8").click(function () { collapseSidebar(0x8); return false; });
	$("#sb_9").click(function () { collapseSidebar(0x9); return false; });
	$("#sb_A").click(function () { collapseSidebar(0xA); return false; });
	$("#sb_B").click(function () { collapseSidebar(0xB); return false; });

	collapseSidebar(0);
});

function refresh()
{
	$("#maintable").empty();

	if (!SHOW_UD) $(".pshouldhide").addClass("anyhidden"); else $(".pshouldhide").removeClass("anyhidden");

	if (ALL_DATA === null) return;

	let skip=0;
	let take=0;
	let isnext = false;
	for (let e of ALL_DATA)
	{
		if (take >= PAGESIZE) { isnext=true; break; }

		if (FILTER !== null && !FILTER(e)) continue;

		if (skip < PAGE*PAGESIZE) { skip++; continue; }

		if (e['ser']) addSeriesEntry(e);
		else          addMovieEntry(e);

		take++;
	}

	$("#prevpage").css('visibility', (PAGE>0) ? 'visible' : 'hidden');
	$("#nextpage").css('visibility', (isnext) ? 'visible' : 'hidden');

	$(".sidebar-level-1").removeClass('selected');
	$(".sidebar-level-2").removeClass('selected');

	if (SBROW !== null) $(SBROW).addClass('selected');

	if (LAZY_IMAGES)
	{
		$('.lazy').lazy();
	}
	else if (FIRST)
	{
		FIRST = false;
		setTimeout(function() { $('.delay').each(function (idx, img) { $(img).attr("src", $(img).data('src')); }); }, 1000);
	}
}

function collapseSidebar(v)
{
	let arr = [ $("#sc_0"),$("#sc_1"),$("#sc_2"),$("#sc_3"),$("#sc_4"),$("#sc_5"),$("#sc_6"),null,$("#sc_8"),$("#sc_9"),$("#sc_A"),$("#sc_B") ];

	for(let i=0; i<12; i++)
	{
		if (arr[i] === null) continue;
		
		if (v !== i || arr[i].css('visibility')==='visible')
		{
			arr[i].css('visibility', 'collapse').css('display', 'none');
		}
		else
		{
			arr[i].css('visibility', 'visible').css('display', 'flex');
		}
	}
}

function setSidebarValues(presorted, values, sorted, target, icon, txtconvert, filter)
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
			values2.push( { html: icn + txt, originalvalue: val, textval: txt } );
		}
		values = values2;
	}
	else if (icon !== null)
	{
		let values2 = [];
		for(let val of values)
		{
			values2.push( { html: '<i class="icn ' + icon + val + '" title="'+val+'"></i>', originalvalue: val, textval: val  } );
		}
		values = values2;
	}
	else
	{
		let values2 = [];
		for(let val of values)
		{
			values2.push( { html: val, originalvalue: val, textval: val } );
		}
		values = values2;
	}

	if (sorted) values.sort(function (a, b) { return a.textval.localeCompare(b.textval); });

	let html = '';

	let ff = [];

	for(let val of values)
	{
		let id = '___' + (UNIQID++) + '___';
		html += '<a href="#" class="sidebar-level-2" id="'+id+'">'+val.html+'</a>';
		if (filter !== null) ff.push({xid: "#"+id, fn: function ()
		{
			$('.filter').val('');
			FILTER =function(e){ return filter(e, val.originalvalue); };
			SBROW='#'+id;
			PAGE=0;
			SEL_SER  = null;
			SEL_SEAS = null;
			refresh();
		}});
	}

	target.append(html);

	for(let f of ff) $(f.xid).click(f.fn);
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
	return ['Crappy Movie', 'Bad Movie', 'Not recommended', 'Good enough', 'Recommended', 'Masterpiece', '<i>Unset</i>', 'Average'][scr];
}

function getLangTitle(lng)
{
	if (lng===-1) return 'None';
	return ['German', 'English', 'Muted', 'French', 'Japanese', 'Italian', 'Spanish', 'Portuguese', 'Danish', 'Finnish', 'Swedisch', 'Norwegian', 'Dutch', 'Czech', 'Polish', 'Turkish', 'Hungarian', 'Bulgarian', 'Russian', 'Chinese', 'Korean'][lng];
}

//function getQualityTitle(qal)
//{
//	return ['Stream', 'CD', 'CD\'s', 'DVD', 'BluRay'][qal];
//}

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

function econtains(e, v)
{
	if (v === '') return true;
	if (e['name'].toLowerCase().includes(v.toLowerCase())) return true;
	if (e['zykl'].toLowerCase().includes(v.toLowerCase())) return true;
	for (let g of e['grp']) if (g.toLowerCase().includes(v.toLowerCase())) return true;
	for (let g of e['tgs']) if (getTagTitle(g).toLowerCase().includes(v.toLowerCase())) return true;
	for (let g of e['gnr']) if (getGenreTitle(g).toLowerCase().includes(v.toLowerCase())) return true;
	return false;
}

function addMovieEntry(e)
{
	let html = '';

	html += '<div class="entry">';
	html += '<div class="coverbox">';
	if (LAZY_IMAGES) html += '<img class="lazy cover"  data-src="/ajax/get_cover.php?cid='+e['cid']+'">';
	else if (FIRST)  html += '<img class="delay cover" data-src="/ajax/get_cover.php?cid='+e['cid']+'">';
	else             html += '<img class="cover"            src="/ajax/get_cover.php?cid='+e['cid']+'">';
	if (SHOW_UD)
	{
		if (e['vwd'])
		{
			html += '<i class="viewed icn viewed-1" title="';
			for (let h of e['his']) html += h + "\n";
			html += '"></i>';
		}
	}
	html += '</div>';

	if (SHOW_UD)
	{
		if (e['scr'] !== 6) html += '<i title="'+getScoreTitle(e['scr'])+'" class="score icn score-'+e['scr']+'"></i>';
	}

	html += '<div class="text">';
	if (e['zykl'] !== '')
	{
		let clck = 'FILTER = function(e){ return econtains(e, \'' + e['zykl'].replace(/'/g, "&#39;") + '\'); }; PAGE=0; refresh(); return false;';
		html += '<span class="zyklus" onclick="'+clck+'">' + e['zykl'] + fmtZyklusNum(e['znum']) + '</span>';
		html += '<span class="delim"> - </span>';
	}
	html += '<span class="title">' + e['name'] + '</span>';
	html += '</div>';

	html += '<div class="icons">';
	html += '<div class="language">';
	for (let lng of e['lng']) html += '<i class="icn lang-'+ lng +'" title="' + getLangTitle(lng) + '" ></i>';
	if (e['lng'].length === 0)  html += '<i class="icn lang-none" title="' + getLangTitle(-1) + '" ></i>';
	html += '</div>';
	html += '<div class="onlinescore" title="' + (e['oscr'] / 2) + ' / 10" ><i class="icn onlinescore-'+ e['oscr'] + '"></i></div>';
	html += '<div class="quality_fsk_format"><i title="'+getFSKTitle(e['fsk'])+'" class="icn fsk-'+e['fsk']+'"></i><i title="'+getFormatTitle(e['fmt'])+'" class="icn format-'+e['fmt']+'"></i></div>';
	html += '<div class="tags">';
	for (let tag of e['tgs']) html += '<i title="'+getTagTitle(tag)+'" class="icn tag-'+tag+'"></i>';
	html += '</div>';
	html += '</div>';

	html += '<div class="info">';

	//html += '<div class="genres"><div class="cap">Genres:</div>';
	//let f1 = false;
	//for (let genre of e['gnr']) { if (f1) html+='&#183;'; html += '<span>'+getGenreTitle(genre)+'</span>'; f1=true; }
	//html += '</div>';
	html += '<div class="genres" title="';
	let f1 = false;
	for (let genre of e['gnr']) { if (f1) html+='\n'; html += getGenreTitle(genre); f1=true; }
	html += '"><div class="cap">Genres:</div>' + e['gnr'].length;
	html += '</div>';

	if (e['grp'].length > 0)
	{
		html += '<div class="groups" title="';
		let f2 = false;
		for (let group of e['grp']) { if (f2) html+='\n'; html += group; f2=true; }
		html += '"><div class="cap">Groups:</div>' + e['grp'].length;
		html += '</div>';
	}
	html += '<div class="length" title="'+formatLength(e['len'])+'"><div class="cap">Length:</div>'+e['len']+' min.</div>';
	html += '<div class="size"><div class="cap">Size:</div>'+formatSize(e['siz'])+'</div>';
	html += '<div class="adddate"><div class="cap">Added:</div>'+e['add']+'</div>';
	html += '<div class="year"><div class="cap">Year:</div>'+e['year']+'</div>';
	html += '</div>';

	html += '</div>';


	$("#maintable").append(html);
}

function addSeriesEntry(e)
{
	let id = '___ser_entry_' + e['sid'] + '___';

	let html = '';

	html += '<div class="entry seriesentry" id="'+id+'">';
	html += '<div class="coverbox">';
	html += '<img class="coveroverlay" src="/data/mask_series.png" alt="Overlay">';
	if (LAZY_IMAGES) html += '<img class="lazy cover"  data-src="/ajax/get_cover.php?cid='+e['cid']+'">';
	else if (FIRST)  html += '<img class="delay cover" data-src="/ajax/get_cover.php?cid='+e['cid']+'">';
	else             html += '<img class="cover"            src="/ajax/get_cover.php?cid='+e['cid']+'">';
	if (SHOW_UD)
	{
		if (e['svwd']===1) html += '<i class="viewed icn viewed-1"></i>';
		if (e['svwd']===4) html += '<i class="viewed icn viewed-4"></i>';
	}
	html += '</div>';

	if (SHOW_UD)
	{
		if (e['scr'] !== 6) html += '<i title="' + getScoreTitle(e['scr']) + '" class="score icn score-' + e['scr'] + '"></i>';
	}

	html += '<div class="text">';
	html += '<span class="title">' + e['name'] + '</span>';
	html += '</div>';

	html += '<div class="icons">';
	html += '<div class="language">';
	for (let lng of e['slng']) html += '<i class="icn lang-'+ lng +'" title="' + getLangTitle(lng) + '" ></i>';
	if (e['slng'].length === 0)  html += '<i class="icn lang-none" title="' + getLangTitle(-1) + '" ></i>';
	html += '</div>';
	html += '<div class="onlinescore" title="' + (e['oscr'] / 2) + ' / 10" ><i class="icn onlinescore-'+ e['oscr'] + '"></i></div>';
	html += '<div class="quality_fsk_format"><i title="'+getFSKTitle(e['fsk'])+'" class="icn fsk-'+e['fsk']+'"></i></div>';
	html += '<div class="tags">';
	for (let tag of e['tgs']) html += '<i title="'+getTagTitle(tag)+'" class="icn tag-'+tag+'"></i>';
	html += '</div>';
	html += '</div>';

	html += '<div class="info">';

	//html += '<div class="genres"><div class="cap">Genres:</div>';
	//let f1 = false;
	//for (let genre of e['gnr']) { if (f1) html+='&#183;'; html += '<span>'+getGenreTitle(genre)+'</span>'; f1=true; }
	//html += '</div>';
	html += '<div class="genres" title="';
	let f1 = false;
	for (let genre of e['gnr']) { if (f1) html+='\n'; html += getGenreTitle(genre); f1=true; }
	html += '"><div class="cap">Genres:</div>' + e['gnr'].length;
	html += '</div>';

	if (e['grp'].length > 0)
	{
		html += '<div class="groups" title="';
		let f2 = false;
		for (let group of e['grp']) { if (f2) html+='\n'; html += group; f2=true; }
		html += '"><div class="cap">Groups:</div>' + e['grp'].length;
		html += '</div>';
	}
	html += '<div class="length" title="'+formatLength(e['slen'])+'"><div class="cap">Length:</div>'+e['slen']+' min.</div>';
	html += '<div class="size"><div class="cap">Size:</div>'+formatSize(e['ssiz'])+'</div>';
	html += '<div class="adddate"><div class="cap">Added:</div>'+e['sadd']+'</div>';
	html += '<div class="episodecount"><div class="cap">Episodes:</div>'+e['sepc']+'</div>';
	html += '<div class="year"><div class="cap">Year:</div>'+e['syer']+'</div>';
	html += '</div>';

	html += '</div>';

	html += '<div class="seriesdata" id="seriesdata__'+e['sid']+'">';
	html += '<div id="seriesrippleloader__'+e['sid']+'" class="ripple lds-ripple2"><div></div><div></div><div></div></div>';
	html += '<div class="seriesinnerdata" id="seriesinnerdata__'+e['sid']+'"></div>';
	html += '</div>';

	$("#maintable").append(html);

	$('#'+id).click(function ()
	{
		let me = $('#'+id);

		if (me.hasClass('seriesentry_open')) { unshowSeries(); return; }

		SEL_SER  = e['sid'];
		SEL_SEAS = null;

		$('#seriesinnerdata__' + e['sid']).html('');

		$('#seriesrippleloader__' + e['sid']).removeClass("anyhidden");

		$('.seriesentry').removeClass("seriesentry_open");
		me.addClass("seriesentry_open");

		$('.seriesdata').removeClass("seriesdata_open");
		$('#seriesdata__'+e['sid']).addClass("seriesdata_open");

		$('#___ser_entry_' + e['sid'] + '___')[0].scrollIntoView(true);

		if (e['sid'] in SER_DATA) {

			showSeries(e['sid'], SER_DATA[e['sid']], null);

		} else {

			$.ajax({
				url: "/ajax/list_series.php?sid="+e['sid'],
				success: function(data)
				{
					let json = JSON.parse(data);
					SER_DATA[e['sid']] = json;

					if (SEL_SER === e['sid'] && SEL_SEAS === null) showSeries(e['sid'], json, null);
				}
			});
		}

		return false;
	});
}

function unshowSeries() {
	SEL_SER  = null;
	SEL_SEAS = null;

	$('.seriesentry').removeClass("seriesentry_open");
	$('.seriesdata').removeClass("seriesdata_open");
}

function showSeries(seriesid, seriesdata, seasonidx) {

	let uniid = '___' + (UNIQID++);

	if (seriesdata['s'].length === 0) { unshowSeries(); return; }

	let season = seriesdata['s'][0];
	if (seasonidx !== null) {
		for(let seas of seriesdata['s']) {
			if (seas['id'] === seasonidx) { season = seas; break; }
		}
	}
	seasonidx = season['id'];

	let html = '';

	html += '<div class="coverbox">';
	html += '<img class="cover" src="/ajax/get_cover.php?cid='+season['cid']+'">';
	html += '</div>';

	html += '<span class="sheader">';
	html += '<span class="stitle">' + season['name'] + '</span>';
	html += '<span class="syear">' + season['year'] + '</span>';
	html += '</span>';

	html += '<div class="seasonbox seabox_' + Math.ceil(seriesdata['s'].length / 4) +' ' + ((seriesdata['s'].length===1) ? 'anyhidden' : '') + '">';
	for (let i = 0; i < seriesdata['s'].length; i++) {
		html += '<div class="seasonbtn'+(  (seriesdata['s'][i]['id'] === seasonidx) ? ' sbtn_active' : ''  )+'" id="'+uniid+'__'+seriesid+'__'+seriesdata['s'][i]['id']+'">'+(i+1)+'</div>';
	}
	html += '</div>';


	html += '<div class="seasontableowner">';
	html += '<table class="seasontable">';
	html += '<thead>';
	html += '<tr>';
	html += '<th class="th_epis" >E</th>';
	html += '<th class="th_name" >Title</th>';
	html += '<th class="th_vwd '+ (SHOW_UD ? '' : 'anyhidden') +'" ><!--Viewed--></th>';
	html += '<th class="th_leng" >Len</th>';
	html += '<th class="th_tags" >Tags</th>';
	html += '<th class="th_dadd" >Added</th>';
	html += '<th class="th_meta" >Meta</th>';
	html += '<th class="th_size" >Size</th>';
	html += '</tr>';
	html += '</thead>';
	html += '<tbody>';
	for (let i = 0; i < season['e'].length; i++)
	{
		let episode = season['e'][i];
		html += '<tr>';

		html += '<td class="td_epis">' + episode['epis'] + '</td>';

		html += '<td class="td_name">' + episode['name'] + '</td>';

		html += '<td class="td_vwd '+ (SHOW_UD ? '' : 'anyhidden') +'">';
		html += '<div class="td_inner">';
		html += '<i class="viewed icn viewed-'+(episode['vwd']?1:0)+'" title="';
		for (let h of episode['his']) html += h + "\n";
		html += '"></i>';
		html += '</div>';
		html += '</td>';

		html += '<td class="td_leng" title="'+formatLength(episode['len'])+'">' + episode['len'] + ' min.</td>';

		html += '<td class="td_tags">';
		html += '<div class="td_inner">';
		for (let tag of episode['tgs']) html += '<i title="'+getTagTitle(tag)+'" class="icn tag-'+tag+'"></i>';
		html += '</div>';
		html += '</td>';

		html += '<td class="td_dadd">' + episode['add'] + '</td>';

		html += '<td class="td_meta">';
		html += '<div class="td_inner">';
		html += '<i class="icn format-'+episode['fmt']+'" title="'+getFormatTitle(episode['fmt'])+'"></i>';
		for (let lng of episode['lng']) html += '<i class="icn lang-'+ lng +'" title="' + getLangTitle(lng) + '" ></i>';
		if (episode['lng'].length === 0) html += '<i class="icn lang-none" title="' + getLangTitle(-1) + '" ></i>';
		html += '</div>';
		html += '</td>';

		html += '<td class="td_size">' + formatSize(episode['siz']) + '</td>';
		html += '</tr>';
	}
	html += '</tbody>';
	html += '</table>';
	html += '</div>';

	$('#seriesrippleloader__' + seriesid).addClass("anyhidden");
	$('#seriesinnerdata__' + seriesid).html(html);


	for (let i = 0; i < seriesdata['s'].length; i++)
	{
		$('#' + uniid+'__'+seriesid+'__'+seriesdata['s'][i]['id']).click(function()
		{
			SEL_SEAS = seriesdata['s'][i]['id'];
			showSeries(seriesid, seriesdata, seriesdata['s'][i]['id']);
		});
	}
}

function preload()
{
	imgpreload('/data/icons/language/language_00_16x16.png');
	imgpreload('/data/icons/language/language_01_16x16.png');
	imgpreload('/data/icons/language/language_02_16x16.png');
	imgpreload('/data/icons/language/language_03_16x16.png');
	imgpreload('/data/icons/language/language_04_16x16.png');
	imgpreload('/data/icons/language/language_05_16x16.png');
	imgpreload('/data/icons/language/language_06_16x16.png');
	imgpreload('/data/icons/language/language_07_16x16.png');
	imgpreload('/data/icons/language/language_08_16x16.png');
	imgpreload('/data/icons/language/language_09_16x16.png');
	imgpreload('/data/icons/language/language_10_16x16.png');
	imgpreload('/data/icons/language/language_11_16x16.png');
	imgpreload('/data/icons/language/language_12_16x16.png');
	imgpreload('/data/icons/language/language_13_16x16.png');
	imgpreload('/data/icons/language/language_14_16x16.png');
	imgpreload('/data/icons/language/language_15_16x16.png');
	imgpreload('/data/icons/language/language_16_16x16.png');
	imgpreload('/data/icons/language/language_17_16x16.png');
	imgpreload('/data/icons/language/language_18_16x16.png');
	imgpreload('/data/icons/language/language_19_16x16.png');
	imgpreload('/data/icons/language/language_20_16x16.png');
	imgpreload('/data/icons/language/language_none_16x16.png');
	imgpreload('/data/icons/stars/stars_0_16x16.png');
	imgpreload('/data/icons/stars/stars_1_16x16.png');
	imgpreload('/data/icons/stars/stars_2_16x16.png');
	imgpreload('/data/icons/stars/stars_3_16x16.png');
	imgpreload('/data/icons/stars/stars_4_16x16.png');
	imgpreload('/data/icons/stars/stars_5_16x16.png');
	imgpreload('/data/icons/stars/stars_6_16x16.png');
	imgpreload('/data/icons/stars/stars_7_16x16.png');
	imgpreload('/data/icons/stars/stars_8_16x16.png');
	imgpreload('/data/icons/stars/stars_9_16x16.png');
	imgpreload('/data/icons/stars/stars_10_16x16.png');
	//imgpreload('/data/icons/quality/quality_0_16x16.png');
	//imgpreload('/data/icons/quality/quality_1_16x16.png');
	//imgpreload('/data/icons/quality/quality_2_16x16.png');
	//imgpreload('/data/icons/quality/quality_3_16x16.png');
	//imgpreload('/data/icons/quality/quality_4_16x16.png');
	imgpreload('/data/icons/fsk/fsk_0_16x16.png');
	imgpreload('/data/icons/fsk/fsk_1_16x16.png');
	imgpreload('/data/icons/fsk/fsk_2_16x16.png');
	imgpreload('/data/icons/fsk/fsk_3_16x16.png');
	imgpreload('/data/icons/fsk/fsk_4_16x16.png');
	imgpreload('/data/icons/format/ext0_16x16.png');
	imgpreload('/data/icons/format/ext1_16x16.png');
	imgpreload('/data/icons/format/ext2_16x16.png');
	imgpreload('/data/icons/format/ext3_16x16.png');
	imgpreload('/data/icons/format/ext4_16x16.png');
	imgpreload('/data/icons/format/ext5_16x16.png');
	imgpreload('/data/icons/format/ext6_16x16.png');
	imgpreload('/data/icons/format/ext7_16x16.png');
	imgpreload('/data/icons/format/ext8_16x16.png');
	imgpreload('/data/icons/format/ext8_16x16.png');
	imgpreload('/data/icons/tags/tag_0_on_16x16.png');
	imgpreload('/data/icons/tags/tag_1_on_16x16.png');
	imgpreload('/data/icons/tags/tag_2_on_16x16.png');
	imgpreload('/data/icons/tags/tag_3_on_16x16.png');
	imgpreload('/data/icons/tags/tag_4_on_16x16.png');
	imgpreload('/data/icons/tags/tag_5_on_16x16.png');
	imgpreload('/data/icons/tags/tag_6_on_16x16.png');
	imgpreload('/data/icons/tags/tag_7_on_16x16.png');
	imgpreload('/data/icons/tags/tag_8_on_16x16.png');
	imgpreload('/data/icons/viewed/viewed_1.png');
	imgpreload('/data/icons/viewed/viewed_4.png');
	imgpreload('/data/icons/viewed/sb_0_16x16.png');
	imgpreload('/data/icons/viewed/sb_1_16x16.png');
	imgpreload('/data/icons/viewed/sb_1_16x16.png');
	imgpreload('/data/icons/score/score_0_16x16.png');
	imgpreload('/data/icons/score/score_1_16x16.png');
	imgpreload('/data/icons/score/score_2_16x16.png');
	imgpreload('/data/icons/score/score_3_16x16.png');
	imgpreload('/data/icons/score/score_4_16x16.png');
	imgpreload('/data/icons/score/score_5_16x16.png');
	imgpreload('/data/icons/type/t0_16x16.png');
	imgpreload('/data/icons/type/t1_16x16.png');
	imgpreload('/data/mask_series.png');
}

function imgpreload(url)
{
	let img=new Image();
	img.src=url;
}
