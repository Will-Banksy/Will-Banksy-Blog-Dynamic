// First, we should probably build the site. I'm not sure about this tbh
const { exec } = require('child_process');
// This will run the command to build the site
exec("node Stagenx.js parts/blog.json output .")

// Import express js
const express = require("express");

// Import the router for handling admin stuff
const adminRouter = require("./admin-handler.js")

// Create an express application
let app = express();

// Use builtin json middleware
app.use(express.json());

// Serve the output directory statically
app.use(express.static("output"));

// Use the admin router
app.use("/admin", adminRouter);

// Listen on a port (PORT environment variable)
const listener = app.listen(process.env.PORT, () => {
	console.log("Listening on port " + listener.address().port);
});