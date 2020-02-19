// let labels = ['popularity', 'duration', 'danceability', 'energy', 'key', 'loudness', 'speechiness', 'acousticness', 
// 				'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature'];
let labels = ['popularity', 'danceability', 'energy', 'speechiness', 'acousticness', 
				'instrumentalness', 'liveness', 'valence'];

let musicData = {};
let processedIds = [];
let chart;

// function setupDataObjects() {
// 	googleLoad.then((data) => {
// 		chartData = new google.visualization.DataTable();
// 		chartData.addColumn('string', 'name');
// 		labels.forEach((label) => chartData.addColumn('number', label));
// 	});
// }

function generateAverages(id, type) {
    console.log('generateAverages: ' + type, id);

	switch (type) {
		case 'album':
			processAlbum(id, true, createChart);
			break;
		case 'artist':
			processArtist(id);
			break;
		case 'playlist':
			processPlaylist(id);
			break;
	}
}

// get all artist albums, get all average track data for each album
function processArtist(id, offset=0) {
	console.log("processArtist", id);
	// setupDataObjects();

	getArtistAlbums(id, {limit: 50, "offset": offset, include_groups: ['album']}, true, function(data) {
		if(data) {
			console.log(data);
			$bt.get('#result-name').innerHTML = data.items[0].artists[0].name;
			let numAlbums = artistAlbums.length;
			artistAlbums.forEach((albumId) => {
				processAlbum(albumId, false, () => {
					//done...?
					numAlbums--;
					if(numAlbums == 0) {
						createChart();
					}
				});
			});
		}
	});
}

function processAlbum(id, isSelection, callback) {
	if(isSelection) {
		console.log("processAlbum", id);
		// setupDataObjects();
	}

	getAlbum(id, {}, function(data) {
		if(data) {
			console.log(data);
			if(isSelection)
				$bt.get('#result-name').innerHTML = data.name + "<br>" + data.artists[0].name;			

			getAlbumTracks(id, {}, true, function(data) {
				if(data) {
					musicData[id] = [];
					data.items.forEach((track) => musicData[id].push({id: track.id}));
					if(isSelection) {
						addFeatures(createChart);
					} else
						addFeatures(callback);
				}
			});
		}
	});
}

function removeFeat(trackName) {
	let featIndex = trackName.toLowerCase().indexOf(" feat.");
	if(featIndex != -1) {
		return trackName.substring(0, featIndex);
	}
	return trackName;
}

function processPlaylist(id) {
	console.log("processPlaylist", id);
	// setupDataObjects();

	getPlaylist(id, {}, (data) => {
		$bt.get('#result-name').innerHTML = data.name + "<br>" + data.owner.display_name;
	});

	getPlaylistTracks(id, {}, true, (data) => {
		console.log(data);
		musicData[id] = [];
		data.items.forEach((playlistTrack) => musicData[id].push({id: playlistTrack.track.id}));
		addFeatures(createChart);
	});
}

function addFeatures(callback) {
	let numAlbums = Object.keys(musicData).length;
	Object.keys(musicData).forEach((albumId) => {
		numAlbums--;
		console.log(numAlbums);
		if(albumId in processedIds)
			return;
		else
			processedIds.push(albumId);

		let numTracks = musicData[albumId].length;
		musicData[albumId].forEach((track) => {
			console.log(numTracks);
			getTrack(track.id, {}, (data) => {
				track.name = removeFeat(data.name);
				track.duration = data.duration_ms / 60000;
				track.popularity = data.popularity / 100;
				track.track_number = data.track_number;

				getAudioFeatures(track.id, (data) => {
					numTracks--;
					if(data) {
						console.log("addfeatures", data)
						track.danceability = data.danceability;
						track.energy = data.energy;
						track.key = data.key;
						track.loudness = data.loudness;
						track.speechiness = data.speechiness;
						track.acousticness = data.acousticness;
						track.instrumentalness = data.instrumentalness;
						track.liveness = data.liveness;
						track.valence = data.valence;
						track.tempo = data.tempo;
						track.time_signature = data.time_signature;
					}
					if(numAlbums + numTracks === 0) {
						callback();
					}
				});
				
			});
		});
	});
}

function createChart() {
	if(processedIds.length > 1) {
		Object.keys(musicData).forEach((id) => {
			//
		});
	} else {
		let data = musicData[processedIds[0]];
		data.forEach((track) => {
			let row = [track.name];
			labels.forEach((label) => row.push(track[label]));
			chartData.addRow(row);
		});
	}
	drawChart();
}

function drawChart() {
	console.log("drawChart");

	let ticks = $bt.map(chartData.getSortedRows(), (index) => chartData.getValue(index, 0));

	if(!chart) {
		chart = new google.visualization.LineChart($bt.get("#result-chart"));
	}
	let options = {
		width: 0.9 * Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
		height: 0.6 * Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		backgroundColor: '#222222',
		chartArea: {
			backgroundColor: '#222222'
		},
		colors: ['#DD5285', '#CE9930', '#39AA27', '#2A4A89', '#A5266E', '#714E09', 
				'#135D07', '#5E7AB0', '#5A0736', '#FFD37C', '#77D668', '#0D224B', '#D065A2'],
		focusTarget: 'category',
		hAxis: {
			textStyle: {
				color: 'white'
			},
			ticks
		},
		vAxis: {
			textStyle: {
				color: 'white'
			}
		},
		legend: {
			textStyle: {
				color: 'white'
			}
		}
	}
	chart.draw(chartData, options);
}