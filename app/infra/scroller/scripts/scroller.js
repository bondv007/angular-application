/**
 * Created by liron.tagger on 2/12/14.
 */
'use strict'
angular.module('scroller', [])
.directive('scrollEvent', function() {
	return function(scope, elm, attr) {
		var raw = elm[0];
		elm.bind('scroll', function() {
			scope.elementSizes['scrollTop'] = raw.scrollTop;
			scope.$apply(attr.scrollEvent);
		});

    scope.$on('$destroy', function() {
      elm.off('scroll');
    });
	};
})
.directive('scrollerTransclude', function() {
  return {
    compile: function(tElement, tAttrs, transclude) {
      return function(scope, iElement, iAttrs) {
        transclude(scope.$new(), function(clone) {
          iElement.append(clone);
        });
      };
    }
  };
})
.directive('scroller', function() {
	return {
		restrict: 'AE',
		transclude: true,
		require: ['scrollerRepeater', 'itemHeight'],
		templateUrl: 'infra/scroller/views/scroller.html',
		controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
			var element = $($element.children());
			var jump;
			initializeItemsList();
			registerMouseScrollEvent();
			$scope.loadData = function loadData() {
				//max inner height in browser is: 33554428
				if ($scope.elementSizes.scrollTop == 0){$scope.elementSizes.scrollTop = 1;}
				setScrollerData($scope.elementSizes.scrollTop);
			};

      var resizeHandler = function() {
        jump = ($element.height() / $scope.itemHeight) >> 0;
        $scope.visiblescrollerItems = new Array($scope.scrollerItems.length < jump + 1 ? $scope.scrollerItems.length : jump + 1);
        setScrollerData(0);
      };

			function initializeDirectiveData(){
				$scope.itemHeight = $attrs.itemHeight;
				$scope.itemHeight = $scope.itemHeight > 0 ? $scope.itemHeight : 20;
				$scope.numOfItems = $scope.scrollerItems ? $scope.scrollerItems.length : 0;
				$scope.elementSizes = { scrollTop: null };
				$scope.innerHeight = $scope.numOfItems * $scope.itemHeight;

				jump = ($element.height() / $scope.itemHeight) >> 0;
				$scope.visiblescrollerItems = new Array($scope.scrollerItems.length < jump + 1 ? $scope.scrollerItems.length : jump + 1);

				element.find('.scroller').height($scope.innerHeight);
				setScrollerData($scope.elementSizes.scrollTop);
				$element.parent().on('resize', resizeHandler);
			}
			function initializeItemsList(){
				var repeaterLoop = $attrs.scrollerRepeater;
				var match = repeaterLoop.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/);
				$scope.indexString = match[1];
				var collectionString = match[2];
				$scope.$watchCollection(collectionString, function(newCollection, oldCollection){
					if (newCollection !== undefined) {
						$scope.scrollerItems = newCollection;
						initializeDirectiveData();
					}
				});
			}
			function registerMouseScrollEvent() {
				element.find('.scrollerBoxItems').bind('mousewheel', function(e) {
					var scrollerBoxScroll = element.find('.scrollerBoxScroll');
					if(e.originalEvent.wheelDelta > 0) {
						scrollerBoxScroll.scrollTop(scrollerBoxScroll.scrollTop() - 100);
					} else {
						scrollerBoxScroll.scrollTop(scrollerBoxScroll.scrollTop() + 100);
					}
					setScrollerData(scrollerBoxScroll.scrollTop());
				});
			}
			function setScrollerData(scrollAmount){
				var fromRow = (scrollAmount * $scope.numOfItems / $scope.innerHeight) >> 0;
				var amount = fromRow + jump + 1;
				amount = $scope.scrollerItems.length < amount ? $scope.scrollerItems.length : amount;
				for (var i = fromRow; i < amount; i++){
					$scope.visiblescrollerItems[i - fromRow] = $scope.scrollerItems[i];
				}

				if (scrollAmount !== null) {
					var remainder = $scope.elementSizes.scrollTop % $scope.itemHeight;
					var scrollerBoxItems = element.find('.scrollerBoxItems');
					if (remainder > 0) scrollerBoxItems.scrollTop(remainder);
				}
				if ( $scope.elementSizes.scrollTop + $element.height() >= $scope.innerHeight - 100) {
					var scrollerBoxItems = element.find('.scrollerBoxItems');
					var prevScroll = 0;
					while (scrollerBoxItems.scrollTop() != prevScroll){
						prevScroll = scrollerBoxItems.scrollTop();
						scrollerBoxItems.scrollTop($scope.itemHeight + prevScroll);
					}
				}
			}

      $scope.$on('$destroy', function() {
        $element.parent().off('resize', resizeHandler);
        element.find('.scrollerBoxItems').off('mousewheel');
      });
		}],
		scope: true
	}
});