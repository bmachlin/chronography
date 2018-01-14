let musicData = {
	albums: [],
	artists: [],
	playlists: []
};

let labels = ['popularity', 'danceability', 'energy', 'key', 'loudness', 'speechiness', 'acousticness', 
				'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature', 'duration'];


let options = {
	axisX: { showGrid: false },
	divisor: 5
}
let options2 = {
	axisX: { showGrid: false,
			 showLabel: false },
	axisY: { position: 'end'},
	divisor: 5
}
let artistAlbums = [];
let albumsAverages = [];

function setupDataObjects() {
	_.each(labels, function(label) {
		musicData[label] = {};
		musicData[label]['series'] = [];
		musicData[label]['series'][0] = [];
		musicData[label]['series'][1] = [];
		musicData[label]['labels'] = [];
	});
}


function generateAverages(id, type, accessToken) {
    console.log('generateAverages: ' + id, type);

    if(type === 'album') {
    	processAlbum(id);
    }
    else if(type === 'artist') {
    	processArtist(id);
    }	
    else if(type === 'playlist') {
    	processPlaylist(id);
    }
}

function processArtist(id, offset=0) {
	console.log("processArtist");	
	setupDataObjects();

	fetchArtistAlbums(id, {limit: 50, "offset": offset, album_type: ['album']}, function(data) {
		if(!data) {
			// error
		} else {
			console.log(data);
			let title = data.items[0].artists[0].name;
			$('#result-name').html(title);

			_.each(data.items, function(alb) {
				artistAlbums[artistAlbums.length] = alb.id;
			});
			if(data.next != null) {
				processArtist(id, offset+50);
			} else {
				processArtistAlbums(artistAlbums);
			}
		}
	});
}

function processArtistAlbums(albumsIDs) {
	console.log("processArtistAlbums, length: " + albumsIDs.length);
}

function processAlbum(id, offset=0) {
	console.log("processAlbum");
	setupDataObjects();

	fetchAlbum(id, {}, function(data) {
		if(!data) {
			// error
		} else {
			let title = data.name + ' by ' + data.artists[0].name;
			console.log(data, title);
			$('#result-name').html(title);			

			fetchAlbumTracks(id, {limit: 50, offset: 0}, function(data) {
				if(!data) {
					//error
				} else {
					console.log(data);

					_.each(data.items, function(track) {
						let features = {
							id: track.id,
							name: track.name,
							track_number: track.track_number,
							duration: track.duration_ms / 60000
						}

						addTrackFeatures(features, 0);
					});
				}
			});
		}
	});
}

function addTrackFeatures(features, albumNum) {
	console.log("addtrackfeatures");
	fetchAudioFeatures(features.id, function(data) {
		if(!data) {
			//error
		} else {

			features['danceability'] = data.danceability;
			features['energy'] = data.energy;
			features['key'] = data.key;
			features['loudness'] = data.loudness;
			features['speechiness'] = data.speechiness;
			features['acousticness'] = data.acousticness;
			features['instrumentalness'] = data.instrumentalness;
			features['liveness'] = data.liveness;
			features['valence'] = data.valence;
			features['tempo'] = data.tempo;
			features['time_signature'] = data.time_signature;

			fetchTrack(features.id, {}, function(data) {
				if(!data) {
					//error
				} else {
					console.log(data);
					features['popularity'] = data.popularity;
					features['duration'] = data.duration_ms/60000;
				}
				processTrack(features, albumNum);
			});

			// console.log(features);
					
		}
	});
}

