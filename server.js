// First, we should probably build the site. I'm not sure about this tbh
const { exec } = require('child_process');
// This will run the command to build the site
exec("node Stagenx.js parts/blog.json output .")

// Import express js
const express = require("express");

// Import js-sha256
const sha256 = require('js-sha256');

// Import formidable (parser for multipart form data)
const formidable = require("formidable");

// Import fs for interacting with the filesystem
const fs = require("fs");

// Import luxon
const { DateTime } = require("luxon");

// Create an express application
let app = express();

// Use builtin json middleware
app.use(express.json());

// Serve the output directory statically
app.use(express.static("output"));

app.post("/admin/create-post", function(request, response) {
	new formidable.IncomingForm().parse(request, (err, fields, files) => {
		if(err) {
			console.log("[ERROR]: Error parsing form data (/admin/create-post)");
			throw err;
		}

		console.log(fields);
		console.log(files);

		let isAdmin = false;
		let auth = fields.password;
		if(auth !== undefined) {
			let passHash = sha256(auth);
			console.log("[Login Attempt]: pass=" + auth + ", hash=" + passHash);
			if(passHash === process.env.ADMIN_KEY) {
				isAdmin = true;
			}
		}

		if(!isAdmin) {
			// Send an unauthorized error code, with WWW-Authenticate header (which apparently you need to do)
			response.set('WWW-Authenticate: Basic realm="Create posts"');
			response.status(401).send("[ERROR]: Action requires admin");
		}

		// Asynchronously read the posts.json file
		fs.readFile("parts/posts.json", (err, data) => {
			if(err) {
				console.log(`[ERROR]: Error reading file from disk: ${err}`);
				throw err;
			} else {
				// Parse the data as json
				let posts = JSON.parse(data);

				// Get the current date and time and format it
				let now = DateTime.now();
				let dateTimeString = now.toFormat("dd MMMM yyyy - hh:mm a"); // Almost like Qt!

				// Empty strings are 'falsy' apparently (they evaluate to false)
				let thumbnailFilename = fields.postfilename.substring(0, fields.postfilename.lastIndexOf('.')) || fields.postfilename;
				let thumbnailFileExt = "";
				if(files.postthumbnail.type == "image/png") {
					thumbnailFileExt = ".png";
				} else if(files.postthumbnail.type == "image/jpeg") {
					thumbnailFileExt = ".jpg";
				} else if(files.postthumbnail.type == "image/gif") {
					thumbnailFileExt = ".gif";
				}
				thumbnailFilename += thumbnailFileExt;

				// Add another post
				posts.push({
					title: fields.posttitle,
					description: fields.postdescription,
					date: dateTimeString,
					thumbnail: `/assets/thumbnails/${thumbnailFilename}`,
					content: `@parts/posts/${fields.postfilename}`,
					filename: `posts/${fields.postfilename}`
				});

				let postsStr = JSON.stringify(posts, null, 4); // Pretty print the json

				// Asynchronously write the posts json to post parts/posts.json
				fs.writeFile("parts/posts.json", postsStr, "utf8", (err) => {
					if(err) {
						console.log(`[ERROR]: Unable to write posts json: ${err}`);
						throw err;
					}
				});

				// Asynchronously write the post content to post filename, in parts/posts
				fs.writeFile(`parts/posts/${fields.postfilename}`, fields.postcontent, "utf8", (err) => {
					if(err) {
						console.log(`[ERROR]: Unable to write post content: ${err}`);
						throw err;
					}
				});

				// Asynchronously copy the post thumbnail from the temporary directory it was saved to by formidable to parts/assets/thumbnails
				fs.copyFile(files.postthumbnail.path, `parts/assets/thumbnails/${thumbnailFilename}`, (err) => {
					if(err) {
						console.log(`[ERROR]: Unable to copy file: ${err}`);
						throw err;
					}
				});

				console.log("[INFO]: Successfully added post");
				exec("node Stagenx.js parts/blog.json output .")
				response.send("Successfully added post");
			}
		});
	});
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

// Listen on a port (PORT environment variable)
const listener = app.listen(process.env.PORT, () => {
	console.log("Listening on port " + listener.address().port);
});