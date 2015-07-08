/**
 * Created by yoav.karpeles on 3/9/14.
 */
'use strict';

app.controller('accountUserCtrl', ['$scope', function ($scope) {

	var centralAccountActions = [
		{ name: 'Delete', func: null, disable: true }
	];
	var centralUserActions = [
		{ name: 'Delete', func: null, disable: true}
	];

  var addSubEntity = {
    index: 1,
    text: 'Add new User'
  };

	$scope.centralDataObject = [
		{ type: 'account', centralActions: centralAccountActions, dataManipulator: null, isEditable: true, editButtons: [], addSubEntity: addSubEntity },
		{ type: 'user', centralActions: centralUserActions, dataManipulator: null, isEditable: true, editButtons: [] }
	];
}]);