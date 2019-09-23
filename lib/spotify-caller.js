/*

    Spotify Caller
    Used to communicate with the Spotify API

    by Ben Machlin

*/

var AuthToken = ''; //Authorization token

/*
function: Queries Spotify API
parameters: url = url to get from
data = data to provide to Spotify, usually {}
callback: callback function
dataType: optional dataType specification
*/
function callSpotify(url, data, callback, dataType) {
    if (AuthToken === '') {
        return $.ajax({
            url: url,
            dataType: dataType,
            data: data,
            success: function(r) {
                callback(r);
            },
            statusCode: {
                429: function(r, ts, jq) {
                    console.log(r);
                    console.log(ts);
                    console.log(jq);
                    console.log(r.getAllResponseHeaders());
                    var retryAfter = r.getAllResponseHeaders();
                    console.log(retryAfter);
                    retryAfter = parseInt(retryAfter, 10);
                    console.log('TMR, Retry-After');
                    if(!retryAfter) { 
                        console.log("ho");
                        retryAfter = 3000;
                    }
                    console.log("ra: ", retryAfter);
                    setTimeout(function() { callSpotify(url, data, callback)}, retryAfter);
                },
                401: function(r) {
                    console.log(r);
                }
            }
        });
    } else {
        console.log("with AuthToken");
        return $.ajax({
            url: url,
            dataType: dataType,
            data: data,
            headers: {
                'Authorization': 'Bearer ' + AuthToken
            },
            success: function(r) {
                callback(r);
            },
            statusCode: {
                429: function(r, ts, jq) {
                    var retryAfter = r.getResponseHeader('Retry-After');
                    retryAfter = parseInt(retryAfter, 10);
                    console.log('TMR, Retry-After: ', retryAfter);
                    if(!retryAfter) {
                        console.log("ho");
                        retryAfter = 3000;
                    }
                    console.log("ra: ", retryAfter);
                    setTimeout(function() { callSpotify(url, data, callback)}, retryAfter);
                },
                401: function(r) {
                    console.log(r);
                }
            }
        });
    }
}

/*
function: Authorize user
parameters: client_id = string, client ID for the Spotify app in use
redirect_uri = string, pretty self-explanatory
scopes: array of strings, each string being a correctly dashed scope.
        e.g. ['user-library-read', 'playlist-modify-public']
*/
function authorizeUser(client_id, redirect_uri, scopes) {
    var scopeString = scopes[0];
    for(var i = 1; i < scopes.length; i++) {
        scopeString = '%20' + scopes[i];
    }

    var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        '&scope=' + scopeString +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
    console.log(url);
    document.location = url;
}


function setAccessToken(token) {
    AuthToken = token;
}




function fetchCurrentUserProfile(callback) {
    var url = 'https://api.spotify.com/v1/me';
    return callSpotify(url, null, callback);
}

function fetchCurrentUserPlaylists(callback) {
    var url = 'https://api.spotify.com/v1/me/playlists';
    return callSpotify(url, null, callback);
}

function fetchCurrentUserPlaylistsOptions(limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/me/playlists' +
        '&limit=' + limit + '&offset=' + offset;
    return callSpotify(url, null, callback);
}

function fetchSavedTracks(callback) {
    var url = 'https://api.spotify.com/v1/me/tracks';
    return callSpotify(url, {}, callback);
}

function fetchRelatedArtists(artistId, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + artistId + '/related-artists';
    return callSpotify(url, {}, callback);
}


function fetchArtist(artistId, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + artistId;
    return callSpotify(url, {}, callback);
}


function fetchTopArtists(callback) {
    var url = 'https://api.spotify.com/v1/me/top/artists';
    return callSpotify(url, {}, callback);
}

function fetchTopTracks(callback) {
    var url = 'https://api.spotify.com/v1/me/top/tracks';
    return callSpotify(url, {}, callback);
}


function fetchTopArtists(limit, time_range, callback) {
    var url = 'https://api.spotify.com/v1/me/top/artists' +
    '?time_range=' + time_range + '&limit=' + limit;
    return callSpotify(url, {}, callback);
}


