/**
 * Created by Ofir.Fridman on 5/15/14.
 */
app.directive('sticky', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var bottomReferencePointId = "#" + scope.stickyObject.bottomReferencePointId;
				var stickElementId = "#" + scope.stickyObject.stickElementId;
				var fixedCss = scope.stickyObject.fixedCss;
				var finTune = scope.stickyObject.finTune;

				element.on('scroll.sticky', function () {

					var topReferencePoint = element.offset().top;
					var bottomReferencePoint = $(bottomReferencePointId).offset() ? $(bottomReferencePointId).offset().top : null;

					var elementToStick = $(stickElementId);
					if (bottomReferencePoint - topReferencePoint < 0 + finTune && bottomReferencePoint) {
						var fixedPos = $(".editContainer:last").offset().top;
						var width = $(".rootContainer:first").width();

						$("." + fixedCss).css('top', fixedPos).css("width",width);
						elementToStick.addClass(fixedCss);
					} else {
						elementToStick.removeClass(fixedCss);
					}
				});
			},
			scope: {
				stickyObject: '='
			}
		}
	}
);

