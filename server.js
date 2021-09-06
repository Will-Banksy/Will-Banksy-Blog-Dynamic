// First, we should probably build the site
const { exec } = require('child_process');
// This will run the command to build the site
exec("node Stagenx.js parts/blog.json output .")

// Import express js
var express = require("express");

// Create an express application
var app = express();

// Serve the output directory statically
app.use(express.static("output"));

const listener = app.listen(process.env.PORT, () => {
	console.log("Listening on port " + listener.address().port);
});

// TODO https://www.tutorialspoint.com/expressjs/expressjs_url_building.htm