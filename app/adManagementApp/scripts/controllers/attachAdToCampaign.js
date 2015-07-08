/**
 * Created by alon.shemesh on 4/17/14.
 */

'use strict';

app.controller('attachAdToCampaignCtrl', ['$scope',  '$modalInstance', 'EC2Restangular', 'ads','accounts', 'campaigns', 'mmAlertService', 'multipleAttach', 'enums', '$filter',
	function ($scope, $modalInstance, EC2Restangular, ads,accounts, campaigns, mmAlertService, multipleAttach, enums, $filter) {
    $scope.multipleAttach = multipleAttach;
    $scope.grid = {
            campaigns: [],
            selectedCampaigns: [],
            filteredItemCount :"",
            filterText :""
            //assignedSelectedCampaigns: [],
            //assigned: []

    };
    $scope.accounts = accounts;
    $scope.adID2campID = "";
    $scope.ads = ads;
    $scope.allowMultiCampaign = { val: false};
    onPageLoad(campaigns);
    //This should be removed once we allow multi campaign attachment
    $scope.buttonStatus= {disableConfirmButton : true};
    $scope.assignDisabled = { val: false };
    $scope.unAssignDisabled = {val: false};
    $scope.campaignsColumns = [
        {field: 'nameId', displayName: 'Campaign'},
        {field: 'relationsBag.accountIdName', displayName: 'Campaign Manager', width:300},
        {field: 'relationsBag.advertiserIdName', displayName: 'Advertiser', width:300}

    ];
		$scope.traffickingMode = ""
//	$scope.assignedcampaignsColumns = _.clone($scope.campaignsColumns);
//	$scope.assignedcampaignsColumns.unshift({field: 'id', displayName: 'ID', width:80});
//	$scope.selectedCampaigns = [];
  var campaignIdsToUnAssign = [];


  function onPageLoad(campaigns){
    if(campaigns) {
      for (var i = 0; i < campaigns.length; i++) {
        campaigns[i].nameId = campaigns[i].name + ' (' + campaigns[i].id + ')';
        campaigns[i].relationsBag.accountIdName = campaigns[i].relationsBag.parents.account.name + ' (' + campaigns[i].relationsBag.parents.account.id + ')';
        campaigns[i].relationsBag.advertiserIdName = campaigns[i].relationsBag.parents.advertiser.name + ' (' + campaigns[i].relationsBag.parents.advertiser.id + ')';
      }
    }
        $scope.grid.campaigns = campaigns;
      _.each($scope.ads, function(ad){
					var campaign = _.findWhere($scope.grid.campaigns, {'id':ad.adAssignmentData.campaignId});
					if(campaign  != undefined){
						campaign.selectEnabled = false;
						$scope.grid.selectedCampaigns.push(campaign);
        }
    });
  }

  $scope.save = function() {

    if(!$scope.grid.campaigns || !$scope.ads){
      return;
    }

    var adIds  = _.pluck($scope.ads, "id");

		//var selectedCampaigns = _.pluck($scope.grid.selectedCampaigns, "id");
		//var assigned = _.pluck($scope.grid.assigned, "id");
		//var assignedSelectedCampaigns = _.pluck($scope.grid.assignedSelectedCampaigns, "id");

		var campaignsToAssign = _.xor($scope.grid.selectedCampaigns, $scope.grid.assigned);
		var campaignsToUnAssign = _.xor($scope.grid.assigned, $scope.grid.assignedSelectedCampaigns);

		if(campaignsToAssign.length == 0 && campaignsToUnAssign == 0){
			mmAlertService.addError("No campaigns selected to attach or detach.");
			return;
		}
		$scope.grid.adIds = adIds;
		$scope.grid.campaignsToAssign = campaignsToAssign;
		unAssignAndAssign(adIds, campaignsToUnAssign, campaignsToAssign);
	}

	function unAssignAndAssign(adIds, campaignsToUnAssign, campaignsToAssign){

		if(!adIds || adIds.length == 0){
			return;
		}

		if(campaignsToUnAssign && campaignsToUnAssign.length > 0){
			adIds.unshift(campaignsToUnAssign[0].id);
			var detachAds = EC2Restangular.all('ads/assignMasterAd/Advertiser');
			detachAds.customPOST({entities: adIds}).then(afterUnAssign, processError);
		}
		else{
			assignAds(adIds, campaignsToAssign);
		}
	}

	function assignAds(adIds, campaignsToAssign){
		if(campaignsToAssign && campaignsToAssign.length > 0){
			adIds.unshift(campaignsToAssign[0].id);
			$scope.traffickingMode = campaignsToAssign[0].adminSettings.campaignSettings.traffickingMode;
			var attachAds = EC2Restangular.all('ads/assignMasterAd/Campaign');
			attachAds.customPOST({entities: adIds}).then(processData, processError);
		}else{
			$modalInstance.close();
		}
	}


  function afterUnAssign(data){
    $scope.isAfterSave = true;
    mmAlertService.addSuccess("You successfully unAssigned ad.");

    ads[0].campaignId = data[0].campaignId;

    assignAds($scope.grid.adIds, $scope.grid.campaignsToAssign);
  }

	function processError(error) {
		console.log("ERROR: " + JSON.stringify(error));
        $modalInstance.close();
	}

	function processData(data) {
		$scope.isAfterSave = true;
		var sref = "";
		var ad = data[0];
		if($scope.traffickingMode === "AdvancedMode"){
			sref = "spa.campaign.servingStrategies({campaignId:'" + ad.adAssignmentData.campaignId + "'})";
		}
		else{
			sref = "spa.campaign.attachmentCentral({campaignId:'" + ad.adAssignmentData.campaignId + "'})";

		}
    mmAlertService.addSuccess("The ad(s) were successfully assigned to the campaign. You can proceed to", sref, "traffic the ad(s).");
		$modalInstance.close(data);
	}

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

    $scope.selectedRow = function(){
        $scope.buttonStatus.disableConfirmButton = $scope.grid.selectedCampaigns.length > 0;
    }
    $scope.disableButton = function(){
        return $scope.buttonStatus.disableConfirmButton;
    }

    $scope.gridScrollHandler = function () {
      campaigns.readNext(true).finally(function() {
        onPageLoad(campaigns);
      });
    }

    $scope.setDataModel = function(isFiltered){
      var temp;
      if(isFiltered){
        temp = $filter('filter')(campaigns, $scope.grid.filterText);
        if (!!campaigns) {
          var currentTemp = temp;
          var params = campaigns.lastRequestParams || campaigns.reqParams || {};
          params['q'] = $scope.grid.filterText;
          if( $scope.grid.filterText != ''){
            params['from'] = "0";
          }
          temp = campaigns.getList(params).then(function(newResponse){
            for(var i = currentTemp.length - 1; i > 0; i--){
              var where = {};
              where[$scope.mmOptionId] = currentTemp[i][$scope.mmOptionId];
              if (!_.find(newResponse, where)) {
                newResponse.unshift(currentTemp[i]);
              }
            }

            campaigns.length = 0;
            newResponse.forEach(function(item){
              campaigns.push(item);
            });
            onPageLoad(campaigns);
            newResponse = $scope.addPleaseSelect(campaigns);
            return newResponse;
          });
        }
      }else{
        temp = campaigns;
      }
      }
	/*$scope.rowSelectFromGrid = function(row){
		if( $scope.grid.selectedCampaigns.length - $scope.grid.assigned.length> 0 && $scope.grid.selectedCampaigns[$scope.grid.selectedCampaigns.length-1].id === row.id ){
			$scope.grid.selectedCampaigns.splice(($scope.grid.selectedCampaigns.length -2),1)
		}
			console.log(row)
	}*/
}]);
