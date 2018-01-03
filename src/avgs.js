let access_token = null;
let refresh_token = null;
let args = {};
let results = [];
let redirect = config.redirect;
let client = config.client;
let secret = config.secret;
let username = "";
let type = "";
let state = 0;
const STATE_INIT = 0;
const STATE_AUTH = 1;
const STATE_SEARCH = 2;
const STATE_SELECT = 3;

/* 
    STATE KEY
    0 = NO AUTH
    1 = AUTH
    2 = SEARCH RESULTS
    3 = ITEM SELECTED
*/


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

function formSearch() {
    let q = $("#search-query").val();
    setState(STATE_SEARCH);
    search(q);
}

function setState(s) {
    console.log("setting state to " + s);

    if(s == STATE_INIT) {
        $("#data-results").hide();
        $("#search-results").hide();
        $("#buttons").hide();
        $("#description").show();
        $("#authorize-button").show();
        $("#authorize-button").on('click', function(event) {
            authorizeUserImplicit(client, redirect, ['playlist-read-private']);
        });
    }

    if(s == STATE_AUTH) {
        $("#data-results").hide();
        $("#search-results").show();
        $("#buttons").show();
        $("#description").show();
        $("#authorize-button").hide();
    }

    if(s == STATE_SEARCH) {
        $("#data-results").hide();
        $("#search-results").show();
        $("#buttons").show();
        $("#description").hide();
        $("#authorize-button").hide();
    }

    if(s == STATE_SELECT) {
        $("#data-results").show();
        $("#buttons").show();
        $("#result-buttons").empty();
        $("#search-results").hide();
        $("#description").hide();
        $("#authorize-button").hide();

        $embed = $("<iframe>").attr({
            display: "block",
            "margin-bottom": 0,
            width: "30%",
            frameborder: 0,
            allowtransparency: true,
            src: "https://open.spotify.com/embed/" + args['type'] + "/" + args['id']
        });
        
        $embed.insertAfter("#result-chart2");
    }
}

$(document).ready(function() {
    args = parseArgs();

    if('access_token' in args) {
        access_token = args['access_token'];
        setAccessToken(access_token);
        setExpireTime(args['expires_in']*1000);
        setState(STATE_AUTH);
    } else {
        if(isAccessExpired())
            setState(STATE_INIT);
        else
            setState(STATE_AUTH);
    }

    if('id' in args) {
        setState(STATE_SELECT);
        if(!isAccessExpired())
            generateAverages(args['id'], args['type'], getAccessToken());
        else
            setState(STATE_INIT);
    }
});
