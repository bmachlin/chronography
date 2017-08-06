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
    searchSpotifyOptions(query, 'album', 20, offset, function(r) {
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
            displaySearch(r.only_albums, 'album', query, offset);
        }
    });
}

function getArtists(query, offset=0) {
    searchSpotifyOptions(query, 'artist', 20, offset, function(r) {
        if(r == null) {
            //error
        } else {
            console.log(r);
            displaySearch(r.artists.items, 'artist');
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

function displaySearch(sArray, type, query, offset) {
    console.log("displaySearch");
    
    var $more = $('<input/>').attr({
        type: 'button',
        id: "moreBtn",
        value: "Load more..."
    });
    
    if(type === 'album') {
        for(var i = 0; i < sArray.length; i++) {
            addResultButton(sArray[i].displayName, sArray[i].id);
        }        
        $more.on('click', function(event) {
            $($more.id).remove();
            getAlbums(query, offset+20);
        });
    } else {
        for(var i = 0; i < sArray.length; i++) {
            addResultButton(sArray[i].name, sArray[i].id);
        }
        $more.on('click', function(event) {
            getArtists(query, offset+20);
        });
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