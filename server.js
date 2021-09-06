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
	response.send("Hello! Sorry function currently unavailable. Shall export to github anyways")

	// Export to glitch branch on github. Captured request from clicking "Export to GitHub" button
	exec("curl 'https://api.glitch.com/project/githubExport?projectId=8985f063-d158-49b5-809b-df1e680346fc&repo=Will-Banksy%2FWill-Banksy-Blog-Dynamic&commitMessage=Export+From+Glitch' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0' -H 'Accept: */*' -H 'Accept-Language: en-GB,en;q=0.5' --compressed -H 'Referer: https://glitch.com/' -H 'Authorization: 07ef9923-1761-4a85-ab8e-904efe903712' -H 'Origin: https://glitch.com' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw ''")
});

// Listen on a port
const listener = app.listen(process.env.PORT, () => {
	console.log("Listening on port " + listener.address().port);
});