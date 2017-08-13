var resultArray = [];
var queryLimit = 40;
var resultIndex = 0;
var RESULT_THRESHOLD = 10;

function getPlaylists(limit, offset) {
    return fetchCurrentUserPlaylists(function(r) {
        getPlaylistsNext(r);
    });
}

function getPlaylistsNext(data) {
    if(data == null || data.items.length == 0) {
            //error
    } else {
        if(data.next) {
            callSpotify(data.next, {}, function(r) {
                getPlaylistsNext(r);
            });
        }
        displayPlaylists(data.items);
    }
}

function getAlbums(query, offset=0) {
    searchSpotifyOptions(query, 'album', queryLimit, offset, function(r) {
        if(r == null) {
            //error
        } else {
            r.only_albums = [];
            var iter = 0;
            console.log(r);
            for (var i = 0; i < r.albums.items.length; i++) {
                if(r.albums.items[i].album_type === "album") {
                    console.log(r.albums.items[i].name + " - " + r.albums.items[i].artists[0].name);
                    r.only_albums[iter] = r.albums.items[i];
                    r.only_albums[iter].displayName = r.albums.items[i].name + ' - ' + r.albums.items[i].artists[0].name;
                    iter++;
                }
            }
            console.log(r.only_albums);
            processSearch(r.only_albums, 'album', query, offset);
        }
    });
}

function getArtists(query, offset=0) {
    searchSpotifyOptions(query, 'artist', queryLimit, offset, function(r) {
        if(r == null) {
            //error
        } else {
            console.log(r);
            processSearch(r.artists.items, 'artist', query, offset);
        }
    });
}


function displayPlaylists(pArray) {
    console.log("displayPlaylists");

    for(var i = 0; i < pArray.length; i++) {
        if(pArray[i].owner.id == username)
            addResultButton(pArray[i].name, pArray[i].id);
    }

    $("#result-type").attr("value", 'playlist');

}

function processSearch(sArray, type, query, offset) {
    console.log("processSearch");
    
    var $more = $('<input/>').attr({
        type: 'button',
        id: "moreBtn",
        value: "Load more..."
    });
    
    if(type === 'album') {
        for(var i = 0; i < sArray.length; i++) {
            sArray[i].name = sArray[i].displayName;
            resultArray[resultArray.length] = sArray[i];
        }        
        $more.on('click', function(event) {
            $($more.id).remove();
            getAlbums(query, offset+queryLimit);
        });
    } else {
        for(var i = 0; i < sArray.length; i++) {
            resultArray[resultArray.length] = sArray[i];
        }
        $more.on('click', function(event) {
            getArtists(query, offset+queryLimit);
        });
    }

    if(resultArray.length < RESULT_THRESHOLD) {
        if(type == 'album')
            getAlbums(query, offset+queryLimit);
        else
            getArtists(query, offset+queryLimit);
        return;
    }
    var resultLimit = resultIndex+RESULT_THRESHOLD;
    for(; resultIndex < resultLimit; resultIndex++) {
        addResultButton(resultArray[resultIndex].name, resultArray[resultIndex].id);    
    }

    $("#result-buttons").append($more);
    $("#result-buttons").append("<br>");

    $("#result-type").attr("value", type);
}

function addResultButton(name, id) {
    console.log(name, id);

    var $result = $('<input/>').attr({
        type: 'submit',
        id: id,
        value: name
    });

    $result.on('click', function(event) {
        $('#result-id').attr('value', id);
        $('#result-name').attr('value', encodeURIComponent(name));
    });

    $("#result-buttons").append($result);
    $("#result-buttons").append("<br>");
}