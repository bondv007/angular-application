/**
 * Created by liron.tagger on 6/5/14.
 */
'use strict'
app.directive('resizeCol', ['$document', 'mmSession', function ($document, mmSession) {
	return {
		restrict: 'A',
		scope: {
			minWidth: '@',
			useParent: '@',
			isReverted: '@',
			isDouble: '@',
			leftSide: '@',
			rightSide: '@',
			useSession: '@',
			startingWidth: '@'
		},
		link: function (scope, element, attr) {
			var reminder = 0.01;
			var minPercentage = 7;
			var startX = 0;
			var startWidth = 0;
			var leftSideStartWidth = 0;
      var rightSideStartWidth = 0;

			if (scope.startingWidth) {
				if (scope.useParent){
					element.parent().width(scope.startingWidth);
				}
				else{
					element.width(scope.startingWidth);
				}
			}

			element.bind('mousedown', function(event) {
				event.preventDefault();

				initParams();

				$document.bind('mousemove', resize);
				$document.bind('mouseup', mouseUp);

				event.cancelBubble = true;
			});

			function initParams() {
				scope.minWidth = parseInt(scope.minWidth) || 0;
				scope.leftMinWidth = parseInt(scope.leftMinWidth) || 0;
				startX = event.screenX;

				leftSideStartWidth = scope.isDouble ? element.parent().parent().find('.' + scope.leftSide).width() : 0;
        rightSideStartWidth = scope.isDouble ? element.parent().parent().find('.' + scope.rightSide).width() : 0;

        startWidth = scope.useParent ? (scope.isDouble ? element.parent().parent().width() : element.parent().width()) : element.width();
			}

			function mouseUp() {
				$document.unbind('mousemove', resize);
				$document.unbind('mouseup', mouseUp);
			}
			function resize(event) {
				event.preventDefault();
				var diff = event.screenX - startX;
				diff = scope.isReverted ? - 1 * diff : diff;
				var newWidth = (scope.isDouble ? leftSideStartWidth : startWidth) + diff;
				var containerWidth = scope.useParent ? element.parent().parent().width() : element.parent().width();
				if (newWidth + scope.minWidth <= containerWidth){
          if (scope.isDouble){
            var newLeftPercentage = 100 * newWidth / containerWidth - reminder;
            var newRightPercentage = 100 / (containerWidth / (rightSideStartWidth - diff)) - reminder;

						newLeftPercentage = newLeftPercentage.toFixed(2);
						newRightPercentage = newRightPercentage.toFixed(2);

            if (newLeftPercentage >= minPercentage && newRightPercentage >= minPercentage){
              $('.' + scope.leftSide).width(newLeftPercentage + '%');
              $('.' + scope.rightSide).width(newRightPercentage + '%');
              if (scope.useSession){
								var sessionContainer = mmSession.get(scope.useSession, {});
								sessionContainer[scope.leftSide] = newLeftPercentage + '%';
								sessionContainer[scope.rightSide] = newRightPercentage + '%';
								mmSession.set(scope.useSession, sessionContainer, mmSession.storage.disk);
              }
            }
          }
          else if (newWidth >= scope.minWidth || !scope.minWidth) {
						if (scope.useParent){
							element.parent().width(newWidth);
						}
						else{
							element.width(newWidth);
            }
					}
				}
			}

			scope.$on('$destroy', function() {
				element.off('mousedown');
			});
		}
	};
}]);