/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('permissionsCtrl', ['$scope', function ($scope) {

  var centralPermissionActions = [
    { name: 'Delete', func: null, disable: true}
  ];

  $scope.centralDataObject = [
    { type: 'permission', centralActions: centralPermissionActions, dataManipulator: null, isEditable: true, editButtons: [] }
  ];
}]);