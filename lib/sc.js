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
    2018

*/

/* INTERNAL FUCNTIONS */

let AuthCodeSC     = ''; // Authorization token
let AccessTokenSC  = '';
let RefreshTokenSC = '';
let ExpireTimeSC = new Date().getTime();

/*
function: Queries Spotify API
parameters: url = url to get from
data = data to provide to Spotify, usually {}
callback: callback function
*/
function callSpotify(url, options, callback) {
    if(accessTokenSet() && !isAccessExpired())
        AccessTokenSC = localStorage.AccessTokenSC;

    if(options != null && !(Object.keys(options).length === 0 && options.constructor === Object)) {
        url += (url.includes('?') ? '' : '?') + new URLSearchParams(options).toString();
    }
    
    let r = new XMLHttpRequest(); 
    r.open("GET", url, true);
    r.responseType = 'json';

    if (AccessTokenSC !== '') {
        r.setRequestHeader("Authorization", "Bearer " + AccessTokenSC);
    }
        
    r.onreadystatechange = function () {
        if (this.readyState == XMLHttpRequest.DONE) {
            if(this.status == 200) {
                callback(this.response);
            } else {
                console.log(url, this.readyState, this.status, this.response, "request error");
                switch (this.status) {
                    case 401:
                        resetAccess('');
                        break;
                    case 429:
                        let retryAfter = this.getResponseHeader('Retry-After');
                        retryAfter = parseInt(retryAfter, 10);
                        console.log('TMR, Retry-After: ', retryAfter);
                        if(!retryAfter) {
                            retryAfter = 3000;
                        }
                        setTimeout(() => { callSpotify(url, options, callback)}, retryAfter);
                        break;
                }
            }
        }
    };
    r.send();

}

/*
function: Authorize user
parameters: client_id = string, client Id for the Spotify app in use
redirect_uri = string, pretty self-explanatory
scopes: array of strings, each string being a correctly dashed scope.
        e.g. ['user-library-read', 'playlist-modify-public']
*/
function authorizeUser(client_id, redirect_uri, scopes) {
    let scopeString = scopes[0];
    for(let i = 1; i < scopes.length; i++) {
        scopeString = '%20' + scopes[i];
    }

    let url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=code' +
        '&scope=' + scopeString +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
    // console.log("auth url: " + url);
    document.location = url;
}

function authorizeUserImplicit(client_id, redirect_uri, scopes) {
    let scopeString = scopes[0];
    for(let i = 1; i < scopes.length; i++) {
        scopeString = '%20' + scopes[i];
    }

    let url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&response_type=token' +
        '&scope=' + scopeString +
        '&redirect_uri=' + encodeURIComponent(redirect_uri);
    // console.log("implicit auth url: " + url);
    document.location = url;
}

