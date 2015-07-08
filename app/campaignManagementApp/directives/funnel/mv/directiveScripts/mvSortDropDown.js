/**
 * Created by ofir on 3/6/2015.
 */
'use strict'
app.directive('mvSortDropDown', [function () {
    return {
      restrict: 'AE',
      scope: {
        mmId: "@",
        mmOptions: "=?"
      },
      templateUrl: 'campaignManagementApp/directives/funnel/mv/views/mvSortDropDown.html',
      controller: function ($scope) {
        $(function () {
          angular.element('.mv_sortable').sortable({
            placeholder: "ui-state-highlight",
            axis: "y",
            containment: "parent",
            cursor: "move"
          });
          angular.element('.mv_sortable').disableSelection();
        });

        $scope.onSelectedItem = function (selectedItem) {
          selectedItem['dropDownId'] = $scope.mmId;
          $scope.$emit('mv_item_selected', selectedItem);
        }

        $scope.$on('remove_mv_selected_item', function (event, selectedItem) {
          $scope.dropDown = {selected:null};
        });
      }
    }
  }]
)

app.directive("outsideClick", ['$document', '$parse', function ($document, $parse) {
  return {
    link: function ($scope, $element, $attributes) {
      var scopeExpression = $attributes.outsideClick,
        onDocumentClick = function (event) {
          var isChild = $element.find(event.target).length > 0;

          if (!isChild) {
            $scope.$apply(scopeExpression);
          }
        };

      $document.on("click", onDocumentClick);

      $element.on('$destroy', function () {
        $document.off("click", onDocumentClick);
      });
    }
  }

}]);
