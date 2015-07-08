angular.module('ngGrid.directives').directive('ngModel', [function () {
	return {
		require: 'ngModel',
		link: function (scope, elm, attrs, ngModel) {
			var isElementExistInsideNgGrid = elm.parents('.gridStyle').length > 0;
			if (!isElementExistInsideNgGrid)
				return false; //ngModel is frequently used as default attribute in angular.js, so making sure if our element is inside ng grid then proceed further otherwise stop proceedings here immediately.

			var isTextBox = elm.closest(".txtNgGrid").length > 0;
			if (!isTextBox)
				return false;

			var oldCellValue;
			var dereg = scope.$watch('ngModel', function () {
				oldCellValue = ngModel.$modelValue;
				dereg();
			});

			function keydown(evt) {
				switch (evt.keyCode) {
					case 37:
					case 38:
					case 39:
					case 40:
						evt.stopPropagation();
						break;
					case 27:
						if (!scope.$$phase) {
							scope.$apply(function () {
								ngModel.$setViewValue(oldCellValue);
								elm.blur();
							});
						}
						break;
					case 13:
						if (scope.enableCellEditOnFocus && scope.totalFilteredItemsLength() - 1 > scope.row.rowIndex && scope.row.rowIndex > 0 || scope.col.enableCellEdit) {
							elm.blur();
						}
						break;
				}

				return true;
			}

			elm.bind('keydown', keydown);

			function click(evt) {
				evt.stopPropagation();
			}

			elm.bind('click', click);
			function mousedown(evt) {
				evt.stopPropagation();
			}

			elm.bind('mousedown', mousedown);

            scope.$on('$destroy', function () {
				elm.off('keydown', keydown);
				elm.off('click', click);
				elm.off('mousedown', mousedown);
                angular.element(elm).off('blur');
			});

            scope.$on('ngGridEventStartCellEdit', function () {
                elm.focus();
                elm.select();
            });

			angular.element(elm).bind('blur', function () {
				scope.$emit('ngGridEventEndCellEdit');
			});
		}
	};
}]);
