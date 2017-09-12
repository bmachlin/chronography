/*

    Spotify Caller (JavaScript)
    -Used to communicate with the Spotify API.
    -See https://developer.spotify.com/web-api/endpoin-reference/ for 
        more in depth documentation on each endpoint's functionality
    -Required options properties capitalized
    -Country, market, and locale options use ISO 3166-1 alpha-2 notation
    -Limit range is [1,50], default 20, unless otherwise noted
    -Offset default is always 0
    by Ben Machlin

*/

/* INTERNAL FUCNTIONS */

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
    // console.log(AccessTokenSC);
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
    // console.log("token", token);
    AccessTokenSC = token;
}
function setRefreshToken(token) {
    RefreshTokenSC = token;
    localStorage.refresh_token = token;
}

/* ENDPOINTS (the functions you should be calling) */

/* ARTISTS */

function fetchArtist(artistID, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + artistID;
    return callSpotify(url, {}, callback);
}

function fetchArtistMulti(artistIDs, callback) { 
    var idString = artistIDs[0];
    for(var i = 1; i < artistIDs.length && i < 100; i++) {
        idString += "," + artistIDs[i];
    }
    var url = 'https://api.spotify.com/v1/artists/?ids=' + idString;
    return callSpotify(url, {}, callback);
}

// options: COUNTRY
function fetchArtistTopTracks(artistID, options, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + artistID + '/top-tracks';
    return callSpotify(url, options, callback);
}

function fetchRelatedArtists(artistID, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + artistID + '/related-artists';
    return callSpotify(url, {}, callback);
}

// options: album_type (album, single, appears_on, compilation), 
// market, limit, offset
function fetchArtistAlbums(artistID, options, callback) {
    var url = 'https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?album_type=album,single';
    return callSpotify(url, options, callback);
}

/* ALBUMS */

// options: market
function fetchAlbum(albumID, options, callback) {
    var url = 'https://api.spotify.com/v1/albums/' + albumID;
    return callSpotify(url, options, callback);
}

// options: market
function fetchAlbumMulti(albumIDs, options, callback) { 
    var idString = albumIDs[0];
    for(var i = 1; i < albumIDs.length && i < 100; i++) {
        idString += "," + albumIDs[i];
    }
    var url = 'https://api.spotify.com/v1/albums/?ids=' + idString;
    return callSpotify(url, options, callback);
}

// options: limit, offset, market
function fetchAlbumTracks(albumID, options, callback) {
    var url = 'https://api.spotify.com/v1/albums/' + albumID + '/tracks';
    return callSpotify(url, options, callback);
}

/* TRACKS */

// options: market
function fetchTrack(trackID, options, callback) {
    var url = 'https://api.spotify.com/v1/tracks/' + trackID;
    return callSpotify(url, options, callback);
}

// options: market
function fetchTrackMulti(trackIDs, options, callback) {
    var idString = trackIDs[0];
    for(var i = 1; i < trackIDs.length && i < 100; i++) {
        idString += "," + trackIDs[i];
    }
    var url = 'https://api.spotify.com/v1/tracks/?ids=' + idString;
    return callSpotify(url, options, callback);
}

function fetchAudioFeatures(trackID, callback) {
    var url = 'https://api.spotify.com/v1/audio-features/' + trackID;
    return callSpotify(url, {}, callback);
}

function fetchAudioFeaturesMulti(trackIDs, callback) {
    var idString = trackIDs[0];
    for(var i = 1; i < trackIDs.length && i < 100; i++) {
        idString += "," + trackIDs[i];
    }
    var url = 'https://api.spotify.com/v1/audio-features/?ids=' + idString;
    return callSpotify(url, {}, callback);
}

function fetchAudioAnalysis(trackID, callback) {
    var url = 'https://api.spotify.com/v1/audio-analysis/' + trackID;
    return callSpotify(url, {}, callback);
}

/* USER */

function fetchUser(userID, callback) {
    var url = 'https://api.spotify.com/v1/users/' + userID;
    return callSpotify(url, {}, callback);
}

function fetchCurrentUser(callback) {
    var url = 'https://api.spotify.com/v1/me';
    return callSpotify(url, {}, callback);
}

// options: limit, offset
function fetchUserPlaylists(userID, options, callback) {
    var url = 'https://api.spotify.com/v1/' + userID + '/playlists';
    return callSpotify(url, options, callback);
}

// options: limit, offset
function fetchCurrentUserPlaylists(options, callback) {
    var url = 'https://api.spotify.com/v1/me/playlists';
    return callSpotify(url, options, callback);
}

