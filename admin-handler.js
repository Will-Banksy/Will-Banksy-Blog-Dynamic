// Import express
let express = require("express");

// Import js-sha256
const sha256 = require('js-sha256');

// Import formidable (parser for multipart form data)
const formidable = require("formidable");

// Import fs for interacting with the filesystem. We'll use the promises API (instead of the callback API)
const fs = require("fs/promises");

// Import luxon
const { DateTime } = require("luxon");

// Import child process. This will allow running of commands from node
const { exec } = require('child_process');

// Create a router
let router = express.Router();

// Handle creating posts
router.post("/create-post", (request, response, next) => {
	let form = formidable(); // Formidable instance

	form.parse(request, (err, fields, files) => { // Parse the request. Also provide a callback to be called once done.
		if(err) { // If there was an error, get express to handle it (with next(err)) but also print a message
			console.log(`[ERROR]: Error parsing request data: ${err}`);
			next(err);
			return;
		}

		// Check if we are the admin
		let isAdmin = false;
		let auth = request.header("Authorization");
		let passHash = sha256(auth);
		console.log("[Login Attempt]: pass=" + auth + ", hash=" + passHash);
		if(passHash === process.env.ADMIN_KEY) {
			isAdmin = true;
		}

		// If not admin, politely refuse to do anything by sending a 401 (Unauthorised) response
		if(!isAdmin) {
			// Send an unauthorized error code, with WWW-Authenticate header (which apparently you need to do)
			response.set("WWW-Authenticate", 'Basic realm="Create posts"');
			response.status(401).send("[ERROR]: Action requires admin");
			return;
		}

		fs.readFile("parts/posts.json") // Returns a promise - Resolves with file contents
		.then((fileData) => {
			let posts = JSON.parse(fileData); // Parse the json string into a js object

			// Get our date time string for the current time
			let now = DateTime.now();
			let dateTimeString = now.toFormat("dd MMMM yyyy - hh:mm a"); // Almost like Qt!

			// Get the thumbnail filename to use. This is simply the base name of the post filename, and the extension of the uploaded filename
			let thumbnailFileExt = files.postthumbnail.name.substring(files.postthumbnail.name.lastIndexOf(".")); // Get the file extension of the filename
			let thumbnailFilename = fields.postfilename.substring(0, fields.postfilename.lastIndexOf('.')) || fields.postfilename; // Take the post filename and remove the file extension if it has one
			thumbnailFilename += thumbnailFileExt; // Add the extension

			// Add another post with the data we've got
			posts.push({
				title: fields.posttitle,
				description: fields.postdescription,
				date: dateTimeString,
				thumbnail: `/assets/thumbnails/${thumbnailFilename}`,
				content: `@parts/posts/${fields.postfilename}`,
				filename: `posts/${fields.postfilename}`
			});

			let postsStr = JSON.stringify(posts, null, "\t"); // Pretty JSON, indented with tabs. The null is for no filter

			// Create an array of promises for the fs operations
			let fsPromises = [
				fs.writeFile("parts/posts.json", postsStr),
				fs.writeFile(`parts/posts/${fields.postfilename}`, fields.postcontent),
				fs.copyFile(files.postthumbnail.path, `parts/assets/thumbnails/${thumbnailFilename}`)
			];

			// Resolve all the fs promises concurrently
			Promise.all(fsPromises).then(() => {
				// When they have all resolved, send a response
				console.log("[INFO]: Successfully added post"); // Log message
				exec("node Stagenx.js parts/blog.json output ."); // Invoke Stagenx to build the new stuff into the website
				response.status(201).send("Successfully added post"); // Status code: 201 Created
			}).catch((err) => {
				console.log(`[ERROR]: FileSystem operation error: ${err}`);
				next(err);
				return;
			});
		})
		.catch((err) => {
			console.log(`[ERROR]: ${err}`);
			next(err);
			return;
		});
	});
});

router.post("/upload-assets", (request, response, next) => {
	let form = formidable({ multiples: true }); // Allow multiple files. Needed here

	form.parse(request, (err, fields, files) => { // Parse the request. Also provide a callback to be called once done.
		if(err) { // If there was an error, get express to handle it (with next(err)) but also print a message
			console.log(`[ERROR]: Error parsing request data: ${err}`);
			next(err);
			return;
		}

		// Check if we are the admin
		let isAdmin = false;
		let auth = request.header("Authorization");
		let passHash = sha256(auth);
		console.log("[Login Attempt]: pass=" + auth + ", hash=" + passHash);
		if(passHash === process.env.ADMIN_KEY) {
			isAdmin = true;
		}

		// If not admin, politely refuse to do anything by sending a 401 (Unauthorised) response
		if(!isAdmin) {
			// Send an unauthorized error code, with WWW-Authenticate header (which apparently you need to do)
			response.set("WWW-Authenticate", 'Basic realm="Create posts"');
			response.status(401).send("[ERROR]: Action requires admin");
			return;
		}

		// Make a list of promises for each asset file that needs copied
		let fsPromises = [];
		files.assetsfiles.forEach((file) => {
			fsPromises.push(fs.copyFile(file.path, `parts/assets/${file.name}`));
		});

		// Resolve all the fs promises concurrently
		Promise.all(fsPromises).then(() => {
			// When they have all resolved, send a response
			console.log("[INFO]: Successfully uploaded assets"); // Log message
			exec("node Stagenx.js parts/blog.json output ."); // Invoke Stagenx to build the new stuff into the website
			response.status(201).send("Successfully uploaded assets"); // Status code: 201 Created
		}).catch((err) => {
			console.log(`[ERROR]: FileSystem operation error: ${err}`);
			next(err);
			return;
		});
	});
});

// app.post("/export", function(request, response) {
// 	let isAdmin = false;
// 	let auth = request.header("Authorization");
// 	if(auth !== undefined) {
// 		let passHash = sha256(auth);
// 		console.log("[Login Attempt]: pass=" + auth + ", hash=" + passHash);
// 		if(passHash === process.env.ADMIN_KEY) {
// 			isAdmin = true;
// 		}
// 	}

// 	if(isAdmin) {
// 		// Export to glitch branch on github. Captured request from clicking "Export to GitHub" button
// 		exec("curl 'https://api.glitch.com/project/githubExport?projectId=8985f063-d158-49b5-809b-df1e680346fc&repo=Will-Banksy%2FWill-Banksy-Blog-Dynamic&commitMessage=Export+From+Glitch' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0' -H 'Accept: */*' -H 'Accept-Language: en-GB,en;q=0.5' --compressed -H 'Referer: https://glitch.com/' -H 'Authorization: 07ef9923-1761-4a85-ab8e-904efe903712' -H 'Origin: https://glitch.com' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' --data-raw ''")
// 		response.send("Exporting to github...");
// 	} else {
// 		// Send an unauthorized error code, with WWW-Authenticate header (which apparently you need to do)
// 		response.set('WWW-Authenticate: Basic realm="Export to github"');
// 		response.status(401).send("[ERROR]: Action requires admin");
// 	}
// });

// Export the router
module.exports = router;