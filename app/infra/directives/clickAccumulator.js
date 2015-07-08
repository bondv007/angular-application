/**
 * Created by liron.tagger on 11/20/13.
 */
app.directive('clickAccumulator', ['$document', 'clickAccumulatorService', function ($document, clickAccumulatorService) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
            var clickHandler = function (event) {
                clickAccumulatorService.addClickFor(event.target);
            };

			$document.on('click', clickHandler);

            scope.$on('$destroy', function() {
                $document.off('click', clickHandler)
            });
		}
	};
}]);