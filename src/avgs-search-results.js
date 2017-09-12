var resultArray = [];
var queryLimit = 10;
var resultIndex = 0;
var RESULT_THRESHOLD = 10;
var loadedMoreCount = 0;

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
    var options = {
        type: 'album',
        limit: queryLimit,
        offset: offset
    };
    searchSpotify(query, options, function(r) {
        if(r == null) {
            //error
        } else {
            r.only_albums = [];
            var albumIndex = 0;
            for (var i = 0; i < r.albums.items.length; i++) {
                if(r.albums.items[i].album_type === "album") {
                    r.only_albums[albumIndex] = r.albums.items[i];
                    r.only_albums[albumIndex].displayName = r.albums.items[i].name + ' - ' + r.albums.items[i].artists[0].name;
                    albumIndex++;
                }
            }
            processSearch(r.only_albums, query, options);
        }
    });
}

function getArtists(query, offset=0) {
    var options = {
        type: 'artist',
        limit: queryLimit,
        offset: offset
    };
    searchSpotify(query, options, function(data) {
        if(data == null) {
            //error
        } else {
            // console.log(data);
            processSearch(data.artists.items, query, options);
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

function processSearch(sArray, query, options) {
    console.log("processSearch");
    
    var $more = $('<input/>').attr({
        type: 'button',
        id: "moreBtn" + loadedMoreCount++,
        value: "Load more..."
    });
    
    if(options.type === 'album') {
        for(var i = 0; i < sArray.length; i++) {
            sArray[i].name = sArray[i].displayName;
            resultArray[resultArray.length] = sArray[i];
            console.log(resultArray[resultArray.length-1].name);
        }        
        $more.on('click', function(event) {
            document.getElementById(this.id).remove();
            getAlbums(query, options.offset+queryLimit);
        });
    } else {
        for(var i = 0; i < sArray.length; i++) {
            resultArray[resultArray.length] = sArray[i];
        }
        $more.on('click', function(event) {
            document.getElementById(this.id).remove();            
            getArtists(query, options.offset+queryLimit);
        });
    }

    if(resultArray.length < RESULT_THRESHOLD) {
        console.log("Recursing...");
        if(options.type == 'album')
            getAlbums(query, options.offset+queryLimit);
        else
            getArtists(query, options.offset+queryLimit);
        return;
    }
    var resultLimit = resultIndex+RESULT_THRESHOLD;
    console.log("result limit: " + resultLimit);
    for(; resultIndex < resultLimit && resultIndex < resultArray.length; resultIndex++) {
        addResultButton(resultArray[resultIndex].name, resultArray[resultIndex].id);    
    }

    $("#result-buttons").append($more);
    $("#result-buttons").append("<br>");

    $("#result-type").attr("value", options.type);
}

function addResultButton(name, id) {
    // console.log(name, id);

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