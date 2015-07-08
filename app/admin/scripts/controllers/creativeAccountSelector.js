/**
 * Created by liad.ron on 11/18/2014.
 */

'use strict';

app.controller('creativeAccountSelectorCtrl', ['$scope', '$rootScope', '$state', 'enums', '$stateParams', '$modalInstance', 'accounts',
	function ($scope, $rootScope, $state, enums, $stateParams, $modalInstance, accounts) {
    $scope.accounts = accounts;
		$scope.labelWidth = 300;
		$scope.account = {};
        //select first account by default
		$scope.account.id = ($scope.accounts && $scope.accounts.length != 0) ? $scope.accounts[0].id : null;

		$scope.onModalSaveBtnClicked = function(){
			preModalClose();
		}

		$scope.onModalCancelBtnClicked = function(){
			$modalInstance.dismiss('cancel');
		}

		function preModalClose(){
      $scope.accounts.one($scope.account.id).get().then(function(result){
        $modalInstance.close(result);
      });
		}
}]);
