function Qs(query, perElementCallback) {
	if(perElementCallback) {
		let elems = document.querySelectorAll(query);
		for (let i = 0; i < elems.length; i++) {
			perElementCallback(elems[i]);
		}
		return elems;
	} else {
		return document.querySelectorAll(query);
	}
}

Qs("textarea", (elem) => {
	// Add an event listener for keydown for each textarea
	elem.addEventListener("keydown", function(event) {
		// Default behaviour if holding shift or AltGraph
		if(event.key == "Tab" && !event.shiftKey && !event.getModifierState("AltGraph")) {
			// Prevent default behaviour
			event.preventDefault();
			let start = this.selectionStart;
			let end = this.selectionEnd;

			// Set textarea value to: text before caret + tab + text after caret
			this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

			// Put caret in correct position
			this.selectionStart = this.selectionEnd = start + 1
		}
	});
});

function ToggleVisibility(query) {
	Qs(query, (elem) => {
		if(elem.style.display === "none") {
			elem.style.display = "block";
		} else {
			elem.style.display = "none";
		}
	});
}

Qs('input[type="file"]', (elem) => {
	const callback = (event) => { /* Declare and initialise callback for use in event listener. This allows us to call it beforehand */
		let filesStr = "";
		for (let i = 0; i < elem.files.length; i++) {
			filesStr += elem.files[i].name;
			if(i < elem.files.length - 1) {
				filesStr += "; ";
			}
		}
		if(!filesStr) {
			filesStr = "Select File"
			if(elem.attributes.multiple) {
				filesStr = "Select File(s)"
			}
		} else {
			if(elem.attributes.multiple) {
				filesStr = "Select File(s): " + filesStr;
			} else {
				filesStr = "Select File: " + filesStr;
			}
		}

		// Find the file input content element. It will be in the div straight after the file input element
		let inputContentElem = null;
		elem.nextElementSibling.childNodes.forEach((child) => {
			console.log(child);
			if(!child.classList || inputContentElem) { // If classList is undefined or inputContentElem is truthy
				return;
			}

			child.classList.forEach((childClass) => {
				if(childClass === "form-file-input-content") {
					inputContentElem = child;
					return;
				}
			});
		});

		if(inputContentElem) {
			inputContentElem.innerHTML = filesStr;
		}
	}
	callback(); /* Call it immediately, because a file might already be selected */
	elem.addEventListener("change", callback);
});

async function PostData(url, formData, adminPasswd) {
	// Wait for fetch to resolve
	let response = await fetch(url, {
		method: "POST",
		headers: {
			"Authorization": `admin:${adminPasswd}` // This is the Basic way of doing authorisation - uname:pass in Authorization header. Except, I think it *should* be encoded in base64. However, I shan't do so
		},
		body: formData
	});
	return response; // Return a promise that resolves with response (async)
}

Qs("#admin-create-post-form")[0].addEventListener("submit", (event) => {
	event.preventDefault(); // Prevent default behaviour

	// Create a FormData instance
	let formData = new FormData();

	// Add all the data (key-value pairs) to the FormData
	formData.append("posttitle", Qs("#admin-create-post-posttitle")[0].value);
	formData.append("postdescription", Qs("#admin-create-post-postdescription")[0].value);
	formData.append("postcontent", Qs("#admin-create-post-postcontent")[0].value);
	formData.append("postfilename", Qs("#admin-create-post-postfilename")[0].value);

	// The values for keys can be files (File objects)
	formData.append("postthumbnail", Qs("#admin-create-post-postthumbnail")[0].files[0]);

	// Now post the data. This is an async function so returns a promise
	PostData(window.origin + "/admin/create-post", formData, Qs("#admin-create-post-password")[0].value)
		.then((response) => { // When promise from PostData resolves, take the output
			return response.text(); // And return a promise that resolves with the response body as text
		})
		.then((data) => { // When that promise resolves, log the result to the console
			console.log(data);
			alert(data); // Should probably provide a nicer way of telling the user the result
		});
});

Qs("#admin-upload-assets-form")[0].addEventListener("submit", (event) => {
	event.preventDefault();

	// FormData instance
	let formData = new FormData();

	// Get all the asset files - Simple assignment
	let assetFiles = Qs("#admin-upload-assets-assetsfiles")[0].files;

	// Add all the asset files into the FormData
	for(let i = 0; i < assetFiles.length; i++) {
		formData.append("assetsfiles", assetFiles[i]);
	}

	// Now post the data. This is an async function so returns a promise
	PostData(window.origin + "/admin/upload-assets", formData, Qs("#admin-upload-assets-password")[0].value)
		.then((response) => { // When promise from PostData resolves, take the output
			return response.text(); // And return a promise that resolves with the response body as text
		})
		.then((data) => { // When that promise resolves, log the result to the console
			console.log(data);
			alert(data); // Should probably provide a nicer way of telling the user the result
		});
});