// options: fields, limit ([1,100], 100), offset, market
function fetchUserPlaylistTracks(userID, playlistID, options, callback) {
    var url = 'https://api.spotify.com/v1/' + userID + '/playlists/' + playlistID + '/tracks';
    return callSpotify(url, options, callback);
}

// options: limit, offset, market
function fetchSavedTracks(options, callback) {
    var url = 'https://api.spotify.com/v1/me/tracks';
    return callSpotify(url, options, callback);
}

function fetchSavedTracksContains(trackIDs, callback) {
    var idString = trackIDs[0];
    for(var i = 1; i < trackIDs.length && i < 50; i++) {
        idString += "," + trackIDs[i];
    }
    var url = 'https://api.spotify.com/v1/me/tracks/contains?ids=' + idString;
    return callSpotify(url, {}, callback);
}

// options: limit, offset, time_range
function fetchTopArtists(options, callback) {
    var url = 'https://api.spotify.com/v1/me/top/artists';
    return callSpotify(url, options, callback);
}

// options: limit, offset, time_range
function fetchTopTracks(options, callback) {
    var url = 'https://api.spotify.com/v1/me/top/tracks';
    return callSpotify(url, options, callback);
}

// options: limit, after, before (unix timestamps)
function fetchRecentlyPlayed(options, callback) {
    var url = 'https://api.spotify.com/v1/me/player/recently-played';
    return callSpotify(url, options, callback);
}

function fetchDevices(callback) {
    var url = 'https://api.spotify.com/v1/me/player/devices';
    return callSpotify(url, {}, callback);
}

// options: market
function fetchPlayer(options, callback) {
    var url = 'https://api.spotify.com/v1/me/player';
    return callSpotify(url, options, callback);
}

// options: market
function fetchCurrentlyPlaying(options, callback) {
    var url = 'https://api.spotify.com/v1/me/player/currently-playing';
    return callSpotify(url, options, callback);
}

/* BROWSE */

// options: locale , country, timestamp, limit, offset
function fetchFeaturedPlaylists(options, callback) {
    var url = 'https://api.spotify.com/v1/browse/featured-playlists';
    return callSpotify(url, options, callback);
}

// options: country, limit, offset
function fetchNewReleases(options, callback) {
    var url = 'https://api.spotify.com/v1/browse/new-releases';
    return callSpotify(url, options, callback);
}

// options: country, locale, limit, offset
function fetchCategories(options, callback) {
    var url = 'https://api.spotify.com/v1/browse/categories';
    return callSpotify(url, options, callback);
}

// options: country, locale
function fetchCategory(catID, options, callback) {
    var url = 'https://api.spotify.com/v1/browse/categories/' + catID;
    return callSpotify(url, options, callback);
}

// options: country, limit, offset
function fetchCategoryPlaylists(catID, options, callback) {
    var url = 'https://api.spotify.com/v1/browse/categories/' + catID + '/playlists';
    return callSpotify(url, options, callback);
}

/* OTHER */

// options: limit ([1,100], 20), offset, market, seed_artists, seed_genres, 
//          seed_tracks, min_*, max_*, target_* -- where '*' is an audio 
//          feature attribute (e.g. energy, tempo...)
function fetchRecommendations(options, callback) {
    var url = 'https://api.spotify.com/v1/recommendations';
    return callSpotify(url, options, callback);    
}

// options vary by type
function fetchTypeFromID(id, type, options, callback) {
    var url = 'https://api.spotify.com/v1/' + type + '/' + id;
    return callSpotify(url, options, callback);
}

// options: TYPE, market, limit, offset
// Full query functionality not yet implemented.
function searchSpotify(query, options, callback) {
    var url = 'https://api.spotify.com/v1/search?query=' + encodeURIComponent(query);
    
    return callSpotify(url, options, callback);
}

/* returns ID of first results from query */
function getFirstID(query, options, callback) {

    return searchSpotify(query, options, function(r) {
        if(r === null) {
            //error
            console.log('bad request');
        } else {
            if(options.type === 'playlist') {
                if(r.playlist.length > 0) {
                    callback(r.playlists.items[0].id);
                }
            } else if(options.type === 'album') {
                if(r.album.length > 0) {
                    callback(r.albums.items[0].id);
                }
            } else if(options.type === 'artist') {
                if(r.artist.length > 0) {
                    callback(r.artists.items[0].id);
                }
            } else if(options.type === 'track') {
                if(r.track.length > 0) {
                     callback(r.tracks.items[0].id);
                }
            } else {
                console.log('No ' + options.type + ' found.');
            }
        }
    });
}
