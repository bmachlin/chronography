var accessToken = null;
var refreshToken = null;
var args = {};
var results = [];
var redirect = 'http://localhost/SpotifyTools/tools/avgs/avgs.html';
var client = '7fc1ac4a76fe46fbb0d8b2791512daf2';
var secret = '9eb898b7b90c48c1a01cf298199bcf44'
var username = "";
var type = "";


function parseArgs() {
    var hash = location.hash.replace(/#/g, '');
    var ps = location.search.replace("?", "");

    // get spotify tokens and search parameters    
    var params = ps.split('&');
    
    var tokens = hash.split('&');

    
    _.each(params, function(keyvalue) {
        var kv = keyvalue.split('=');
        var key = kv[0];
        var val = kv[1];
        if(val != '') args[key] = val;
        console.log(key, val);
    });

    _.each(tokens, function(keyvalue) {
        var kv = keyvalue.split('=');
        var key = kv[0];
        var val = kv[1];
        if(val != '') args[key] = val;
        console.log(key, val);
    });

    return args;
}


function getAverage(data) {
    if (!data) {
        console.log("no data");
    }


    if (data.next) {
        callSpotify(data.next, {}, function(data) {
            getAverage(data);
        });
    } else {
        console.log("done getting data");
    }
}


$(document).ready(function() {
    args = parseArgs();

    if ('id' in args) {
        $("#authorize-button").hide();


        if(localStorage.refresh_token) {
            getNewToken(localStorage.refresh_token, client, secret, function(r) {
                generateAverages(args['id'], args['type']);
            });
        } else {
            //need to authorize
        }

    } else {
        $("#data-results").hide();

        if ('artist' in args) {

            type = 'artist';
            getArtists(args['artist']);

        } else if ('album' in args) {

            type = 'album';
            getAlbums(args['album']);
        }

        if ('code' in args) {
            getTokens(args['code'], redirect, client, secret, function() {
                var u = fetchCurrentUserProfile(function(user) {
                    if (user) username = user.id;
                });

                u.done(function() {
                    $("#authorize-button").hide();
                    $("#playlists-button").on('click', function(event) {
                        $("#result-buttons").empty();
                        type = 'playlist';
                        getPlaylists(50, 0);
                    });
                });

            });
        } else {
            $("#authorize-button").on('click', function(event) {
                authorizeUser(client, redirect, ['playlist-read-private']);
            });
            $("#playlists-button").on('click', function(event) {
                authorizeUser(client, redirect, ['playlist-read-private']);
            });
        }
    }
});





/*

LINEAR GRAPH FOR DIFFERENT PARAMETERS RATHER THAN JUST AVERAGE

CURATED PLAYLIST ORDER BASED ON CHOSEN PARAMETERS
^PLAYLIST ORDERING ALGORITHM


ENTER ARTIST:
CREATE GRAPH(S) OF HOW THEIR DIFFERENT METRICS CHANGE OVER TIME
*/