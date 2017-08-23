var chartData = {};
var labels = ['danceability', 'energy', 'key', 'loudness', 'speechiness', 'acousticness', 
				'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature']; //  'mode',
var options = {
	axisX: { showGrid: false },
	divisor: 10
}
var options2 = {
	axisX: { showGrid: false,
			 showLabel: false },
	axisY: { position: 'end'},
	divisor: 10,

}

function setupDataObjects() {
	_.each(labels, function(label) {
		chartData[label] = {};
		chartData[label]['series'] = [];
		chartData[label]['series'][0] = [];
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
    	getPlaylistData(id, 0);
    }
}

function processArtist(id) {
	setupDataObjects();

	fetchArtist(id, function(data) {
		if(!data) {
			// error
		} else {

		}
	});
}

function processAlbum(id) {
	setupDataObjects();

	fetchFromId(id, 'albums', function(data) {
		if(!data) {
			// error
		} else {
			var title = data.name + ' by ' + data.artists[0].name;
			console.log(data, title);
			$('#result-name').html(title);			

			fetchAlbumTracks(id, 50, 0, function(data) {
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
	// chartData['mode']['series'][albumNum][trackFeatures.track_number] = trackFeatures.mode;
	// chartData['mode']['labels'][trackFeatures.track_number] = name;
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
			// features['mode'] = data.mode;
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
	console.log(selected, selected2);
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

	// if(snone || snone2) {

	// 	if(snone) {
	// 		chartSetter['labels'] = chartData[selected]['labels'];
	// 		chartSetter['series'][0] = chartData[selected]['series'][0];
	// 		new Chartist.Line('#result-chart', chartSetter, options);

	// 		if(snone2) {
	// 			chartSetter2['labels'] = chartData[selected]['labels'];
	// 			chartSetter2['series'][0] = chartData[selected2]['series'][0];
	// 			new Chartist.Line('#result-chart2', chartSetter2, options2);
	// 		}

	// 	} else if(snone2) {
	// 		chartSetter2['series'][0] = chartData[selected2]['series'][0];
	// 		new Chartist.Line('#result-chart2', chartSetter2, options2);
	// 	}

	
	// } else {
	// 	new Chartist.Line('#result-chart', null);
	// 	new Chartist.Line('#result-chart2', null);
	// }

	if(snone) {
		$("#result-chart").show();
		chartSetter['labels'] = chartData[selected]['labels'];
		chartSetter['series'][0] = chartData[selected]['series'][0];
		new Chartist.Line('#result-chart', chartSetter, options);
	} else {
		new Chartist.Line('#result-chart', null);
	}
	
	if(snone2) {
		$("#result-chart2").show();
		chartSetter2['labels'] = chartData[selected]['labels'];
		chartSetter2['series'][1] = chartData[selected2]['series'][0];
		new Chartist.Line('#result-chart2', chartSetter2, options2);
	} else {
		$("#result-chart2").hide();
	}

}


































// function getArtistData(id, offset) {
// 	var albumIds = [];

// 	fetchArtistAlbums(id, 50, 0, function(data) {
// 		if(data == null || data.items.length == 0) {
//             //error
//             return null;
// 	    } else {

// 	    	console.log(data);

// 	    	_.each(data.items, function(album) {
// 	    		albumIds.push(album.id);
// 	    	});

// 	    	if (data.next) {
// 		        getArtistData(id, offset + 50);
// 		    } else {
// 		        console.log("done getting data");
// 		    }

// 		    getArtistAverages(albumIds);
// 	    }
// 	});

// }

// function getArtistAverages(albumIds) {
// 	_.each(albumIds, function(id) {
// 		getAlbumAverages(id, 0, function(results) {
// 			//stuff
// 		});
// 	});
// }

// function getAlbumAverages(id, offset, callback) {
// 	var results = [];

// 	fetchAlbumTracks(id, 50, offset, function(data) {
// 		if(data == null || data.items.length == 0) {
//             //error
// 	    } else {

// 	    	console.log(data);
	    	
// 	    	_.each(data.items, function(track) {
// 	    		results.push(track.id);
// 	    	});

// 	    	if (data.next) {
// 		        getAlbumData(id, offset + 50, callback);
// 		    } else {
// 		        console.log("done getting data");
// 		    }

// 			getTrackData(results, callback);

// 	    }
// 	});
// }



// function getAlbumData(id, offset) {
// 	console.log('gad', id, offset);
// 	var results = [];

// 	fetchAlbumTracks(id, 50, offset, function(data) {
// 		if(data == null || data.items.length == 0) {
//             //error
// 	    } else {

// 	    	console.log(data);
	    	
// 	    	_.each(data.items, function(track) {
// 	    		results.push(track.id);
// 	    	});

// 	    	if (data.next) {
// 		        getAlbumData(id, offset + 50);
// 		    } else {
// 		        console.log("done getting data");
// 		    }
// 	    }
// 	}).done(function(data) {
// 		console.log(results);
// 		getTrackData(results);
// 	});

// }

// function getPlaylistData(id, offset) {
// 	console.log('gpd', id, offset);
// 	var results = [];

// 	fetchPlaylistTracks(id, 50, offset, function(data) {
// 		if(data == null || data.items.length == 0) {
//             //error
// 	    } else {

// 	    	console.log(data);
	    	
// 	    	_.each(data.items, function(track) {
// 	    		results.push(track.track.id);
// 	    	});

// 	    	if (data.next) {
// 		        getPlaylistData(id, offset + 50);
// 		    } else {
// 		        console.log("done getting data");
// 		    }
// 	    }
// 	}).done(function(data) {
// 		console.log(results);
// 		getTrackData(results);
// 	});

// }

// function getTrackData(tracks, callback) {
// 	var trackData = {};
// 	var count = 0;
// 	_.each(tracks, function(id) {
// 		getIndividualTrackData(id, function(features) {
// 			count++;
// 			if(features) {
// 				trackData[id] = trackFeatures;
// 				callback(trackData[id]);
// 			}
// 		});
// 	});
// 	console.log(trackData);
// }

// function getIndividualTrackData(id, callback) {
//     var trackFeatures = null;
// 	fetchAudioFeatures(id, function(data) {
// 		if(!data) {
//             //error
// 	    } else {

// 	    	console.log(data);

// 	    	var trackFeatures = {
// 	    		id: id,
// 	    		// duration
// 	    		danceability : data.danceability,
// 				energy : data.energy,
// 				key : data.key,
// 				loudness : data.loudness,
// 				mode : data.mode,
// 				speechiness : data.speechiness,
// 				acousticness : data.speechiness,
// 				instrumentalness : data.instrumentalness,
// 				liveness : data.liveness,
// 				valence : data.valence,
// 				tempo : data.tempo,
// 				time_signature: data.time_signature
// 	    	}

// 	    	accumulator(trackFeatures, 'track');
// 	    }
// 	}).done(function(data) {
// 		callback(trackFeatures);
// 	});
// }

// function accumulator(features, type) {
// 	if(type === "track") {
// 		chartData[features.id] = features.energy;
// 	} else if(type === "album") {

// 	}
// }

// var labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 
// 			10,	11, 12, 13, 14, 15, 16, 17, 18, 19];
// 			// 20,	21, 22, 23, 24, 25, 26, 27, 28, 29,
// 			// 30,	31, 32, 33, 34, 35, 36, 37, 38, 39,
// 			// 40,	41, 42, 43, 44, 45, 46, 47, 48, 49, 50];

// var chartData = {};