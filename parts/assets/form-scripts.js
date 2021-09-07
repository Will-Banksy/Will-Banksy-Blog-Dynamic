function Qs(query, perElementCallback) {
	if(perElementCallback) {
		let elems = document.querySelectorAll(query);
		for (let i = elems.length - 1; i >= 0; i--) {
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

// This function will use all predefinied ids
// function SubmitPost() {
// 	// TODO Consider doing the time server-side instead of client-side
// 	let DateTime = luxon.DateTime;

// 	let now = DateTime.now();
// 	let dateTimeString = now.toFormat("dd MMMM yyyy - hh:mm a"); // I can do it (almost) exactly the same as it'd be in Qt. Not bad.

// 	let postData = {
// 		title: Qs("#admin-create-post-posttitle")[0].value,
// 		description: Qs("#admin-create-post-postdescription")[0].value,
// 		date: dateTimeString,
// 		thumbnail:
// 	};
// }