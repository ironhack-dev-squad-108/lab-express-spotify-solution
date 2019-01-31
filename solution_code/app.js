const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

console.log('The number is', require('./secret').number)

const { city } = require('./secret')
// const city = require('./secret').city // same line as before
console.log('The city is', city)

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


// setting the spotify-api goes here:
var spotifyApi = new SpotifyWebApi({
  clientId: 'b79b10bd0d1d44d3a5acc36879f307e2',
  clientSecret: '9fe44eb5be014f278d6f5106738865e1',
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant()
  .then( data => {
    spotifyApi.setAccessToken(data.body['access_token']);
  })
  .catch(error => {
    console.log('Something went wrong when retrieving an access token', error);
  })


// the routes go here:
app.get('/', (req,res) => {
  res.render('index') // => render the view index.hbs
})

app.get('/artists', (req,res) => {
  // // Option 1
  // let data = {
  //   search: req.query.search
  // }
  // res.render('artists', data)

  // // Option 2
  // res.locals.search = req.query.search
	// console.log('TCL: res.locals', res.locals)
  // res.render('artists')


  spotifyApi.searchArtists(req.query.search)
    .then(data => {
      console.log("The received data", data.body.artists.items);
      res.render('artists', {
        search: req.query.search,
        artists: data.body.artists.items,
        JSON: JSON.stringify(data.body.artists.items,null,2) // nice for debugging
      })
    })
    .catch(err => {
      console.log("The error while searching artists occurred: ", err);
    })
})

app.get('/albums/:artistId', (req,res)=> {
  // req.params.artistId is the value in the URL
  spotifyApi.getArtistAlbums(req.params.artistId)
    .then(data => {
      res.render('albums', {
        albums: data.body.items
      })
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: 'Sorry, an error happened. Check your URL...'
      })
    }) 
})

app.get('/tracks/:albumId', (req,res)=> {
  spotifyApi.getAlbumTracks(req.params.albumId)
    .then(data => {
      res.render('tracks', {
        tracks: data.body.items
      })
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: 'Sorry, an error happened. Check your URL...'
      })
    }) 
})

app.listen(3000, () => console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊"));
