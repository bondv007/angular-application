/**
 * Created by xicom on 9/16/2014.
 */
app.directive('previewImage', function ($parse) {
	return function (scope, element, attr) {
		var xOffset = 30;
		var yOffset = 15;
		function getcss(e){
			return {"top": (e.pageY - xOffset) + "px", "left": (e.pageX + yOffset) + "px", "z-index": 99999};
		};

        var mouseEnterHandler = function (e) {
            angular.element("#preview").remove();
            var imgSrc = element.attr("src");
            if (typeof imgSrc == "undefined")
                console.log("Unable to show image preview as no src attribute found on image element!");
            angular.element("body").append("<p id='preview'><img style='max-height:300px;max-width:300px;' src='" + imgSrc + "' alt='Image preview' />" + '<br/>' + "</p>");
            angular.element("#preview").css(getcss(e)).show("slow");
        };

        var mouseMoveHandler = function (e) {
            angular.element("#preview").css(getcss(e));
        };

        var mouseLeaveHandler = function (e) {
            angular.element("#preview").remove();
        };

		element
            .bind("mouseenter", mouseEnterHandler)
            .bind("mousemove", mouseMoveHandler)
            .bind("mouseleave", mouseLeaveHandler);

        scope.$on('$destroy', function() {
            element.unbind("mouseenter", mouseEnterHandler);
            element.unbind("mousemove", mouseMoveHandler);
            element.unbind("mouseleave", mouseLeaveHandler);
        });
	}
});
