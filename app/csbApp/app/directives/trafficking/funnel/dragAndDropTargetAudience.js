/**
 * Created by Ofir.Fridman on 1/19/2015.
 */
'use strict';

app.directive('dragAndDropTargetAudience', ['strategies', 'enums',
  function (strategies, enums) {
    return {
      restrict: 'A',
      scope: {
        targetAudienceIds: '='
      },
      link: function (scope, element) {

        /**
         * This is the link function for this directive. Will manage the dragging and dropping of the items to enable the user to sort the segments.
         Based on http://css.dzone.com/articles/drag-and-drop-angularjs-using
         * @param   scope
         * @param   element
         * @param   attrs
         * @return
         */

        /*
         index of the element that is being sorted
         */
        var startIndex = -1;

        /*
         Using jQueryUI's "sortable" widget
         */
        $(element[0]).sortable({
          items: 'li.segment', // which items will be sortable?
          start: function (event, ui) { // "This event is triggered when sorting starts."
            startIndex = $(ui.item).index();
            // console.log("start() index: " + startIndex);
          },
          stop: function (event, ui) { // "This event is triggered when sorting has stopped."

            /*
             index in which the element was sorted
             */
            var newIndex = $(ui.item).index();

            var isDropToNewPosition = newIndex != startIndex;
            if (isDropToNewPosition) {
              var cloneTargetAudienceIds = angular.copy(scope.targetAudienceIds);
              /* removing the item from its current position */
              var itemToMove = scope.targetAudienceIds.splice(startIndex, 1)[0]; //splice returns an array with the object removed from the original array

              /* inserting it in it's new position */
              scope.targetAudienceIds.splice(newIndex, 0, itemToMove);

              /* updating the scope */
              scope.$apply(scope.model);
              strategies.data.targetAudiencePriorities.priorityPolicy = enums.priorityPolicy.manual;
              strategies.data.targetAudiencePriorities["targetAudienceList"].forEach(function (value, i) {
                value.defaultPriority = i + 1;
              });
              strategies.saveFunnelPriorities().then(function(){},function(){
                scope.targetAudienceIds = cloneTargetAudienceIds;
              });

            }
          },
          axis: 'y' //only drag vertically
        });

      }
    };
  }
]);
