app.directive('centralScrollEvent', ['$parse', function($parse) {
	return function(scope, elm, attr) {
		var elem = elm[0];
		var fn = $parse(attr.centralScrollEvent, null, true);
		var scrollHandler = function(e) {
			var scrollTo = null;

			var minScrollTime = 500;
			var now, lastScrollFireTime = 0;

			if (e.type == 'mousewheel') {
				scrollTo = (e.originalEvent.wheelDelta * -1);
			}
			else if (e.type == 'DOMMouseScroll') {
				scrollTo = 40 * e.originalEvent.detail;
			}

			if (scrollTo) {
				if (attr.$attr.preventDefault) {
					e.preventDefault();
					angular.element(elem).scrollTop(scrollTo + $(this).scrollTop());
				}
			}

			var callback = function() {
				fn(scope, {$event:e});
			};

			if (elem.offsetHeight + elem.scrollTop >= elem.scrollHeight) {
				now = new Date().getTime();
				if (now - lastScrollFireTime > minScrollTime) {
					scope.$apply(callback);
					lastScrollFireTime = now;
				}
			}
		};

		elm.bind('scroll mousewheel DOMMouseScroll', scrollHandler);

		// Events & Watches
		scope.$on('central:scrollbar:scroll-top', function() {
			angular.element(elem).scrollTop(0);
		});
		scope.$on('$destroy', function() {
			elm.unbind('scroll mousewheel DOMMouseScroll', scrollHandler);
		});
	};
}]);
app.directive('centralArrowEvent', ['$document', function($document) {
	return function(scope, elm, attr) {
		var keyDownHandler = function(evt) {
			evt = evt || window.event;
			switch (evt.keyCode) {
				case 38:
					scope.$apply(attr.centralArrowEvent + '(true)');
					checkLocation(evt, elm);
					break;
				case 40:
					scope.$apply(attr.centralArrowEvent + '(false)');
					checkLocation(evt, elm);
					break;
				case 32: break;
			}
		};
		$document.bind('keydown', keyDownHandler);

		function  checkLocation (evt, elm){
			evt.preventDefault();
		}

		scope.$on('$destroy', function() {
			$document.unbind('keydown', keyDownHandler);
		});
	};
}]);
//app.directive('ngRightClick', function($parse) {
//	return function(scope, elm, attr) {
//		var fn = $parse(attr.ngRightClick);
//		elm.bind('contextmenu', function(event) {
//			scope.$apply(function() {
//				event.preventDefault();
//				fn(scope, {$event:event});
//			});
//		});
//	};
//});