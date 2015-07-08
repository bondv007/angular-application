/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('brandsCtrl', ['$scope', function ($scope) {

  var centralBrandActions = [
    { name: 'Delete', func: null }
  ];

  $scope.centralDataObject = [
    { type: 'brand', centralActions: centralBrandActions, dataManipulator: null, isEditable: true, editButtons: [] }
  ];
}]);