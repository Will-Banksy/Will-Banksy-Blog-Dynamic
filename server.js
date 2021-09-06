// First, we should probably build the site. I'm not sure about this tbh
const { exec } = require('child_process');
// This will run the command to build the site
exec("node Stagenx.js parts/blog.json output .")

// Import express js
let express = require("express");

// Import js-sha256
let sha256 = require('js-sha256');

// Create an express application
let app = express();

// Use builtin json middleware
app.use(express.json());

// Serve the output directory statically
app.use(express.static("output"));

app.post("/admin/make-post", function(request, response) {
	let isAdmin = false;
	let auth = request.header("Authorization");
	if(auth !== undefined) {
		let passHash = sha256(auth);
		console.log("[Login Attempt]: pass=" + auth + ", hash=" + passHash);
		if(passHash === process.env.ADMIN_KEY) {
			isAdmin = true;
		}
	}

	if(isAdmin) {
		response.send("Hello *Admin*! Function is not yet available I am most afraid. My sincerest apologies for the inconvenience.")
	} else {
		// Send an unauthorized error code, with WWW-Authenticate header (which apparently you need to do)
		response.set('WWW-Authenticate: Basic realm="Create posts"');
		response.status(401).send("[ERROR]: Action requires admin");
	}
});

app.post("/admin/export", function(request, response) {
	let isAdmin = false;
	let auth = request.header("Authorization");
	if(auth !== undefined) {
		let passHash = sha256(auth);
		console.log("[Login Attempt]: pass=" + auth + ", hash=" + passHash);
		if(passHash === process.env.ADMIN_KEY) {
			isAdmin = true;
		}
	}

	if(isAdmin) {
		// Export to glitch branch on github. Captured request from clicking "Export to GitHub" button
		exec("curl 'https://api.glitch.com/project/githubExport?projectId=8985f063-d158-49b5-809b-df1e680346fc&repo=Will-Banksy%2FWill-Banksy-Blog-Dynamic&commitMessage=Export+From+Glitch' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0' -H 'Accept: */*' -H 'Accept-Language: en-GB,en;q=0.5' --compressed -H 'Referer: https://glitch.com/' -H 'Authorization: 07ef9923-1761-4a85-ab8e-904efe903712' -H 'Origin: https://glitch.com' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw ''")
		response.send("Exporting to github...");
	} else {
		// Send an unauthorized error code, with WWW-Authenticate header (which apparently you need to do)
		response.set('WWW-Authenticate: Basic realm="Export to github"');
		response.status(401).send("[ERROR]: Action requires admin");
	}
});

// Listen on a port
const listener = app.listen(process.env.PORT, () => {
	console.log("Listening on port " + listener.address().port);
});