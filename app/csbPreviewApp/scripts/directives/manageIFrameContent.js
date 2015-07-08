
app.directive('manageIframeContent', function ($parse) {
	return function (scope, element, attr) {
		element.load(function(){
			element.contents().find("head").append($("<style type='text/css'>  body{margin: 0;}  </style>"));
		});
	}
});