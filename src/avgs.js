let access_token = null;
let refresh_token = null;
let args = {};
let results = [];
let redirect = config.redirect;
let client = config.client;
let username = "";
let type = "";
let state = 0;
const STATE_INIT = 0;
const STATE_AUTH = 1;
const STATE_SEARCH = 2;
const STATE_SELECT = 3;
const STATE_RESET = 4;

/*
    STATE KEY
    0 = NO AUTH
    1 = AUTH
    2 = SEARCH RESULTS
    3 = ITEM SELECTED
    4 = AUTH ERROR, RESET
*/


function parseArgs() {
    let hash = location.hash.replace(/#/g, '');
    let ps = location.search.replace("?", "");

    // get spotify tokens and search parameters
    let params = ps.split('&');
    let tokens = hash.split('&');

    $bt.map(params, function(keyvalue) {
        let kv = keyvalue.split('=');
        let key = kv[0];
        let val = kv[1];
        if(val != '') args[key] = val;
        console.log(key, val);
    });

    $bt.map(tokens, function(keyvalue) {
        let kv = keyvalue.split('=');
        let key = kv[0];
        let val = kv[1];
        if(val != '') args[key] = val;
        console.log(key, val);
    });
    console.log(args);

    return args;
}

function processArgs() {
    if('access_token' in args) {
        setAccessToken(args['access_token']);
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
        if(!isAccessExpired()) {
            generateAverages(args['id'], args['type'], getAccessToken());
        } else {
            setState(STATE_INIT);
        }
        return;
    }

    if('q' in args) {
        setState(STATE_SEARCH);
        if(!isAccessExpired()) {
            search(args['q']);
            $bt.get("#search-query").value = args['q'];
        } else
            setState(STATE_INIT);
    }
}

function formSearch() {
    if (state === STATE_INIT)
      authorizeUserImplicit(client, redirect, ['playlist-read-private']);
    else
      window.location.href = config.redirect + "?q=" + $bt.get("#search-query").value;
}

function setState(s) {
    console.log("setting state to " + s);
    switch(s) {
        case STATE_INIT:
            $bt.get("#data-results").hidden = true;
            $bt.get("#search-results").hidden = true;
            $bt.get("#search-bar").hidden = true;
            $bt.get("#description").hidden = false;
            $bt.get("#authorize-button").hidden = false;
            $bt.get("#authorize-button").onclick = (event) => authorizeUserImplicit(client, redirect, ['playlist-read-private']);
            break;

        case STATE_AUTH:
            $bt.get("#data-results").hidden = true;
            $bt.get("#search-results").hidden = true;
            $bt.get("#search-bar").hidden = false;
            $bt.get("#description").hidden = false;
            $bt.get("#authorize-button").style.display = "none";
            break;

        case STATE_SEARCH:
            $bt.get("#data-results").hidden = true;
            $bt.get("#search-results").hidden = false;
            $bt.get("#search-bar").hidden = false;
            $bt.get("#description").hidden = true;
            $bt.get("#authorize-button").style.display = "none";
            break;

        case STATE_SELECT:
            $bt.get("#data-results").hidden = false;
            $bt.get("#search-bar").hidden = false;
            $bt.get("#result-buttons").innerHTML = "";
            $bt.get("#search-results").hidden = true;
            $bt.get("#description").hidden = true;
            $bt.get("#authorize-button").style.display = "none";

            // var $player = document.createElement("iframe");
            // $player.setAttribute('style', {
            //     "display": "block",
            //     "margin-bottom": 0,
            //     "width": "30%",
            //     "frameborder": 0,
            //     "allowtransparency": true,
            //     "src": "https://open.spotify.com/embed/" + args['type'] + "/" + args['id']
            // });
            // $bt.get("#data-results").appendChild($player);
            break;

        case STATE_RESET:
            setState(STATE_INIT);
            break;
    }
}
