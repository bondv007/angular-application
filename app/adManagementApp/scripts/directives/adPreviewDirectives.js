/**
 * Created by xicom on 7/22/2014.
 */
app.directive("addRemoveScroll", function () {
	return function (scope, element, attrs) {

		var elem = angular.element(".elementContainer.full");

		var childrenDiv = elem.children("div:first-child");

		scope.$on("removeIframeScroll", function () {
			if (elem.hasClass("removeOverflow"))
				elem.removeClass("removeOverflow");
			if (childrenDiv.hasClass("assetpreviewmargin"))
				childrenDiv.removeClass("assetpreviewmargin");
		});

		scope.$on("addIframeScroll", function () {
			if (!elem.hasClass("removeOverflow"))
				elem.addClass("removeOverflow");
			if (!childrenDiv.hasClass("assetpreviewmargin"))
				childrenDiv.addClass("assetpreviewmargin");
		});
	}
});
app.directive("downloadBackgroundUrlContent", function () {
	return function (scope, element, attrs) {
		element.bind("click", function () {
			if (!_.isNull(scope.backgroundUrl)) {
				var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
				scope.backgroundUrl = scope.backgroundUrl.match(/^http([s]?):\/\/.*/) ? scope.backgroundUrl : "http://" + scope.backgroundUrl;
				if (regex.test(scope.backgroundUrl)) {
					angular.element(".elementContainer").backstretch([
						scope.backgroundUrl
					], {
						isImage: false
					});
					scope.$broadcast("addIframeScroll");
				}
			}
		});
	}
});
app.directive('removeBackgroundContent', function () {
	return {
		restrict: 'EA',
		link: function (scope, element, attrs) {
			element.bind("click", function () {
				angular.element("iframe").attr("src", "");
				scope.$broadcast("removeIframeScroll");
			});
		}
	};
});