function processTrack(trackFeatures, albumNum) {
	let name = trackFeatures.name;
	let featIndex = name.indexOf("feat.");
	if(featIndex == -1)
		featIndex = name.indexOf("Feat.");
	if(featIndex != -1) {
		let prevChar = name.substring(featIndex-1, featIndex);
		if(prevChar != " ") {
			name = name.substring(0, featIndex-1);
		} else {
			name = name.substring(0, featIndex);
		}
	}


	musicData['danceability']['series'][albumNum][trackFeatures.track_number] = trackFeatures.danceability;
	musicData['danceability']['labels'][trackFeatures.track_number] = name;
	musicData['energy']['series'][albumNum][trackFeatures.track_number] = trackFeatures.energy;
	musicData['energy']['labels'][trackFeatures.track_number] = name;
	musicData['key']['series'][albumNum][trackFeatures.track_number] = trackFeatures.key;
	musicData['key']['labels'][trackFeatures.track_number] = name;
	musicData['loudness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.loudness;
	musicData['loudness']['labels'][trackFeatures.track_number] = name;
	musicData['duration']['series'][albumNum][trackFeatures.track_number] = trackFeatures.duration;
	musicData['duration']['labels'][trackFeatures.track_number] = name;
	musicData['speechiness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.speechiness;
	musicData['speechiness']['labels'][trackFeatures.track_number] = name;
	musicData['acousticness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.acousticness;
	musicData['acousticness']['labels'][trackFeatures.track_number] = name;
	musicData['instrumentalness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.instrumentalness;
	musicData['instrumentalness']['labels'][trackFeatures.track_number] = name;
	musicData['liveness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.liveness;
	musicData['liveness']['labels'][trackFeatures.track_number] = name;
	musicData['valence']['series'][albumNum][trackFeatures.track_number] = trackFeatures.valence;
	musicData['valence']['labels'][trackFeatures.track_number] = name;
	musicData['tempo']['series'][albumNum][trackFeatures.track_number] = trackFeatures.tempo;
	musicData['tempo']['labels'][trackFeatures.track_number] = name;
	musicData['time_signature']['series'][albumNum][trackFeatures.track_number] = trackFeatures.time_signature;
	musicData['time_signature']['labels'][trackFeatures.track_number] = name;
	musicData['popularity']['series'][albumNum][trackFeatures.track_number] = trackFeatures.popularity;
	musicData['popularity']['labels'][trackFeatures.track_number] = name;
	musicData['duration']['series'][albumNum][trackFeatures.track_number] = trackFeatures.duration;
	musicData['duration']['labels'][trackFeatures.track_number] = name;

	updateChart();
}


function getFeatureLow(feature) {
	
	if(feature === 'loudness')
		return -60;
	else
		return 0;
}

function getFeatureHigh(feature) {

	switch (feature) {
		case 'loudness':
			return 4;
		case 'key':
			return 11;
		case 'tempo':
			return 300;
		case 'time_signature':
			return 15;
		case 'popularity':
			return 100;
		case 'duration':
			return 10;
		default:
			return 1;
	}
}

function updateChart() {
	let selected = $("#feature-selector").val();
	let selected2 = $("#feature-selector-2").val();
	// console.log(selected, selected2);
	let snone = selected != "none"; // true if something was selected in box 1
	let snone2 = selected2 != "none"; // true if something was selected in box 2
	
	let chartSetter = {
		labels: [],
		series: []
	};

	let chartSetter2 = {
		labels: [],
		series: [[],[]]
	};

	if(snone) {
		$("#result-chart").show();
		options.low = getFeatureLow(selected);
		options.high = getFeatureHigh(selected);
		chartSetter['labels'] = musicData[selected]['labels'];
		chartSetter['series'][0] = musicData[selected]['series'][0];
		new Chartist.Line('#result-chart', chartSetter, options);
	} else {
		new Chartist.Line('#result-chart', null);
	}
	
	if(snone2) {
		$("#result-chart2").show();
		options2.low = getFeatureLow(selected2);
		options2.high = getFeatureHigh(selected2);
		chartSetter2['labels'] = musicData[selected]['labels'];
		chartSetter2['series'][1] = musicData[selected2]['series'][0];
		new Chartist.Line('#result-chart2', chartSetter2, options2);
	} else {
		$("#result-chart2").hide();
	}

}