function fetchTopTracks(limit, time_range, callback) {
    var url = 'https://api.spotify.com/v1/me/top/tracks' +
    '?time_range=' + time_range + '&limit=' + limit;
    return callSpotify(url, {}, callback);
}

function fetchAlbumTracks(id, limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/albums/' + id +
    '/tracks?&limit=' + limit + '&offset=' + offset;
    return callSpotify(url, {}, callback);
}

function fetchPlaylistTracks(id, callback) {
    var url = 'https://api.spotify.com/v1/user/qwertygnu/playlists/' + id + '/tracks';
    return callSpotify(url, {}, callback);
}


function fetchAudioFeatures(id, callback) {
    var url = 'https://api.spotify.com/v1/audio-features/' + id;
    return callSpotify(url, {}, callback);
}


function fetchArtistAlbums(id, limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + id + '/albums' +
                '?album_type=album,single&limit=' + limit + '&offset=' + offset;
    return callSpotify(url, {}, callback);
}


function searchSpotify(query, type, callback) {
    var url = 'https://api.spotify.com/v1/search?query=' + encodeURIComponent(query)
                + '&type=' + type;
    return callSpotify(url, {}, callback);
}

function searchSpotifyOptions(query, type, limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/search?query=' + encodeURIComponent(query)
                + '&offset=' + offset + '&limit=' + limit + '&type=' + type;
    return callSpotify(url, {}, callback);
}


function getArtistId(query, callback) {
    return searchSpotify(query, 'artist', 1, 0, function(r) {
        if(r === null || r.artists.length === 0) {
            //error
            console.log('no artist found');
        } else {
            callback(r.artists.items[0].id);
        }
    });
}

/*returns track ID for a given query*/
function getTrackId(query, callback) {
    return searchSpotify(query, 'track', 1, 0, function(r) {
        if(r === null || r.tracks.length === 0) {
            //error
            console.log('no track found');
        } else {
            callback(r.tracks.items[0].id);
        }
    });
}

/*returns album ID for a given query*/
function getAlbumId(query, callback) {
    return searchSpotify(query, 'album', 1, 0, function(r) {
        if(r === null || r.albums.length === 0) {
            //error
            console.log('no album found');
        } else {
             callback(r.albums.items[0].id);
        }
    });
}


function getPlaylistId(query, callback) {
    return searchSpotify(query, 'playlist', 1, 0, function(r) {
        if(r === null || r.playlists.length === 0) {
            //error
            console.log('no playlist found');
        } else {
            callback(r.playlists.items[0].id);
        }
    });
}

function getId(query, type, callback) {
    return searchSpotify(query, type, 1, 0, function(r) {
        if(r === null) {
            //error
            console.log('bad request');
        } else {
            if(type === 'playlist') {
                if(r.playlist.length > 0) {
                    callback(r.playlists.items[0].id);
                }
            }
            if(type === 'album') {
                if(r.album.length > 0) {
                    callback(r.albums.items[0].id);
                }
            }
            if(type === 'artist') {
                if(r.artist.length > 0) {
                    callback(r.artists.items[0].id);
                }
            }
            if(type === 'track') {
                if(r.track.length > 0) {
                     callback(r.tracks.items[0].id);
                }
            }
            console.log('no' + type + 'found');
        }
    });
}

function getIdOptions(query, type, offset, callback) {
    return searchSpotify(query, type, 1, offset, function(r) {
        if(r === null) {
            //error
            console.log('bad request');
        } else {
            if(type === 'playlist') {
                if(r.playlist.length > 0) {
                    callback(r.playlists.items[0].id);
                }
            }
            if(type === 'album') {
                if(r.album.length > 0) {
                    callback(r.albums.items[0].id);
                }
            }
            if(type === 'artist') {
                if(r.artist.length > 0) {
                    callback(r.artists.items[0].id);
                }
            }
            if(type === 'track') {
                if(r.track.length > 0) {
                     callback(r.tracks.items[0].id);
                }
            }
            console.log('no' + type + 'found');
        }
    });
}

function getRelatedArtists(id, relNum, callback) {
    return fetchRelatedArtists(id, function(r) {
        if(r === null || r.artists.length === 0) {
            //error
            console.log('no related artists found');
        } else {
            callback(r.slice(0, relNum));
        }
    });
}
