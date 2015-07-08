/**
 * Created by Ofir.Fridman on 11/17/14.
 */
'use strict';

app.controller('traffickingCtrl', ['$scope', 'EC2Restangular',  'dgConstants', 'dgTraffickingService',
	function ($scope, EC2Restangular, dgConstants, dgTraffickingService) {
		//region Init
		var campaignId = "HRA";
		$scope.dgs = [];
//		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
//		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};
		$scope.dgDropDownButton = {name: "dg_trafficking_New_Dg", items: [
			{name: 'dg_trafficking_New_Dg', func: createNewDg},
			{name: 'dg_trafficking_Existing_Dg', func: displayExistingDgs}
		]};
		var dgsEnableDisableState = {};
		//endregion
        $scope.$root.$on('treeView.segmentSelectedInFunnelView', updateState);
		function updateState(){
            $scope.dgs = [];
            $scope.buttonState = {text: dgConstants.disableEnableButtonOptions.disableEnable};
			dgTraffickingService.getCampaignDgsAndAds(campaignId).then(setDgs);
			$scope.dgsWithoutTargetAudience=[];
		}
		updateState();

		function setDgs(dgs){
			$scope.dgs = EC2Restangular.copy(dgs);
			$scope.cloneDgs = EC2Restangular.copy(dgs);
		}

		function save() {
			dgTraffickingService.save($scope.dgs).then(
				function (){
					updateState();
				}
			);
		}

		//region Button Action
		$scope.preview = function () {
			$scope.$broadcast(dgConstants.dgTreeBroadcastAction.preview);
		};

		$scope.createSubGroup = function () {
            $scope.dgs = $scope.$root.dgs;
			$scope.$broadcast(dgConstants.dgTreeBroadcastAction.newSubGroup);
		};

		$scope.enableDisableAds = function () {
			$scope.$broadcast(dgConstants.dgTreeBroadcastAction.disableEnable);
		};

		var disableEnableResolveEvent = $scope.$on(dgConstants.dgTreeBroadcastAction.disableEnableResolve, function (e, buttonState, dgId) {
			if(buttonState.action == dgConstants.disableEnableButtonAction.remove){
				delete dgsEnableDisableState[dgId];
				delete buttonState.action;
			}else{
				dgsEnableDisableState[dgId]=buttonState;
			}
			if(dgTraffickingService.isDisableEnable(dgsEnableDisableState)){
				$scope.buttonState.text = dgConstants.disableEnableButtonOptions.disableEnable;
			}else{
				$scope.buttonState =  _.values(dgsEnableDisableState)[0];
			}

		});

		$scope.remove = function () {
			var removedDgsFromTargetAudience = _.remove($scope.dgs, function(item) {
				if(item.selected){
					item.targetAudienceId = null;
				}
				return item.selected;
			});

			angular.forEach(removedDgsFromTargetAudience,function(dg){
				$scope.dgsWithoutTargetAudience.push(dg);
			});


			$scope.$broadcast(dgConstants.dgTreeBroadcastAction.remove);
		};

		$scope.callCreateNewDg = function(){
			createNewDg();
		};

		function createNewDg() {
			dgTraffickingService.createNewDg($scope.dgs, campaignId);
		}

		$scope.displayExistingDgs = function(){
			displayExistingDgs();
		}

		function displayExistingDgs(){
			dgTraffickingService.displayExistingDgs();
		}
		//endregion

		$scope.$on('$destroy', function () {
			if (disableEnableResolveEvent) {
				disableEnableResolveEvent();
			}
		});

	}]);