function getTokens(code, redirect, client, callback) {
    setAuthCode(code);
    $bt.ajax('https://accounts.spotify.com/api/token', {
        method: "POST",
        data: {
            "grant_type": 'authorization_code',
            "code": code,
            "redirect_uri": encodeURIComponent(redirect),
            "client_id": client
        },
        crossDomain: true,
        headers: {
            'Access-Control-Allow-Origin' : document.location
        },
        error: function(r) {
            console.log(r);
            if(r.responseText.includes('invalid_grant')) {
                getNewToken(localStorage.RefreshTokenSC, client, callback);
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

function getNewToken(refresh, client, callback) {
    console.log("getting new token", AccessTokenSC, RefreshTokenSC);
    $bt.ajax('https://accounts.spotify.com/api/token', {
        method: "POST",
        data: {
            "grant_type": 'refresh_token',
            "refresh_token": refresh,
            "client_id": client
        },
        crossDomain: true,
        headers: {
            'Access-Control-Allow-Origin' : document.location
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

function getAccessToken() {
    return localStorage.AccessTokenSC;
}
function setAuthCode(code) {
    AuthCodeSC = code;
    localStorage.AuthCodeSC = code;
}
function setAccessToken(token) {
    AccessTokenSC = token;
    localStorage.AccessTokenSC = token;
}
function setRefreshToken(token) {
    RefreshTokenSC = token;
    localStorage.RefreshTokenSC = token;
}
function setExpireTime(time) {
    ExpireTimeSC = new Date().getTime() + time;
    localStorage.ExpireTimeSC = ExpireTimeSC;
}
function isAccessExpired() {
    return localStorage.ExpireTimeSC === undefined 
        || localStorage.ExpireTimeSC === null 
        || new Date().getTime() > parseInt(localStorage.ExpireTimeSC);
}
function accessTokenSet() {
    return AccessTokenSC != '' || (localStorage.AccessTokenSC != null && localStorage.AccessTokenSC != '' && !isAccessExpired());
}
function resetAccess() {
    AccessTokenSC = '';
    localStorage.removeItem('AccessTokenSC');
    localStorage.removeItem('ExpireTimeSC');
}


/* ENDPOINTS (the functions you should be calling) */

/* ARTISTS */

function getArtist(artistId, callback) {
    let url = 'https://api.spotify.com/v1/artists' + artistId;
    return callSpotify(url, {}, callback);
}

function getArtistMulti(artistIds, callback) {
    let url = 'https://api.spotify.com/v1/artists';
    return callSpotify(url, {'ids': join(',', artistIds)}, callback);
}

// options: COUNTRY
function getArtistTopTracks(artistId, options, callback) {
    let url = 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks';
    return callSpotify(url, options, callback);
}

function getRelatedArtists(artistId, callback) {
    let url = 'https://api.spotify.com/v1/artists/' + artistId + '/related-artists';
    return callSpotify(url, {}, callback);
}

// options: include_groups (album, single, appears_on, compilation),
// market, limit, offset
function getArtistAlbums(artistId, options, getAll, callback) {
    if(options == null)
        options = {};
    if(options.market == null)
        options.market = 'US';

    let url = 'https://api.spotify.com/v1/artists/' + artistId + '/albums';
    if(options.hasOwnProperty('include_groups')) {
        options.include_groups = join(',', options.include_groups);
    }
    if (getAll) {
        delete options.offset;
        delete options.limit;
        var albums = [];
        url += "?limit=50";
        function recurse(res) {
            albums = albums.concat(res.items);
            if(res.next && albums.length > 0) {
                callSpotify(res.next, {}, recurse);
            } else {
                res.items = albums;
                callback(res);
            }
        }
        return callSpotify(url, options, recurse);
    }
    return callSpotify(url, options, callback);
}

/* ALBUMS */

// options: market
function getAlbum(albumId, options, callback) {
    let url = 'https://api.spotify.com/v1/albums/' + albumId;
    return callSpotify(url, options, callback);
}

// options: market
function getAlbumMulti(albumIds, options, callback) {
    if(options == null)
        options = {};
    let url = 'https://api.spotify.com/v1/albums';
    options.ids = join(',', albumIds);
    return callSpotify(url, options, callback);
}

// options: limit, offset, market (without getAll)
function getAlbumTracks(albumId, options, getAll, callback) {
    var url = 'https://api.spotify.com/v1/albums/' + albumId + '/tracks';
    if (getAll) {
        delete options.offset;
        delete options.limit;
        var tracks = [];
        url += "?limit=50";
        function recurse(res) {
            tracks = tracks.concat(res.items);
            if(res.next && tracks.length > 0) {
                callSpotify(res.next, {}, recurse);
            } else {
                res.items = tracks;
                callback(res);
            }
        }
        return callSpotify(url, {}, recurse);
    }
    return callSpotify(url, options, callback);
}

/* TRACKS */

// options: market
function getTrack(trackId, options, callback) {
    let url = 'https://api.spotify.com/v1/tracks/' + trackId;
    return callSpotify(url, options, callback);
}

// options: market
function getTrackMulti(trackIds, options, callback) {
    if(options == null)
        options = {};
    let url = 'https://api.spotify.com/v1/tracks';
    options.ids = join(',', trackIds);
    return callSpotify(url, options, callback);
}

function getAudioFeatures(trackId, callback) {
    let url = 'https://api.spotify.com/v1/audio-features/' + trackId;
    return callSpotify(url, {}, callback);
}

function getAudioFeaturesMulti(trackIds, callback) {
    let url = 'https://api.spotify.com/v1/audio-features';
    return callSpotify(url, {'ids': join(',', trackIds)}, callback);
}

function getAudioAnalysis(trackId, callback) {
    let url = 'https://api.spotify.com/v1/audio-analysis/' + trackId;
    return callSpotify(url, {}, callback);
}

/* USER */

function getUser(userId, callback) {
    let url = 'https://api.spotify.com/v1/users/' + userId;
    return callSpotify(url, {}, callback);
}

function getCurrentUser(callback) {
    let url = 'https://api.spotify.com/v1/me';
    return callSpotify(url, {}, callback);
}

// options: limit, offset
function getUserPlaylists(userId, options, callback) {
    let url = 'https://api.spotify.com/v1/' + userId + '/playlists';
    return callSpotify(url, options, callback);
}

// options: limit, offset
function getCurrentUserPlaylists(options, callback) {
    let url = 'https://api.spotify.com/v1/me/playlists';
    return callSpotify(url, options, callback);
}

//options: market
function getPlaylist(id, options, callback) {
    let url = 'https://api.spotify.com/v1/playlists/' + id;
    return callSpotify(url, options, callback);
}

// options: fields, limit ([1,100], 100), offset, market
function getPlaylistTracks(playlistId, options, getAll, callback) {
    let url = 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks';
    if (getAll) {
        delete options.offset;
        delete options.limit;
        var tracks = [];
        function recurse(res) {
            tracks = tracks.concat(res.items);
            if(res.next && tracks.length > 0) {
                callSpotify(res.next, {}, recurse);
            } else {
                res.items = tracks;
                callback(res);
            }
        }
        return callSpotify(url, options, recurse);
    }
    return callSpotify(url, options, callback);
}

// options: limit, offset, market
function getSavedTracks(options, getAll, callback) {
    let url = 'https://api.spotify.com/v1/me/tracks';
    if (getAll) {
        delete options.offset;
        delete options.limit;
        var tracks = [];
        function recurse(res) {
            tracks = tracks.concat(res.items);
            if(res.next && tracks.length > 0) {
                callSpotify(res.next, {}, recurse);
            } else {
                res.items = tracks;
                callback(res);
            }
        }
        return callSpotify(url, options, recurse);
    }
    return callSpotify(url, options, callback);
}

function getSavedTracksContains(trackIds, callback) {
    let url = 'https://api.spotify.com/v1/me/tracks/contains';
    return callSpotify(url, {'ids': join(',', trackIds)}, callback);
}

// options: limit, offset, time_range
function getTopArtists(options, callback) {
    let url = 'https://api.spotify.com/v1/me/top/artists';
    return callSpotify(url, options, callback);
}

// options: limit, offset, time_range
function getTopTracks(options, callback) {
    let url = 'https://api.spotify.com/v1/me/top/tracks';
    return callSpotify(url, options, callback);
}

// options: limit, after, before (unix timestamps)
function getRecentlyPlayed(options, callback) {
    let url = 'https://api.spotify.com/v1/me/player/recently-played';
    return callSpotify(url, options, callback);
}

function getDevices(callback) {
    let url = 'https://api.spotify.com/v1/me/player/devices';
    return callSpotify(url, {}, callback);
}

// options: market
function getPlayer(options, callback) {
    let url = 'https://api.spotify.com/v1/me/player';
    return callSpotify(url, options, callback);
}

// options: market
function getCurrentlyPlaying(options, callback) {
    let url = 'https://api.spotify.com/v1/me/player/currently-playing';
    return callSpotify(url, options, callback);
}

/* BROWSE */

// options: locale , country, timestamp, limit, offset
function getFeaturedPlaylists(options, callback) {
    let url = 'https://api.spotify.com/v1/browse/featured-playlists';
    return callSpotify(url, options, callback);
}

// options: country, limit, offset
function getNewReleases(options, callback) {
    let url = 'https://api.spotify.com/v1/browse/new-releases';
    return callSpotify(url, options, callback);
}

// options: country, locale, limit, offset
function getCategories(options, callback) {
    let url = 'https://api.spotify.com/v1/browse/categories';
    return callSpotify(url, options, callback);
}

// options: country, locale
function getCategory(catId, options, callback) {
    let url = 'https://api.spotify.com/v1/browse/categories/' + catId;
    return callSpotify(url, options, callback);
}

// options: country, limit, offset
function getCategoryPlaylists(catId, options, callback) {
    let url = 'https://api.spotify.com/v1/browse/categories/' + catId + '/playlists';
    return callSpotify(url, options, callback);
}

/* OTHER */

// options: limit ([1,100], 20), offset, market, seed_artists, seed_genres,
//          seed_tracks, min_*, max_*, target_* -- where '*' is an audio
//          feature attribute (e.g. energy, tempo...)
function getRecommendations(options, callback) {
    let url = 'https://api.spotify.com/v1/recommendations';
    return callSpotify(url, options, callback);
}

// options vary by type
function getTypeFromId(id, type, options, callback) {
    let url = 'https://api.spotify.com/v1/' + type + '/' + id;
    return callSpotify(url, options, callback);
}

// options: TYPE, market, limit, offset
// Full query functionality not yet implemented.
function searchSpotify(query, options, callback) {
    if(options == null)
        options = {};
    options.query = query;
    let url = 'https://api.spotify.com/v1/search';
    return callSpotify(url, options, callback);
}

/* returns Id of first results from query */
function getFirstId(query, options, callback) {

    return searchSpotify(query, options, function(r) {
        if(r !== null) {
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
