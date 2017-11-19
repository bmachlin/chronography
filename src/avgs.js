let access_token = null;
let refresh_token = null;
let args = {};
let results = [];
let redirect = config.redirect;
let client = config.client;
let secret = config.secret;
let username = "";
let type = "";


function parseArgs() {
    let hash = location.hash.replace(/#/g, '');
    let ps = location.search.replace("?", "");

    // get spotify tokens and search parameters    
    let params = ps.split('&');
    let tokens = hash.split('&');

    _.each(params, function(keyvalue) {
        let kv = keyvalue.split('=');
        let key = kv[0];
        let val = kv[1];
        if(val != '') args[key] = val;
        console.log(key, val);
    });

    _.each(tokens, function(keyvalue) {
        let kv = keyvalue.split('=');
        let key = kv[0];
        let val = kv[1];
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

            if ('artist' in args) {

                type = 'artist';
                getArtists(args['artist'], 0);

            } else if ('album' in args) {

                type = 'album';
                getAlbums(args['album'], 0);
            }
        } else {

            $("#authorize-button").on('click', function(event) {
                authorizeUserImplicit(client, redirect, ['playlist-read-private']);
            });
            // $("#playlists-button").on('click', function(event) {
            //     authorizeUserImplicit(client, redirect, ['playlist-read-private']);
            // });
        }

    }
});
