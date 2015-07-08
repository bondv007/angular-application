'use strict';

app.controller('campaignEditCtrl', ['$scope', '$state', '$stateParams', 'EC2Restangular', 'mmAlertService', 'mmModal', 'entityMetaData',
	function ($scope, $state, $stateParams, EC2Restangular, mmAlertService, mmModal, entityMetaData) {
    $scope.contacts = {
      agencies:{items:[]},
      creativeAccounts: {items:[]},
      sites: {items:[]},
      platform: {items:[]}
    }
    $scope.labelWidth = 135;
    $scope.creativeAccounts = {items: [], selectedItems: []};
    $scope.$root.mmIsPageDirty = 0;
		$scope.campaignId = $stateParams.campaignId;
		$scope.pageReady = false;
    $scope.isEditMode = true;
		$scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
		$scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true};
		$scope.dataObj = {};
    $scope.dataObj.accountId = "";
    $scope.dataObj.advertiserAccountId = "";
    $scope.error = { name: "", account: "", advertiser: "", brand: "" };

    $scope.showSPinner = true;
    var serverCampaigns = EC2Restangular.all('campaigns');
    var serverAccounts = EC2Restangular.all('accounts').all('global');;
    var serverAdvertisers = EC2Restangular.all('advertisers');
    var serverBrands = EC2Restangular.all('brands');

    serverAccounts.getList().then(function(data){
      $scope.accountsOrig = data;
      generateListData(true);
    }, processError);
    serverAdvertisers.getList().then(function(data){
      $scope.advertisersOrig = data;
      generateListData(true);
    }, processError);
    serverBrands.getList().then(function(data){
      $scope.brandsOrig = data;
      generateListData(true);
    }, processError);

    function generateListData(shouldUpdateState){
      if($scope.accountsOrig === undefined || $scope.advertisersOrig === undefined  || $scope.brandsOrig === undefined){
        return;
      }
      var counter = 0;
      $scope.brandIndex = [];
      $scope.brandsList = [];

      for(var i = 0; i < $scope.brandsOrig.length; i++){
        if(!!$scope.brandsOrig[i].brandAdvertiserAccounts){
          for(var k = 0; k < $scope.brandsOrig[i].brandAdvertiserAccounts.length; k++){
            $scope.brandsList[counter] = {};
            $scope.brandsList[counter].id = $scope.brandsOrig[i].brandAdvertiserAccounts[k].id;
            $scope.brandsList[counter].name = $scope.brandsOrig[i].brandAdvertiserAccounts[k].name;
            $scope.brandsList[counter].advertiserAccountId = $scope.brandsOrig[i].brandAdvertiserAccounts[k].advertiserAccountId;

            $scope.brandIndex[$scope.brandsOrig[i].brandAdvertiserAccounts[k].id] = {
              "name": $scope.brandsOrig[i].brandAdvertiserAccounts[k].name,
              "advertiserAccountId": $scope.brandsOrig[i].brandAdvertiserAccounts[k].advertiserAccountId
            };
            counter++;
          }
        }
      }

      $scope.brands = $scope.brandsList;
      $scope.brands.indexed = $scope.brandIndex;

      counter = 0;
      $scope.advertiserIndex = [];
      $scope.advertisersList = [];
      for(var i = 0; i < $scope.advertisersOrig.length; i++){
        if(!!$scope.advertisersOrig[i].advertiserAccounts){
          for(var k = 0; k < $scope.advertisersOrig[i].advertiserAccounts.length; k++){
            $scope.advertisersList[counter] = {};
            $scope.advertisersList[counter].id = $scope.advertisersOrig[i].advertiserAccounts[k].id;
            $scope.advertisersList[counter].name = $scope.advertisersOrig[i].advertiserAccounts[k].name;
            $scope.advertisersList[counter].accountId = $scope.advertisersOrig[i].advertiserAccounts[k].accountId;

            $scope.advertiserIndex[$scope.advertisersOrig[i].advertiserAccounts[k].id] = {
              "name": $scope.advertisersOrig[i].advertiserAccounts[k].name,
              "accountId": $scope.advertisersOrig[i].advertiserAccounts[k].accountId
            }
            counter++;
          }
        }
      }
      $scope.advertisers = $scope.advertisersList;
      $scope.advertisers.indexed = $scope.advertiserIndex;

      $scope.accountIndex = [];
      for(var i = 0; i < $scope.accountsOrig.length; i++){
        $scope.accountIndex[$scope.accountsOrig[i].id] = $scope.accountsOrig[i].name;
      }

      counter = 0;
      var addedAccounts = [];
      $scope.accountsList = [];
      for(var i = 0; i < $scope.advertisersList.length; i++){
        if(!_.contains(addedAccounts, $scope.advertisersList[i].accountId)){
          addedAccounts.push($scope.advertisersList[i].accountId);
          $scope.accountsList[counter] = {};
          $scope.accountsList[counter].id = $scope.advertisersList[i].accountId;
          $scope.accountsList[counter].name = $scope.accountIndex[$scope.advertisersList[i].accountId];
          counter++;
        }
      }
      $scope.accounts = $scope.accountsList;
      $scope.accounts.indexed = $scope.accountIndex;

      if(shouldUpdateState){
        updateState();
      }
    };

    if(!!$scope.campaignId && $scope.campaignId.length > 0){
      serverCampaigns.get($scope.campaignId).then(
        function(data) {
          $scope.$parent.mainEntity = data;
          $scope.showSPinner = false;
        },
        processError);
    } else {
      updateState();
    }

    $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
      if (newValue != oldValue || oldValue == null) {
        updateState();
				initialAddCampaign();
      }
    });

		function initialAddCampaign(){
			if ($scope.$parent && $scope.$parent.mainEntity != null) return;

			$scope.dataObj.accountId = null;
			$scope.dataObj.advertiserAccountId = null;
			$scope.campaignEdit.brandAccountAdvertiserId = null;
		}

		function updateState() {
			if ($scope.$parent && $scope.$parent.mainEntity != null) {
        $scope.error = { name: "", account: "", advertiser: "", brand: "" };
        $scope.isEditMode = true;
				$scope.campaign = $scope.$parent.mainEntity;
				$scope.campaignEdit = EC2Restangular.copy($scope.$parent.mainEntity);
        generateListData(false);
        $scope.brandChange();

        $scope.creativeAccountsToAdd = [];
        if($scope.isEditMode && $scope.campaignEdit.relations != null && $scope.campaignEdit.relations.ids != null && !!$scope.accounts){
          $scope.contacts.creativeAccounts.items = [];
          for(var i = 0; i < $scope.campaignEdit.relations.ids.length; i++){
            $scope.contacts.creativeAccounts.items.push($scope.campaignEdit.relations.ids[i]);
            $scope.creativeAccountsToAdd.push({
              id: $scope.campaignEdit.relations.ids[i],
              name: $scope.accounts.indexed[$scope.campaignEdit.relations.ids[i]]
            })
          }
          $scope.creativeAccounts.items = $scope.creativeAccountsToAdd;
        }

			} else {
        $scope.accounts = $scope.accountsList;
        $scope.advertisers = $scope.advertisersList;
        $scope.brands = $scope.brandsList;
        $scope.isEditMode = false;
				$scope.campaign = null;
				$scope.campaignEdit = {
					name: "",
          brandAccountAdvertiserId: "",
					type: "Campaign"
				};
			}
			$scope.pageReady = $scope.campaignEdit != null;
		}

		function save() {

      if(!saveValidation()){
        return;
      }

      $scope.error = { name: "", account: "", advertiser: "", brand: "" };
      if($scope.isEditMode){
        return $scope.campaignEdit.put().then(
          function(data){
            saveCampaignRelations(data);
						return data;
          },
          function(error){
            mmAlertService.addError('Save', 'Updating the campaign has failed');
            processError(error);
						return error;
          });
      }else{
        return serverCampaigns.post($scope.campaignEdit).then(
          function(data){
            mmAlertService.addSuccess('Save', 'You successfully created thr campaign');
            saveCampaignRelations(data);
						return data;
          },
          function(error){
            mmAlertService.addError('Save', 'Updating the campaign has failed');
            processError(error);
						return error;
          });
      }
		}

    function saveValidation(){

      var isValid = true;
      if(!$scope.campaignEdit.name){
        isValid = false;
        $scope.error.name = "Name is required";
      }

      if(!$scope.dataObj.accountId){
        isValid = false;
        $scope.error.account = "Account is required";
      }

      if(!$scope.dataObj.advertiserAccountId){
        isValid = false;
        $scope.error.advertiser = "Advertiser is required";
      }

      if(!$scope.campaignEdit.brandAccountAdvertiserId){
        isValid = false;
        $scope.error.brand = "Brand is required";
      }

      return isValid;
    }

    function saveCampaignRelations(data){
      EC2Restangular.all('campaigns').get(data.id).then(function(campaign){
        if(!campaign.hasOwnProperty('relations')){
          console.error('The campaign relation object is null. Data: ' + campaign);
          mmAlertService.addError('Save', 'Saving the campaign failed');
          return;
        }
        campaign.relations.ids = [];
        campaign.relations.ids = $scope.contacts.creativeAccounts.items.slice();
        return EC2Restangular.one(entityMetaData.campaignRelations.restPath, campaign.relations.id)
          .customPUT({entities: [campaign.relations]})
          .then(function(rel){
            $scope.$root.mmIsPageDirty = 0;
            $scope.showSPinner = false;
            mmAlertService.addSuccess('Save', 'You successfully attached creative accounts to the campaign');
            if($scope.isEditMode){
              $scope.$parent.mainEntity = campaign;
              updateState();
            } else {
              if (!$scope.entralEntity){
                $state.go("spa.campaign.campaignEdit", {campaignId: data.id}, {location : "replace"});
              }
            }
          }, processError);
      });
    }

    function processError(error) {
      console.log('ohh no!');
      console.log(error);
      $scope.showSPinner = false;
      if (error.data.error === undefined) {
        mmAlertService.addError("Message", "Server error. Please try again later.", false);
      } else {
        mmAlertService.addError("Message", error.data.error, false);
      }
    }

    function cancel() {
      updateState();
    }

    $scope.columnDefs = [
			{field: 'id', displayName: 'ID'},
			{field: 'name', displayName: 'Name'}
		]

    $scope.openAttachModal = function(){
      if ($scope.isModalOpen) {
        return;
      }
      $scope.isModalOpen = true;
      var modalInstance = mmModal.open({
        templateUrl: './admin/views/attachCreativeAccounts2campaign.html',
        controller: 'attachCreativeAccounts2campaign',
        title: $scope.campaignEdit.name + ': Attach Creative Accounts',
        confirmButton: { name: "Attach", funcName: "attach", hide: false},
        discardButton: { name: "Cancel", funcName: "cancel" },
        resolve: {
          campaign: function() {
            return $scope.campaignEdit;
          },
          accounts: function(){
            return $scope.accountsOrig;
          },
          isCentralMode: function() {
            return false;
          },
          isEditMode: function(){
            return $scope.isEditMode;
          },
          accountsToAdd: function(){
            return $scope.contacts;
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.creativeAccounts.items = []
        for(var i = 0; i < $scope.contacts.creativeAccounts.items.length; i++){
          $scope.creativeAccounts.items.push({
            id: $scope.contacts.creativeAccounts.items[i],
            name: $scope.accountIndex[$scope.contacts.creativeAccounts.items[i]]
          });
        }
        $scope.isModalOpen = false;
      }, function () {
        console.log('cancel');
        $scope.isModalOpen = false;
      });
    }

    $scope.removeCreativeAccount = function(){
      for(var i = 0; i < $scope.creativeAccounts.selectedItems.length; i++){
        $scope.contacts.creativeAccounts.items.splice($scope.contacts.creativeAccounts.items.indexOf($scope.creativeAccounts.selectedItems[i].id), 1);
        $scope.creativeAccounts.items.splice($scope.creativeAccounts.items.indexOf($scope.creativeAccounts.selectedItems[i]), 1);
      }
    }

    $scope.accountChange = function(){
      if(!!$scope.dataObj && !!$scope.advertisersList){
        var indexedAdvertisers = $scope.advertisers.indexed;
        var indexedBrands = $scope.brands.indexed;
        if(!!$scope.dataObj.accountId){
          $scope.advertisers = _.where($scope.advertisersList, {'accountId': $scope.dataObj.accountId});

          if(!!$scope.brandsList){
            $scope.brands = [];
            for(var i = 0; i < $scope.advertisers.length; i++){
              $scope.brands = $scope.brands.concat(_.where($scope.brandsList, {'advertiserAccountId': $scope.advertisers[i].id}));
            }
          }

        } else {
          $scope.advertisers = $scope.advertisersList;
        }
        $scope.advertisers.indexed = indexedAdvertisers;
        $scope.brands.indexed = indexedBrands;

        var setToNull = true;
        for(var i = 0; i < $scope.advertisers.length; i++){
          if($scope.advertisers[i].id == $scope.dataObj.advertiserAccountId){
            setToNull = false;
          }
        }
        if(setToNull){
          $scope.dataObj.advertiserAccountId = null;
        }

        setToNull = true;
        for(var i = 0; i < $scope.brands.length; i++){
          if($scope.brands[i].id == $scope.campaignEdit.brandAccountAdvertiserId){
            setToNull = false;
          }
        }
        if(setToNull){
          $scope.campaignEdit.brandAccountAdvertiserId = null;
        }
      }
    }

    $scope.advertiserChange = function(){
      if(!!$scope.dataObj && !!$scope.brandsList && $scope.dataObj.advertiserAccountId !== null){
        var indexedBrands = $scope.brands.indexed;
        if(!!$scope.dataObj.advertiserAccountId){
          $scope.brands = _.where($scope.brandsList, {'advertiserAccountId': $scope.dataObj.advertiserAccountId});
        } else {
          $scope.brands = $scope.brandsList;
        }
        $scope.brands.indexed = indexedBrands;

        var setToNull = true;
        for(var i = 0; i < $scope.brands.length; i++){
          if($scope.brands[i].id == $scope.campaignEdit.brandAccountAdvertiserId){
            setToNull = false;
          }
        }
        if(setToNull){
          $scope.campaignEdit.brandAccountAdvertiserId = null;
        }
      }
    }

    $scope.brandChange = function(){
      if(!!$scope.dataObj && !!$scope.campaignEdit && !!$scope.brands && !!$scope.advertisers && $scope.campaignEdit.brandAccountAdvertiserId !== null){
        $scope.dataObj.advertiserAccountId = $scope.brands.indexed[$scope.campaignEdit.brandAccountAdvertiserId].advertiserAccountId;
        if(!!$scope.dataObj.advertiserAccountId){
          $scope.dataObj.accountId = $scope.advertisers.indexed[$scope.dataObj.advertiserAccountId].accountId;
        }
      }
    }
	}]);
