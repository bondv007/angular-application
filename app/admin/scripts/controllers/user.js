/**
 * Created by rotem.perets on 5/27/14.
 */

app.controller('userCtrl', ['$scope', '$stateParams', '$state', 'flowToolBar', 'entityMetaData', 'mmPermissions','adminUtils',
	function ($scope, $stateParams, $state, flowToolBar, entityMetaData, mmPermissions, adminUtils) {

		var hasAccountsPermissions = false;

		$scope.type = 'user';
		$scope.showHistory = true;
		$scope.hideSettings = true;
		$scope.hideGoTo = false;
		$scope.entityId = $stateParams.userId;
		$scope.childModel = {};
		$scope.entityActions = [];
		$scope.goToData = {};
		$scope.goToData.links = [];
		$scope.goToData.actions = [];

		var watcher = $scope.$watch('childModel', function (newValue, oldValue) {
			if(!_.isEmpty($scope.childModel))
			{
        setEntityActions();
        setGoToData();
			}
		});

		function setEntityActions(){
			var hasPermissionForPermissions = mmPermissions.hasPermissionBySession(entityMetaData["userPermissions"].permissions.entity);
			hasAccountsPermissions = mmPermissions.hasPermissionByEntity($scope.childModel, entityMetaData["account"].permissions.entity);

			var tempArr = [];

			tempArr.push(
				{
					name: 'Setup',
					ref: '.userEdit',
					func: changeToUserEditView,
					preventOpenMenu: true
				});

      if(hasPermissionForPermissions) {
        tempArr.push(
          {
            name: 'Permissions',
            ref: '.userPermissions',
            func: goToUserPermissions,
            preventOpenMenu: true
          });
        }

			$scope.entityActions = tempArr;

			flowToolBar.setPrefixToEntityActions('spa.user',$scope.entityActions);
			$scope.entityActions.parentMenuItem = 'Admin';
			if($scope.$parent.isActive) $scope.$parent.isActive($scope.entityActions.parentMenuItem);
		}

		//GoTo - set links & actions by entity logic and permissions
		function setGoToData(){
			//set links array
			$scope.goToData.links.push({type: 'user id', namePath: 'id', sref: 'spa.user.userEdit', paramKey: 'userId', paramPath: 'id'});
			if(hasAccountsPermissions) $scope.goToData.links.push({type: 'account', namePath: 'accountName', sref: 'spa.account.accountEdit', paramKey: 'accountId', paramPath: 'accountId'});
			//$scope.goToData.links.push({type: 'permissions', namePath: 'id', sref: 'spa.user.userPermissions', paramKey: 'userId', paramPath: 'id'});

			//due to the fact that HISTORY action was already added by entityLayout.js, needs to reorder the actions and add HISTORY to be last
			//set actions array
			$scope.goToData.actions.splice(0, 0, {name: 'New User', func: addNewUser});
			$scope.goToData.actions.splice(1, 0, {name: 'Delete', func: deleteEntity});
		}

		function addNewUser() {
			changeView({ref: 'spa.user.userNew', userId: ''});
		}
		function deleteEntity(){
			adminUtils.crudOperations.deleteEntity($scope.childModel, "spa.admin.users");
		}
		function changeToUserEditView(){
			$state.go('spa.user.userEdit', { userId: $state.params.userId});
		}
		function goToUserPermissions(){
			$state.go('spa.user.userPermissions', { userId: $state.params.userId});
		}
		function changeView(view) {
			$state.go(view.ref, { userId: view.userId});
		}

		$scope.$on('$destroy', function() {
			if (watcher) watcher();
		});

	}]);
