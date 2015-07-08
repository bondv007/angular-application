'use strict';

app.controller('tagGenerationIONotSignedCtrl', ['$scope', '$modalInstance','$state', 'campaignId',
	function ($scope, $modalInstance, $state, campaignId) {
		$scope.generatePublished = function(){
			$modalInstance.close(true);
		}
		$scope.viewIO = function() {
      $modalInstance.dismiss('cancel');
			$state.go('spa.campaign.ioList.ioEdit', {campaignId: campaignId});
		}
		$scope.cancel = function(){
			$modalInstance.dismiss('cancel');
		}
	}]);