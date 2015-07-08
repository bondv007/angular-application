'use strict';

app.controller('deliveryGroupsCtrl', ['$scope', '$state', '$filter', 'mmAlertService', 'EC2Restangular', 'mmModal', 'smartAttachAdsToDgs',
  'dgHelper', '$timeout', 'dgConstants','findReplaceAdsInDGsService', 'mmPermissions',
	function ($scope, $state, $filter, mmAlertService, EC2Restangular, mmModal, smartAttachAdsToDgs,
            dgHelper, $timeout, dgConstants,findReplaceAdsInDGsService, mmPermissions) {
		var timer;
		$scope.entityId = $state.params.campaignId;
    var hasDGManagementPermission = true;//mmPermissions.hasPermissionBySession('DGManagement');
		var centralDeliveryGroupActions = [
      { name: $filter("translate")('Delete'), func: deleteDeliveryGroups, disabledByPermission: !hasDGManagementPermission },
      { name: $filter("translate")('Replace Ads'), func: replaceAdsInDG, disabledByPermission: !hasDGManagementPermission }
    ];
		var centralAdsActions = [];
		$scope.entityLayoutInfraButtons.attachButton = {name: $filter("translate")('attach'), func: attach, ref: null, nodes: [], isPrimary: true};
		$scope.centralDataObject = [
      {
        type: 'deliveryGroup',
        centralActions: centralDeliveryGroupActions,
        dataManipulator: getDGs,
        isEditable: false,
        editButtons: [],
        shouldOpenEntral: $state.current.name.indexOf('deliveryGroupNew') > -1,
        disableAddButton: !hasDGManagementPermission
      }];

		function getDGs(dgs){
			$scope.dgs = dgs;
		}

		$scope.adDataObject = [
			{ type: 'ad',
        centralActions: centralAdsActions,
        dataManipulator: removeUnsupportedAdTypes,
        isDraggable: (hasDGManagementPermission) ? true : undefined,
        hideAddButton: true,
        filters: [
          {key: "adType", value: "MasterAd"}
			  ]
      }
		];
    function replaceAdsInDG() {
      var deliveryGroups = $scope.centralDataObject[0].centralList;
      var ads = $scope.adDataObject[0].centralList;
      if ( typeof(deliveryGroups) == "undefined" || deliveryGroups.length  <= 1){
        mmAlertService.addError("cannot swap master ads,at least one delivery group should be available");
        return false;
      }
      if ( typeof(ads) == "undefined" || ads .length <= 1) {
        mmAlertService.addError("cannot swap master ads,at least two master ads should be available");
        return false;
      }
      var attachedAdsDGs = findReplaceAdsInDGsService.filterAttachedAds(ads,deliveryGroups);

      if (attachedAdsDGs.attachedAds.length  == 0 ){
        mmAlertService.addError("please make sure you have two attached ads at least");
        return false;
      }
      if (attachedAdsDGs.attachedDGs.length  == 0 ){
        mmAlertService.addError("please make sure you have two attached delivery groups at least");
        return false;
      }
        mmAlertService.closeAll();
        var modalInstance = mmModal.open({
          templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
          controller: 'findReplaceAdsInDGCtrl',
          title: $filter("translate")('Swap Ads in Delivery Groups'),
          modalWidth: 1100,
          bodyHeight: 600,
          resolve: {
            ads: function () {
              return $scope.adDataObject[0].centralList;
            },
            dgs : function(){
              return $scope.centralDataObject[0].centralList;
            }
          },
          discardButton: {name: "Close", funcName: "cancel"}
        });
        modalInstance.result.then(function () {
          mmAlertService.closeError();
          $scope.centralDataObject[0].refreshCentral();
        }, function () {
          mmAlertService.closeError();
          $scope.centralDataObject[0].refreshCentral();
        }).then(function () {
          $scope.$root.isDirtyEntity = false;
        });

    }
		function removeUnsupportedAdTypes(ads){
			var supportedAds = [];
			while (ads.length > 0) {
				var ad = ads.pop();
				if (ad.adFormat != 'TRACKING_PIXEL_AD' && ad.adFormat != 'TrackingPixelAd') {
					supportedAds.push(ad);
				}
			}
			for (var i = 0; i < supportedAds.length; i++) {
				ads.push(supportedAds[i]);
			}
		}

		function attach() {
			var selected = getSelectedDGsAndAds();

			if (validationBeforeAttach(selected)) {
				if (selected.isManyToMany) {
					selected.title = "Assign " + selected.numOfAds + " ads to " + selected.numOfDgs + " Delivery Groups";
					selected.placementType = dgHelper.getUIPlacementType(selected.ads[0].adFormat);
					var cloneSelected = EC2Restangular.copy(selected);
					smartAttach(cloneSelected);
				}
				else {
					if($scope.centralDataObject[0].isEntralOpen()){
						$scope.$broadcast(dgConstants.assignAdsAction, selected.ads);
					}
					else{
						$scope.centralDataObject[0].openEntral(true);
						timer = $timeout(function(){
							$scope.$broadcast(dgConstants.assignAdsAction, selected.ads);
						},1500);
					}
				}
			}
		}

		function smartAttach(cloneSelected) {
			mmAlertService.closeAll();
			var modalInstance = mmModal.open({
				templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
				controller: 'smartAttachDgsToAdsCtrl',
				title: cloneSelected.title,
				modalWidth: 1300,
				bodyHeight: 500,
				discardButton: { name: "Close", funcName: "cancel" },
				resolve: {
					selected: function () {
						return cloneSelected;
					}
				}
			});

			modalInstance.result.then(function () {
				mmAlertService.closeError();
				$scope.centralDataObject[0].refreshCentral();
			}, function () {
				mmAlertService.closeError();
				$scope.centralDataObject[0].refreshCentral();
			}).then(function(){$scope.$root.isDirtyEntity = false;});
		}

		function getSelectedDGsAndAds() {
			var selectedDgs = $filter('filter')($scope.centralDataObject[0].centralList, {isSelected: true});
			var selectedMasterAds = $filter('filter')($scope.adDataObject[0].centralList, {isSelected: true});
			var mapAdIDsToNames = mapAdIdsToAdNames();
			var numOfDgs = selectedDgs.length;
			var numOfAds = selectedMasterAds.length;
			var isManyToMany = numOfDgs > 1 && numOfAds > 0;
			return {deliveryGroups: selectedDgs, ads: selectedMasterAds, isManyToMany: isManyToMany, numOfDgs: numOfDgs, numOfAds: numOfAds, campaignId: $scope.entityId, mapAdIDsToNames: mapAdIDsToNames};
		}

		function mapAdIdsToAdNames() {
			var stop = $scope.adDataObject[0].centralList.length;
			var mapAdIDsToNames = {};
			var ad;
			for (var i = 0; i < stop; i++) {
				ad = $scope.adDataObject[0].centralList[i];
				mapAdIDsToNames[ad.id] = ad.name;
			}
			return mapAdIDsToNames;
		}

		function validationBeforeAttach(selected) {
			var isValid = true;
			if (selected.ads < 1) {
				mmAlertService.addError("Please select Delivery Groups and Ads.");
				isValid = false;
			}
			else if (!smartAttachAdsToDgs.isAdFormatValid(selected)) {
				isValid = false;
			}
			return isValid;
		}

		function deleteDeliveryGroups(list, selectedItems) {
			var f=[];
			for (var i = 0; i < selectedItems.length; i++) {
				f[i] = function(k){
					var dg = selectedItems[i];
					dg.remove().then(function () {
						var index = _.indexOf(list, dg);
						list.splice(index, 1);
						$scope.centralDataObject[0].refreshCentral();
					}, function (response) {
						mmAlertService.addError(response);
					});
				}(i);
			}
		}

		$scope.$on('$destroy', function() {
			if (timer){
				$timeout.cancel(timer);
			}
		});
	}]);
