'use strict';

app.controller('bannerSizeCTRL', ['$scope', '$modalInstance', 'EC2Restangular', 'mmAlertService', 'placementValidation',
	function ($scope, $modalInstance, EC2Restangular, mmAlertService, placementValidation) {
		$scope.bannerSizeError = {isValid: true, widthText: '', heightText: ''};
		$scope.bannerSizeMode = {isEditMode: false};
		$scope.newBannerSize = {id: null, width: '', height: '',type:'APIBannerSize'};
		$scope.bannerSizeDD = [];
		$scope.addBanerSizeLink = true;

		$scope.onNewEntitySave = function () {
      var bannerSizeMap= [];
      EC2Restangular.all('placements').all('bannerSizes').getList().then(function (all) {
        if (!_.isUndefined(all) && all.length > 0 ){
          for ( var i = 0; i<all.length;i++){
            var name = all[i]['width'] + 'X' + all[i]['height'];
            bannerSizeMap[name] = name;
          }
          $scope.bannerSizeError = placementValidation.bannerSizeValidation($scope.newBannerSize, bannerSizeMap);
          if ($scope.bannerSizeError.isValid) {
            var serverPlacementsBannerSizes = EC2Restangular.all('placements').all('bannerSizes');
            serverPlacementsBannerSizes.post($scope.newBannerSize).then(processData, processError);
            var bannerSizeId = $scope.newBannerSize.width + 'X' +$scope.newBannerSize.height
            $modalInstance.close(bannerSizeId);
          }
        }else{
          mmAlertService.addError("unable to get banner sizes");
        }

      }, function (response) {
        mmAlertService.addError(response);
      });

		}

		$scope.onNewEntityCancel = function () {
			$modalInstance.dismiss('cancel');
		};

		function processData(data) {
			$scope.placement = data[0] ? data[0] : data;
			mmAlertService.addSuccess("Dimensions has been saved successfully.");
			return $scope.placement;
		}

		function processError(error) {
			if (error.data.error === undefined) {
				mmAlertService.addError("Server error. Please try again later.");
			} else {
				mmAlertService.addError(error.data.error);
			}
		}

	}]);


