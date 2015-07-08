/**
 * Created by Ofir.Fridman on 11/23/14.
 */
'use strict';

app.controller('fireTagsCtrl', ['$scope', '$modalInstance', 'enums', '$timeout', 'tags', 'selectedTags',
    function ($scope, $modalInstance, enums, $timeout, tags, selectedTags) {

        var activeTags = tags;
        $scope.original = {};
        $scope.tags = {};
        $scope.columnsFull = [
          {field: 'id', displayName: 'Tags', listDataArray: tags, gridControlType: enums.gridControlType.getName("SelectList") }
        ];

        // just until the service it's done

        $scope.gridButtonActions = [
           {
               name: "Add",
               func: createNewItem,
               isDisable: false
           },
           {
               name: "Remove",
               func: removeFromGrid,
               isDisable: true
           }
       ];

        initGridModel (tags, selectedTags);

        /// paramters object
        function initGridModel (tags, selectedTags) {
           $scope.original.tags = [];
           for(var i = 0; i< selectedTags.length; i++) {
             $scope.original.tags.push({'id':selectedTags[i].id, 'name': selectedTags[i].reportingName });
           }
           $scope.tags.selectedItems = [];
        }

        function createNewItem() {
          var defaultTag = {
            id: 0,
            name: ''
          };
          $scope.original.tags.push(defaultTag);
        }

        function removeFromGrid() {
          $scope.$root.isDirtyEntity = true;
          deleteTag($scope.tags.selectedItems, $scope.original.tags);
          $scope.gridButtonActions[1].isDisable = true;
        }
        $scope.afterSelectionChanged = function () {
            var selectedItems = $scope.tags.selectedItems;
            $scope.gridButtonActions[1].isDisable = !(selectedItems.length !== 0);
            $scope.$root.isDirtyEntity = true;
        }

        function deleteTag(selectedItems, list) {
          if (selectedItems.length > 0) {

              for(var i = 0; i < list.length; i++){

                  var listItem = list[i];

                  if(checkIfSelected(listItem, selectedItems) != -1){
                      list.splice(i, 1);
                      i -= 1;
                  }

              }
          }
        }


        function checkIfSelected(item, selectedItems){

            var index = -1;

            for(var i = 0; i < selectedItems.length; i++){
                var selectedItem = selectedItems[i];

                if(item === selectedItem){
                    index = i;
                    console.log('found item:', selectedItem);
                    selectedItems.splice(i, 1);
                    break;
                }
            }

            return index;

        }

        $scope.save = function() {
          $modalInstance.close(_.pluck($scope.original.tags, "id"));

        };


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
