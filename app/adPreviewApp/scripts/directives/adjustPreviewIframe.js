app.directive('adjustPreviewIframe', function ($parse) {
	return function (scope, element, attr) {
		element.load(function(){
			element.contents().find("head").append($("<style type='text/css'>  body{margin: 0;}  </style>"));
//			element.css({
//				position: 'absolute',
//				left: '50%',
//				top: '50%',
//				'margin-left': 0 - (element.width() / 2),
//				'margin-top': 0 - (element.height() / 2)
//			});
		});
	}
});