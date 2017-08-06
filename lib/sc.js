/*

    Spotify Caller
    Used to communicate with the Spotify API

    by Ben Machlin

*/

var AuthCodeSC     = ''; //Authorization token
var AccessTokenSC  = '';
var RefreshTokenSC = '';

/*
function: Queries Spotify API
parameters: url = url to get from
data = data to provide to Spotify, usually {}
callback: callback function
dataType: optional dataType specification
*/
function callSpotify(url, data, callback, dataType) {
    console.log(AccessTokenSC);
    if (AccessTokenSC === '') {
        console.log("without token");
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
        console.log("with token");
        return $.ajax({
            url: url,
            dataType: dataType,
            data: data,
            headers: {
                'Authorization': 'Bearer ' + AccessTokenSC
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
            },
            error: function(r) {
                console.log(r);
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
        '&response_type=code' +
        '&scope=' + scopeString +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
    console.log(url);
    document.location = url;
}

function authorizeUserImplicit(client_id, redirect_uri, scopes) {
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

function getTokens(code, redirect, client, secret, callback) {
    setAuthCode(code);
    $.ajax({
      method: "POST",
      url: 'https://accounts.spotify.com/api/token',
      data: {
        "grant_type": 'authorization_code',
        "code": code,
        "redirect_uri": encodeURIComponent(redirect),
        "client_id": client,
        "client_secret": secret
      },
      crossDomain: true,
      headers: {
        'Access-Control-Allow-Origin' : 'http://localhost:8000',
        // 'Authorization': 'Basic ' + client + ':' + secret
      },
      error: function(r) {
        console.log(r);
        if(r.responseText.includes('invalid_grant')) {
            getNewToken(localStorage.refresh_token, client, secret, callback);
        }
      },
      success: function(r) {
        console.log(r);
        setAccessToken(r.access_token);
        setRefreshToken(r.refresh_token);
        callback(r);
      }
    });
}

function getNewToken(refresh, client, secret, callback) {
    console.log("hi", AccessTokenSC, RefreshTokenSC);
    $.ajax({
      method: "POST",
      url: 'https://accounts.spotify.com/api/token',
      data: {
        "grant_type": 'refresh_token',
        "refresh_token": refresh,
        "client_id": client,
        "client_secret": secret
      },
      crossDomain: true,
      headers: {
        'Access-Control-Allow-Origin' : 'http://localhost:8000',
        // 'Authorization': 'Basic ' + client + ':' + secret
      },
      error: function(r) {
        console.log(r);
      },
      success: function(r) {
        console.log(r);
        setAccessToken(r.access_token);
        callback(r);
      }
    });
}

function setAuthCode(code) {
    AuthCodeSC = code;
}
function setAccessToken(token) {
    console.log("token", token);
    AccessTokenSC = token;
}
function setRefreshToken(token) {
    RefreshTokenSC = token;
    localStorage.refresh_token = token;
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
    var url = 'https://api.spotify.com/v1/me/playlists';
    return callSpotify(url, {'limit': limit, 'offset': offset}, callback);
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
    var url = 'https://api.spotify.com/v1/me/top/artists';
    return callSpotify(url, {'limit': limit, 'time_range': time_range}, callback);
}


function fetchTopTracks(limit, time_range, callback) {
    var url = 'https://api.spotify.com/v1/me/top/tracks';
    return callSpotify(url, {'limit': limit, 'time_range': time_range}, callback);
}

function fetchAlbumTracks(id, limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/albums/' + id + '/tracks';
    return callSpotify(url, {'limit': limit, 'offset': offset}, callback);
}

function fetchPlaylistTracks(id, limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/users/qwertygnu/playlists/' + id + '/tracks';
    return callSpotify(url, {'limit': limit, 'offset': offset}, callback);
}


function fetchAudioFeatures(id, callback) {
    var url = 'https://api.spotify.com/v1/audio-features/' + id;
    return callSpotify(url, {}, callback);
}


function fetchArtistAlbums(id, limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + id + '/albums' + '?album_type=album,single';
    return callSpotify(url, {'limit': limit, 'offset': offset}, callback);
}

function fetchFromId(id, type, callback) {
    var url = 'https://api.spotify.com/v1/' + type + '/' + id;
    return callSpotify(url, {}, callback);
}

function searchSpotify(query, type, callback) {
    var url = 'https://api.spotify.com/v1/search?query=' + encodeURIComponent(query);
    return callSpotify(url, {'type': type}, callback);
}

function searchSpotifyOptions(query, type, limit, offset, callback) {
    var url = 'https://api.spotify.com/v1/search?query=' + encodeURIComponent(query);
    return callSpotify(url, {'limit': limit, 'offset': offset, 'type': type}, callback);
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
