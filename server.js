const path = require('path');
const express = require('express');

const app = express();
// const DIST_DIR = path.join(__dirname, '/dist');
// const HTML_FILE = path.join(DIST_DIR, 'index.html');

app.set( 'port', ( process.env.PORT || 5000 ));

// Start node server
app.listen( app.get( 'port' ), function() {
  console.log( 'Node server is running on port ' + app.get( 'port' ));
  });

app.use(express.static('index-page'));
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// const PORT = process.env.PORT || 8080;

// app.listen(PORT, () => {

// });