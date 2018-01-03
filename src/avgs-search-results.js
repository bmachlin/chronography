let resultArray = [];
let queryLimit = 10;
let resultIndex = 0;
let RESULT_THRESHOLD = 10;
let loadedMoreCount = 0;
let includeSingles = true;

function search(query) {
    getAlbums(query);
    getArtists(query);
    getPlaylists(query);
}

function getUserPlaylists(limit, offset) {
    return fetchCurrentUserPlaylists(function(r) {
        getUserPlaylistsNext(r);
    });
}

function getUserPlaylistsNext(data) {
    if(data == null || data.items.length == 0) {
        //error
    } else {
        if(data.next) {
            callSpotify(data.next, {}, function(r) {
                getUserPlaylistsNext(r);
            });
        }
        displayUserPlaylists(data.items, data.images[0]);
    }
}

function displayUserPlaylists(pArray, pic) {
    console.log("displayPlaylists");

    for(let i = 0; i < pArray.length; i++) {
        if(pArray[i].owner.id == username)
            addResult(pArray[i].name, pArray[i].id, "playlist", pic);
    }
}

function getAlbums(query, offset=0) {
    let options = {
        type: 'album',
        limit: queryLimit,
        offset: offset
    };
    searchSpotify(query, options, function(r) {
        if(r == null) {
            //error
            console.log("search error");
        } else {
            console.log(r);
            if(r.status == 401) {
                //unauthorized
                setState(STATE_INIT);
                return;
            }
            r.filtered_albums = [];
            r.filtered_pics = [];
            let albumIndex = 0;
            for (let i = 0; i < r.albums.items.length; i++) {
                if(r.albums.items[i].album_type === "album" || includeSingles) {
                    r.filtered_albums[albumIndex] = r.albums.items[i];
                    r.filtered_albums[albumIndex].displayName = r.albums.items[i].name + ' - ' + r.albums.items[i].artists[0].name;
                    r.filtered_albums[albumIndex].images = r.albums.items[i].images;
                    if(includeSingles)
                        r.filtered_albums[albumIndex].displayName += " (" + r.albums.items[i].album_type + ")";
                    albumIndex++;
                }
            }
            processSearch(r.filtered_albums, query, options);
        }
    });
}

function getArtists(query, offset=0) {
    let options = {
        type: 'artist',
        limit: queryLimit,
        offset: offset
    };
    searchSpotify(query, options, function(r) {
        if(r == null) {
            //error
            console.log("search error");
        } else {
            if(r.status == 401) {
                //unauthorized
                setState(STATE_INIT);
                return;
            }
            processSearch(r.artists.items, query, options);
        }
    });
}

function getPlaylists(query, offset=0) {
    let options = {
        type: 'playlist',
        limit: queryLimit,
        offset: offset
    };
    searchSpotify(query, options, function(r) {
        if(r == null) {
            //error
            console.log("search error");
        } else {
            if(r.status == 401) {
                //unauthorized
                setState(STATE_INIT);
                return;
            }
            console.log(r);
            for (let i = 0; i < r.playlists.items.length; i++) {
                r.playlists.items[i].displayName = r.playlists.items[i].name;
                if(r.playlists.items[i].owner.display_name != null)
                    r.playlists.items[i].displayName += " - " + r.playlists.items[i].owner.display_name;
                else
                    r.playlists.items[i].displayName += " - " + r.playlists.items[i].owner.id;
            }
            processSearch(r.playlists.items, query, options);
        }
    });
}

function processSearch(sArray, query, options, pics) {
    console.log("processSearch");
    
    let $more = $('<div/>').attr({
        class: "butt result-button",
        id: "moreBtn" + loadedMoreCount++
    });
    $more.text("Load more...");
    $resultList = $("#" + options.type + "-buttons");

    if(options.type === 'album') {
        for(let i = 0; i < sArray.length; i++) {
            sArray[i].name = sArray[i].displayName;
            resultArray[resultArray.length] = sArray[i];
            console.log(resultArray[resultArray.length-1].name);
        }
        $more.on('click', function(event) {
            // $resultList.append("Page " + (loadedMoreCount+1));           
            document.getElementById(this.id).remove();
            getAlbums(query, options.offset+queryLimit);
        });
    } else if(options.type === 'artist') {
        for(let i = 0; i < sArray.length; i++) {
            resultArray[resultArray.length] = sArray[i];
        }
        $more.on('click', function(event) {
            // $resultList.append("Page " + (loadedMoreCount+1));
            document.getElementById(this.id).remove();      
            getArtists(query, options.offset+queryLimit);
        });
    } else if(options.type === 'playlist') {
        for(let i = 0; i < sArray.length; i++) {
            sArray[i].name = sArray[i].displayName;
            resultArray[resultArray.length] = sArray[i];
        }
        $more.on('click', function(event) {
            // $resultList.append("Page " + (loadedMoreCount+1));
            document.getElementById(this.id).remove();      
            getPlaylists(query, options.offset+queryLimit);
        }); 
    }

    let resultLimit = resultIndex+RESULT_THRESHOLD;
    console.log("result limit: " + resultLimit);
    for(; resultIndex < resultLimit && resultIndex < resultArray.length; resultIndex++) {
        addResult(resultArray[resultIndex].name, resultArray[resultIndex].id, options.type, resultArray[resultIndex].images[0]);    
    }

    $resultList.append($more);
}

function addResult(name, id, type, pic) {

    let $result = $('<div/>').attr({
        class: "butt result-button",
        id: id
    });
    let size = 2;
    if(name.length < 30) {
        size = 2;
    } else if(name.length < 50) {
        size = 1.5;
    } else if(name.length < 70) {
        size = 1;
    } else {
        size = 0.75;
    }
    $resultName = $("<p>").attr({
        "font-size": "" + size + "vw",
        "padding-left": 10
    });
    $resultName.text(name);
    
    $result.on('click', function(event) {
        window.location.href = config.redirect + "?id=" + id + "&type=" + type;
    });
    
    if(pic != null) {
        let $resultPic = $("<img>").attr({
            src: pic.url,
            "margin-left": 10
        });
        $resultName.prepend($resultPic);
    }
    
    $result.append($resultName);
    $("#" + type + "-buttons").append($result);

}