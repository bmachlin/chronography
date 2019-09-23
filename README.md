# chronography
Git for a Spotify powered artist visualization tool

## It's a work in progress
I've had a pretty busy schedule and development is in batches. I have lots of ideas and visions for what this can be, but it will take a while to make happen.

### Ideas
- song page shows all song attributes (a la https://musicaldata.com/)
  - display Spotify player for song, link to its album/other songs in album
- album page shows interactive graph plotting tracks vs. attributes (multi-line chart)
  - ability to filter in/out as many attributes as possible, and possibly download chart as image
  - clicking track takes you to song page
  - display Spotify player for album, link to artist
- artist page shows interactive graph plotting albums (or year) vs. attributes (multi-line chart, album values are averages of the tracks on the album)
  - ability to exclude singles, eps, or even specific albums
  - clicking album takes you to album page
  - display Spotify player for artist top songs, links to related artists
- playlist page shows interactive graph plotting tracks vs. attributes (multi-line chart)
  - click on playlist owner to view other playlists?

- cleaner search page, more mobile friendly
  - ability to search for own playlists/saved songs/albums
  - more search options
    - type: song, single, ep, album, artist, playlist
    - search term: Regex, quotes, negation '-'
    - user
    - mimic spotify search to an extent
     
- check security, esp. in url parameters
- more responsive (for mobile visitors)
- cleaner UI, maybe new color palette -> maybe colors match album cover colors (option)
