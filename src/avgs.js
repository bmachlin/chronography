var access_token = null;
var refresh_token = null;
var args = {};
var results = [];
var redirect = 'http://localhost:5000';
var client = CLIENT_KEY;
var secret = SECRET_KEY;
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

$(document).ready(function() {
    args = parseArgs();

    if ('id' in args) {
        $("#authorize-button").hide();
        generateAverages(args['id'], args['type'], args['access_token']);

    } else {
        $("#data-results").hide();

        if ('access_token' in args) {
            $("#authorize-button").hide();
            access_token = args['access_token'];
            setAccessToken(access_token);
        } else {

            $("#authorize-button").on('click', function(event) {
                authorizeUserImplicit(client, redirect, ['playlist-read-private']);
            });
            // $("#playlists-button").on('click', function(event) {
            //     authorizeUserImplicit(client, redirect, ['playlist-read-private']);
            // });
        }
        
        if ('artist' in args) {

            type = 'artist';
            getArtists(args['artist'], 0);

        } else if ('album' in args) {

            type = 'album';
            getAlbums(args['album'], 0);
        }

    }
});
