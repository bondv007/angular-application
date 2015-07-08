/**
 * Created by Gustavo Medina
 */
'use strict';

app.controller('landingUrlsCtrl', ['$scope', '$modalInstance', 'enums', '$timeout', 'urls',
    function ($scope, $modalInstance, enums, $timeout, urls) {
        $scope.urls = {};

        $scope.columnsFull = [
          {field: 'name', displayName: 'Value' }
        ];

        // just until the service it's done
        $scope.original = [];

        $scope.gridButtonActions = [
           {
               name: "Add",
               func: createNewItem,
               isDisable: false
           },
           {
               name: "Add Multiple",
               func: tbd,
               isDisable: false
           },
           {
               name: "Excel",
               func: tbd,
               isDisable: false
           },
           {
               name: "Remove",
               func: removeFromGrid,
               isDisable: true
           }
       ];

        $scope.save = function() {
          $modalInstance.close(_.pluck($scope.original.urls, "name"));

        };

        initGridModel (urls);

        function tbd() {
        }

        function initGridModel (urls) {
            $scope.original = {
              urls : []
            };
            for(var i = 0; i< urls.length; i++) {
              $scope.original.urls.push({'name': urls[i]});
            }
           $scope.urls.selectedItems = [];
        }

        function createNewItem() {
         var urlDefault = {
            value: ''
         };
          $scope.original.urls.push(urlDefault);
        }

        function removeFromGrid() {
          $scope.$root.isDirtyEntity = true;
          deleteUrl($scope.urls.selectedItems, $scope.original.urls);
          $scope.gridButtonActions[3].isDisable = true;
        }
        $scope.afterSelectionChanged = function () {
            var selectedItems = $scope.urls.selectedItems;
            $scope.gridButtonActions[3].isDisable = !(selectedItems.length !== 0);
            $scope.$root.isDirtyEntity = true;
        }

        function deleteUrl(selectedItems, parameters) {
          if (selectedItems.length > 0) {
            var index = selectedItems.length - 1;
            while (index >= 0) {
              var itemToDelete = selectedItems[index];
              parameters.splice(parameters.indexOf(itemToDelete), 1);
              selectedItems.splice(index, 1);
              index--;
            }
          }
        }


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
