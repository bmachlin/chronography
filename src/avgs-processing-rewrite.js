var chartData = {};
var labels = ['danceability', 'energy', 'key', 'loudness', 'speechiness', 'acousticness', 
				'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature'];
var options = {
	axisX: { showGrid: false },
	divisor: 5
}
var options2 = {
	axisX: { showGrid: false,
			 showLabel: false },
	axisY: { position: 'end'},
	divisor: 5
}

function setupDataObjects(obj) {
	_.each(labels, function(label) {
		chartData[label] = {};
		chartData[label]['series'] = [];
		chartData[label]['series'][0] = [];
		chartData[label]['series'][1] = [];
		chartData[label]['labels'] = [];
	});
}


function generateAverages(id, type, accessToken) {
    console.log('generateAverages: ' + id, type);
    setAccessToken(accessToken);

    $('#result-name').attr('text', name);

    if(type === 'album') {
    	processAlbum(id);
    }

    if(type === 'artist') {
    	processArtist(id);
    }

    if(type === 'playlist') {
    	processPlaylist(id);
    }
}

function processArtist(id) {
	setupDataObjects();

	fetchArtistAlbums(id, {limit: 50, album_type: ['album']}, function(data) {
		if(!data) {
			// error
		} else {
			console.log(data);
			var title = data.items[0].artists[0].name;
			$('#result-name').html(title);
		}
	});
}

function processAlbum(id) {
	console.log("processAlbum");
	setupDataObjects();

	fetchAlbum(id, {}, function(data) {
		if(!data) {
			// error
		} else {
			var title = data.name + ' by ' + data.artists[0].name;
			console.log(data, title);
			$('#result-name').html(title);			

			fetchAlbumTracks(id, {limit: 50, offset: 0}, function(data) {
				if(!data) {
					//error
				} else {
					console.log(data);

					_.each(data.items, function(track) {
						var features = {
							id: track.id,
							name: track.name,
							track_number: track.track_number,
							duration: track.duration_ms / 1000
						}

						addTrackFeatures(features, 0);
					});
				}
			});
		}
	});
}


function processTrack(trackFeatures, albumNum) {
	var name = trackFeatures.name;
	var featIndex = name.indexOf("feat.");
	if(featIndex == -1)
		featIndex = name.indexOf("Feat.");
	if(featIndex != -1) {
		var prevChar = name.substring(featIndex-1, featIndex);
		if(prevChar != " ") {
			name = name.substring(0, featIndex-1);
		} else {
			name = name.substring(0, featIndex);
		}
	}


	chartData['danceability']['series'][albumNum][trackFeatures.track_number] = trackFeatures.danceability;
	chartData['danceability']['labels'][trackFeatures.track_number] = name;
	chartData['energy']['series'][albumNum][trackFeatures.track_number] = trackFeatures.energy;
	chartData['energy']['labels'][trackFeatures.track_number] = name;
	chartData['key']['series'][albumNum][trackFeatures.track_number] = trackFeatures.key;
	chartData['key']['labels'][trackFeatures.track_number] = name;
	chartData['loudness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.loudness;
	chartData['loudness']['labels'][trackFeatures.track_number] = name;
	chartData['speechiness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.speechiness;
	chartData['speechiness']['labels'][trackFeatures.track_number] = name;
	chartData['acousticness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.acousticness;
	chartData['acousticness']['labels'][trackFeatures.track_number] = name;
	chartData['instrumentalness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.instrumentalness;
	chartData['instrumentalness']['labels'][trackFeatures.track_number] = name;
	chartData['liveness']['series'][albumNum][trackFeatures.track_number] = trackFeatures.liveness;
	chartData['liveness']['labels'][trackFeatures.track_number] = name;
	chartData['valence']['series'][albumNum][trackFeatures.track_number] = trackFeatures.valence;
	chartData['valence']['labels'][trackFeatures.track_number] = name;
	chartData['tempo']['series'][albumNum][trackFeatures.track_number] = trackFeatures.tempo;
	chartData['tempo']['labels'][trackFeatures.track_number] = name;
	chartData['time_signature']['series'][albumNum][trackFeatures.track_number] = trackFeatures.time_signature;
	chartData['time_signature']['labels'][trackFeatures.track_number] = name;

	updateChart();
}


function addTrackFeatures(features, albumNum) {
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

			// console.log(features);
			processTrack(features, albumNum);			
		}
	});
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
			return 16;
		default:
			return 1;
	}
}

function updateChart() {
	var selected = $("#feature-selector").val();
	var selected2 = $("#feature-selector-2").val();
	// console.log(selected, selected2);
	var snone = selected != "none"; // true if something was selected in box 1
	var snone2 = selected2 != "none"; // true if something was selected in box 2
	
	var chartSetter = {
		labels: [],
		series: []
	};

	var chartSetter2 = {
		labels: [],
		series: [[],[]]
	};

	if(snone) {
		$("#result-chart").show();
		options.low = getFeatureLow(selected);
		options.high = getFeatureHigh(selected);
		chartSetter['labels'] = chartData[selected]['labels'];
		chartSetter['series'][0] = chartData[selected]['series'][0];
		new Chartist.Line('#result-chart', chartSetter, options);
	} else {
		new Chartist.Line('#result-chart', null);
	}
	
	if(snone2) {
		$("#result-chart2").show();
		options2.low = getFeatureLow(selected2);
		options2.high = getFeatureHigh(selected2);
		chartSetter2['labels'] = chartData[selected]['labels'];
		chartSetter2['series'][1] = chartData[selected2]['series'][0];
		new Chartist.Line('#result-chart2', chartSetter2, options2);
	} else {
		$("#result-chart2").hide();
	}

}







/* ASYNCH OPERATION */
function getTrackFeatures(trackID, trackObject) {
	fetchAudioFeatures(trackID, function(data) {
		if(!data) {
			//error
		} else {

			trackObject['danceability'] = data.danceability;
			trackObject['energy'] = data.energy;
			trackObject['key'] = data.key;
			trackObject['loudness'] = data.loudness;
			trackObject['speechiness'] = data.speechiness;
			trackObject['acousticness'] = data.acousticness;
			trackObject['instrumentalness'] = data.instrumentalness;
			trackObject['liveness'] = data.liveness;
			trackObject['valence'] = data.valence;
			trackObject['tempo'] = data.tempo;
            trackObject['time_signature'] = data.time_signature;	
		}
	});
}