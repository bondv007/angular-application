/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('permissionSetsCtrl', ['$scope', function ($scope) {

  var centralPermissionActions = [
    { name: 'Delete', func: null, disable: true}
  ];

  $scope.centralDataObject = [
    { type: 'permissionSet', centralActions: centralPermissionActions, dataManipulator: null, isEditable: true, editButtons: [] }
  ];
}]);