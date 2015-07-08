'use strict';

app.controller('packagesCentralCtrl',
	['$scope', '$stateParams', 'placementService', '$state', 'mmModal', 'EC2Restangular', 'mmAlertService','$filter', 'tagGenerationService',
		function ($scope, $stateParams, placementService, $state, mmModal, EC2Restangular, mmAlertService, $filter, tagGenerationService) {
			$scope.entityId = $stateParams.campaignId;

			var centralPlacementPackagesActions = [
				{ name: $filter("translate")('Delete'), func: deletePlacementOrPackage },
				{ name: $filter("translate")('Edit'), func: actionFunc }
			];

			var centralPlacementsActions = [
        { name: $filter("translate")('Delete'), func: deletePlacementOrPackage },
				{ name: $filter("translate")('Generate Tag'), func: openMultipleTags },
				{ name: $filter("translate")('Enable Serving'), func: enableServing }
			];

			var addSubEntity = {
				index: 1,
				text: $filter("translate")('Add new Placement')
			}

			$scope.centralDataObject = [
				{ type: 'placementPackage', centralActions: centralPlacementPackagesActions, dataManipulator: setPackaegesData, isEditable: true, editButtons: [], addSubEntity: addSubEntity},
				{ type: 'placement', centralActions: centralPlacementsActions, dataManipulator: setNullInDummyPackages, isEditable: true, noneField: 'placementLevel'}
			];

			function setPackaegesData(packages){
				for (var i = 0; i < packages.length; i++){
					packages[i].startDate = packages[i].mediaServingData.startDate;
					packages[i].endDate = packages[i].mediaServingData.endDate;
				}
			}

			function setNullInDummyPackages(placements){
				for (var i = 0; i < placements.length; i++){
					if(placements[i].servingAndCostData.placementLevel) {
						placements[i].packageId = -2;
					}
				}
			}

			function addNewPlacement(centralSelectedList, packages) {
				if (centralSelectedList.length == 0) {
          mmAlertService.addError($filter("translate")("Please select a package"));
				}
				else { // Selected 1 or more packages
					if (centralSelectedList.length != 1) { mmAlertService.addError($filter("translate")('Please select only one package'))}
					else {
						$scope.showSPinner = true;
						// Display new placement in entral
					}



					serverPlacements.customPUT(placementIds).then(enableServingResponse,enableServingError);
				}
			}
			function deletePlacementOrPackage(centralSelectedList, packages) {
				for (var i = 0; i < packages.length; i++) {
					var p = packages[i];
					p.remove().then(function () {

						var index = _.indexOf(centralSelectedList, p);
						centralSelectedList.splice(index, 1);
					}, function (response) {
						console.log(response);
					});
				}
			}

			function actionFunc() {
        mmAlertService.addError('Are you serious ? double click on the entity');
			}

			/* Package functions */
			function addPlacementPackage(){
				$state.go('spa.placementPackage');
			}

			function enableServing(centralList,selectedPlacements) {
				if (selectedPlacements.length == 0) {
          mmAlertService.addError($filter("translate")("You didn't select placements"));
				}
				else { // Selected 1 or more placements
					var serverPlacements = EC2Restangular.all('placements').one('enableServing');

					var placementIds = [];

					for (var i = 0; i < selectedPlacements.length; i++) {
						var _placement = selectedPlacements[i];
						placementIds.push(_placement.id);
					}

					$scope.showSPinner = true;
					serverPlacements.customPUT(placementIds).then(enableServingResponse,enableServingError);
				}
			}

			function enableServingResponse(data) {
				mmAlertService.addSuccess($filter("translate")("Enable serving done successfully"));
			}


			function enableServingError(error) {
				$scope.showSPinner = false;
				if (error.data.error === undefined) {
					mmAlertService.addError($filter("translate")("Server error. Please try again later"));
				} else {
					mmAlertService.addError(error.data.error);
				}
			}

			function openMultipleTags(centralList,selectedPlacements) {
				if (selectedPlacements.length == 0) {
          mmAlertService.addError($filter("translate")("You didn't select placements"));
				}
				else {
          tagGenerationService.openTagSettings($scope, selectedPlacements);
				}
			}
		}]);
