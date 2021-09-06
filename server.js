// First, we should probably build the site. I'm not sure about this tbh
const { exec } = require('child_process');
// This will run the command to build the site
exec("node Stagenx.js parts/blog.json output .")

// Import express js
var express = require("express");

// Create an express application
var app = express();

// Serve the output directory statically
app.use(express.static("output"));

app.post("/make-post", function(request, response) {
	response.send("Hello! Sorry function currently unavailable")
});

// Listen on a port
const listener = app.listen(process.env.PORT, () => {
	console.log("Listening on port " + listener.address().port);
});