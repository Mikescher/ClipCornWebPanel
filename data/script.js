$(window).on('load', function()
{
	$.ajax({
		//url: "/ajax/list_elements.php?limit=100&fmt=1",
		url: "/ajax/list_elements.php",
		success: function(data)
		{
			let json = JSON.parse(data);

			for (let e of json)
			{
				if (e['ser']) addSeriesEntry(e);
				else          addMovieEntry(e);
			}

			return data;
		}
	});
});

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

function getScoreTitle(scr) {
	return ['Crappy Movie', 'Bad Movie', 'Not recommended', 'Good enough', 'Recommended', 'Masterpiece', ''][scr];
}

function getLangTitle(lng) {
	if (lng===-1) return 'None';
	return ['German', 'English', 'Muted', 'French', 'Japanese', 'Italian', 'Spanish', 'Portuguese', 'Danish', 'Finnish', 'Swedisch', 'Norwegian', 'Dutch', 'Czech', 'Polish', 'Turkish', 'Hungarian', 'Bulgarian', 'Russian', 'Chinese'][lng];
}

function getQualityTitle(qal) {
	return ['Stream', 'CD', 'CD\'s', 'DVD', 'BluRay'][qal];
}

function getFSKTitle(fsk) {
	return ['FSK-0', 'FSK-6', 'FSK-12', 'FSK-16', 'FSK-18'][fsk];
}

function getFormatTitle(fmt) {
	return ['MKV', 'AVI', 'MPEG', 'IMG', 'IFO', 'WMV', 'MP4', 'DIVX', 'FLV'][fmt];
}

function getTagTitle(tag) {
	return ['Low Quality', 'Missing Time', 'Broken File', 'Watch later', 'Wrong Language', 'Watch never', 'CamRip', 'MicDubbed', 'Cancelled'][tag];
}

function getGenreTitle(tag) {
	return ['NO_GENRE', 'Disaster Movie', 'Road Movie', 'Western', 'Italo-Western', 'Sentimental film', 'Thriller', 'Actionthriller', 'Psychothriller', 'Science Fiction', 'Comedy', 'Slapstick-Comedy', 'Screwball-Comedy', 'Gangstermovie', 'Crime Story', 'War Movie', 'Porno', 'Softporno', 'Hardcore-Porno', 'Actionmovie', 'Animation', 'Cartoon', 'Anime', 'Stop-Motion-Movie', 'Puppet Movie', 'Claymation', 'Computer Animation Mo', 'Martial-Arts-Movie', 'Samuraimovie', 'Horror Movie', 'Slasher', 'Teenhorror', 'Creature', 'ComingOfAge', 'Documentary', 'Adventure', 'Romance', 'Mystery', 'Fantasy', 'Family', 'Drama', 'Anti-War Movie', 'Biographie', 'Sport', 'Music', 'Musical', 'History', 'Film Noir', 'kids movie', 'Soap opera', 'Slice of Life', 'Shounen', 'Shoujo', 'School', 'Mecha', 'Parody', 'Isekai'][tag];
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

}