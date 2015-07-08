/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('advertisersCtrl', ['$scope', function ($scope) {

  var centralAdvertiserActions = [
    { name: 'Delete', func: null, disable: true}
  ];

  $scope.centralDataObject = [
    { type: 'advertiser', centralActions: centralAdvertiserActions, dataManipulator: null, isEditable: true, editButtons: []  }
  ];
}]);