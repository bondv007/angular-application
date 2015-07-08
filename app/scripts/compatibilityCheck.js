if (!window.console) {
	var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
	window.console = {};
	for (var i = 0; i < names.length; ++i) {
		window.console[names[i]] = function() {}
	}
}

function check() {
	var browser = navigator.appName;
	var b_version = navigator.appVersion;
	var version = parseFloat(b_version);
	var useragent = navigator.userAgent;
	var support = true;
	// Check browser version
	switch (browser) {
		case 'Microsoft Internet Explorer':
			browser = "MSIE";
			version = useragent.substr(useragent.lastIndexOf('MSIE') + 5, 3);
			break;
		case 'Netscape':
			if (useragent.lastIndexOf('Chrome/') > 0) {
				browser = "Chrome";
				version = parseFloat(useragent.substr(useragent.lastIndexOf('Chrome/') + 7, 3));
				// Access-Control-Expose-Headers bug: https://groups.google.com/a/chromium.org/d/msg/chromium-bugs/Xl-G1Jb5T_s/Mxg8Ob56Zy4J
				support = support && version > 19;
			}
			else if (useragent.lastIndexOf('Firefox/') > 0) {
				browser = "Firefox";
				version = parseFloat(useragent.substr(useragent.lastIndexOf('Firefox/') + 8, 3));
			}
			else if (useragent.lastIndexOf('Safari/') > 0) {
				browser = "Safari";
				version = useragent.substr(useragent.lastIndexOf('Safari/') + 7, 7);
			}
			else if (useragent.lastIndexOf('Trident/') > 0) {
				browser = "MSIE";
				version = parseFloat(useragent.substr(useragent.lastIndexOf('Trident/') + 8, 3)) + 4;
			}
			else {
				browser = "undefined browser";
			}
			break;
		case 'Opera':
			version = useragent.substr(useragent.lastIndexOf('Version/') + 8, 5);
			break;
	}
//	console.log("Browser: " + browser);
//	console.log("Version: " + version);

	// Check browser properties
	if (Object.defineProperties === undefined) {
		console.log("defineProperties is not supported");
		support = false;
	}

	if (!support) {
		alert("You have an old browser, please upgrade");
		location.replace("http://browsehappy.com/");
	}
}

check();
