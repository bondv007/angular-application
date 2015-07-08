/**
 * Created by Roi.Levy on 9/7/14.
 */
'use strict';

app.controller('massCreateAdCtrl', ['$scope', 'enums', 'mmAlertService','EC2Restangular','$modal','$modalInstance','mmModal','creativeConsts', 'entityMetaData', 'massCreateLogic', '$q', 'adService','$stateParams', '$timeout',
   function($scope, enums, mmAlertService, EC2Restangular, $modal, $modalInstance, mmModal, creativeConsts, entityMetaData, massCreateLogic, $q, adService, $stateParams, $timeout){

    var serverAds = EC2Restangular.all('ads');
    var xOffset = 30;
    var yOffset = 15;
    var creativeTypes = {
      defaultImage: "defaultImage",
      banner: "banner"
    }

    $scope.entityPage = entityMetaData.masterAd.editPageURL;
    $scope.foreignKey = entityMetaData.masterAd.foreignKey;
		$scope.imageDropDownItems = [];
    $scope.bannerDropDownItems = [{id: 0, name: "None"}];
    $scope.editMode = {val: false};
    $scope.newAds = [];
    $scope.obj = {
      adFormatType: "STANDARD_BANNER_AD"
    };
    $scope.selectFormatDisabled = {val: false};

    $scope.adFormats = _.filter(enums.adFormats, function(type){
      return type.id === "STANDARD_BANNER_AD" || type.id === "ENHANCED_STANDARD_BANNER_AD" || type.id === "RICH_MEDIA_BANNER_AD";
    })

    $scope.IsSingleFileUpload = false;
    $scope.showSelectTab=true;
    $scope.imageHeight = '35';
    $scope.imageWidth = '35';
    $scope.selectedAssets = [];

    $scope.selectImage = "Select Image";
    $scope.selectFlash = "Select Flash";

    $scope.selectedImages =  [];
    $scope.step = {val: 1};
    $scope.items = [];
    $scope.errorObj = {};
		$scope.isReview = {val: false}

		//grid
		$scope.buildAdsGridActions = [
			{
				name: "Select Assets",
				func: selectMultipleAssets,
				isDisable: false
			},
			{
				name: "New Ad",
				func: createNewAd,
				isDisable: false
			},
			{
				name: "Remove Ad",
				func: deleteAd,
				isDisable: false
			}
		]
    $scope.gridColumns = [
      {key: 'name', displayName: 'name', width: '200px'},
      {key: '', displayName: 'file', width: '340px'},
      {displayName: 'thumbnail', width: '100px'},
      {displayName: 'dimensions', width: '100px'},
      {displayName: 'Size', width: '100px'},
      {displayName: 'Click-through', width: '120px'}
    ];

    $scope.buttonsDisabledState = {
      next: true
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
      $scope.isModalOpen = false;
    };

    $scope.back = function(){
      //$scope.newAds = massCreateAds(cleanArray($scope.selectedAssets));
    };

    $scope.onNext = function(){
        //$scope.selectFormatDisabled = true;
    }

    $scope.save = function(){
      var valid = true;
      for (var i = 0; i < $scope.newAds.length; i++) {
        var ad = $scope.newAds[i];
        valid = validateAd(ad) && valid;
        if(valid && ad.banner && !ad.banner.assetId){
          ad.banner = null;
        }
      }
      if(valid){
        serverAds.post($scope.newAds).then(processSaveResponse, processError);
      }
      else{
        return false;
      }
    }

    $scope.showUploadAssetModal = function(selectedCreativeType, ad){

      if ($scope.isModalOpen) {
        return;
      }

      $scope.isModalOpen = true;

      var isSingleFileUpload =  selectedCreativeType ===  'massCreate' ? false : true;
      var adDetails = adService.getAdDetailsForUpload(isSingleFileUpload, true, selectedCreativeType, $scope.obj.adFormatType, null);
      var modalInstance = $modal.open({
        templateUrl: './adManagementApp/views/uploadAsset.html',
        controller: 'uploadAssetCtrl',
        backdrop: 'static',
        resolve: {
          adDetailsForUpload: function () {
            return adDetails;
          }
        }
      });

      modalInstance.result.then(function(selectedAssets) {
        $scope.selectedAssets = _.union($scope.selectedAssets, selectedAssets);
        if(!selectedAssets || selectedAssets.length === 0){
          $scope.isModalOpen = false;
          return;
        }
        if(selectedCreativeType === 'massCreate'){
          $scope.newAds = massCreateAds(cleanArray($scope.selectedAssets));
        }
        else{
          if(selectedAssets.length > 0){
            ad[selectedCreativeType] = massCreateLogic.assignAsset(selectedAssets[0]);
            addItemsToDropDowns(selectedCreativeType, selectedAssets);
            if(selectedAssets[0].mediaType === creativeConsts.mediaType.image && $scope.errorObj[ad.clientRefId]){
              $scope.errorObj[ad.clientRefId].defaultImage = undefined;
            }
            else if(selectedAssets[0].mediaType === creativeConsts.mediaType.flash && $scope.errorObj[ad.clientRefId]){
                $scope.errorObj[ad.clientRefId].banner = undefined;
            }
          }
        }
        $scope.isModalOpen = false;
      }, function () {
        $scope.isModalOpen = false;
      });
    }

    $scope.onFlashChange = function(ad, selectedCreativeType){
      var selectedAssets = [];
      if(selectedCreativeType === creativeTypes.defaultImage){
        selectedAssets = _.filter($scope.imageDropDownItems, {id: ad[selectedCreativeType].assetId});
        if($scope.errorObj[ad.clientRefId]){
          $scope.errorObj[ad.clientRefId].defaultImage = undefined;
        }
      }
      else if(selectedCreativeType === creativeTypes.banner){
        selectedAssets = _.filter($scope.bannerDropDownItems, {id: ad[selectedCreativeType].assetId});
          if($scope.errorObj[ad.clientRefId]){
              $scope.errorObj[ad.clientRefId].banner = undefined;
          }
      }

      if(selectedAssets.length > 0){
        if(!ad[selectedCreativeType].type){
          ad[selectedCreativeType].type = "AdAsset";
        }
        ad[selectedCreativeType].assetId = selectedAssets[0].id;
        ad[selectedCreativeType].assetName = selectedAssets[0].name;
        ad[selectedCreativeType].dimensions  = selectedAssets[0].dimensions;
        ad[selectedCreativeType].parsedFileSize = selectedAssets[0].parsedFileSize;
        ad[selectedCreativeType].size = selectedAssets[0].size;
        ad[selectedCreativeType].thumbnailUrl = selectedAssets[0].thumbnailUrl;// ? selectedAssets[0].thumbnailUrl : undefined; //"http://";
        ad[selectedCreativeType].mediaType = selectedAssets[0].mediaType;
      }
    }

    $scope.openAssetPreview = function(asset){

      if(!asset || !asset.assetId){
        return;
      }

      EC2Restangular.one('assetMgmt', asset.assetId).get().then(function(entity){
          $scope.selectedAdAsset = {asset: entity};

          var modalInstance = mmModal.open({
            templateUrl: './adManagementApp/views/assetPreviewModal.html',
            controller: 'AssetPreviewModalCtrl',
            title: "Asset Preview",
            confirmButton: { name: "ok", funcName:"ok", hide: true},
            discardButton: { name: "Close", funcName: "cancel" },
            scope: $scope
          });
        }
      )
    };

    $scope.showPreview = function (e) {
      angular.element("#preview").remove();
      var imgSrc = angular.element(e.target).attr("src");
      angular.element("body").append("<p id='preview'><img style='max-height:300px;max-width:300px;' src='" + imgSrc + "' alt='Image preview' />" + '<br/>' + "</p>");
      angular.element("#preview").css({"top": (e.pageY - xOffset) + "px", "left": (e.pageX + yOffset) + "px", "z-index": 99999}).show("slow");
    };

    $scope.adjustPreview = function (e) {
      angular.element("#preview").css({"top": (e.pageY - xOffset) + "px", "left": (e.pageX + yOffset) + "px", "z-index": 99999});
    };

    $scope.removePreview = function (e) {
      angular.element("#preview").remove();
    };

		function selectMultipleAssets(){
			if ($scope.isModalOpen) {
				return;
			}

			$scope.isModalOpen = true;

			var isSingleFileUpload = false;
			var adDetails = adService.getAdDetailsForUpload(isSingleFileUpload, true, 'massCreate', $scope.obj.adFormatType, null);
			var modalInstance = $modal.open({
				templateUrl: './adManagementApp/views/uploadAsset.html',
				controller: 'uploadAssetCtrl',
				backdrop: 'static',
				resolve: {
					adDetailsForUpload: function () {
						return adDetails;
					}
				}
			});

			modalInstance.result.then(function(selectedAssets) {
				//$scope.selectedAssets = _.union($scope.selectedAssets, selectedAssets);
				if(!selectedAssets || selectedAssets.length === 0){
					$scope.isModalOpen = false;
					return;
				}
				var newAds = massCreateAds(cleanArray(selectedAssets));
				$scope.newAds = $scope.newAds.concat(newAds);
				$scope.isModalOpen = false;
			}, function () {
				$scope.isModalOpen = false;
			});
		}

    function massCreateAds(selectedAssets) {

      if (!selectedAssets || selectedAssets.length === 0){
        mmAlertService.addError("No assets selected");
        return;
      }
      var newAds = [];
      var selectedImages = _.filter(selectedAssets, {mediaType:creativeConsts.mediaType.image});
			$scope.imageDropDownItems = $scope.imageDropDownItems.concat(fillDataModelItems(selectedImages, creativeConsts.mediaType.image));
//      if(!selectedImages || selectedImages.length === 0){
//        mmAlertService.addError("Please select at least one valid image");
//        return;
//      }
      var selectedBanners = _.filter(selectedAssets, {mediaType: creativeConsts.mediaType.flash});
			$scope.bannerDropDownItems = $scope.bannerDropDownItems.concat(fillDataModelItems(selectedBanners, creativeConsts.mediaType.flash));

      if(selectedImages.length < selectedBanners.length){
        newAds = massCreateLogic.createAdsFromFlashAssets(selectedImages, selectedBanners, $scope.$root.loggedInUserAccountId, $scope.obj.adFormatType);
      }
      else{
        newAds = massCreateLogic.createAdsFromImages(selectedImages, selectedBanners, $scope.$root.loggedInUserAccountId, $scope.obj.adFormatType);
      }

      massCreateLogic.validateAdsNameUnique(newAds, $scope.errorObj);
      $scope.wizardSteps[1].next.disable = false;
      $scope.selectFormatDisabled.val = true;
      return newAds;
    }

    function createDataModelItem(asset){
      var item = massCreateLogic.assignAsset(asset);
      //Drop down data model items need id+name to work
      item.name = asset.title;
      item.id = asset.id;
      return item;
    }

    function fillDataModelItems(selectedAssets, mediaType){
      var dataModelItems = [];
      for (var i = 0; i < selectedAssets.length; i++) {
        if(selectedAssets[i]){
          var item  = createDataModelItem(selectedAssets[i]);
          dataModelItems.push(item);
        }
      }
      return dataModelItems;
    }

    function addItemsToDropDowns(selectedCreativeType, newItems){
      switch (selectedCreativeType){
        case creativeTypes.defaultImage:
          $scope.imageDropDownItems = $scope.imageDropDownItems.concat(fillDataModelItems(newItems,creativeConsts.mediaType.image));
          $scope.imageDropDownItems = _.uniq($scope.imageDropDownItems , 'id');
          break;
        case creativeTypes.banner:
          $scope.bannerDropDownItems =  $scope.bannerDropDownItems.concat(fillDataModelItems(newItems, creativeConsts.mediaType.flash));
          $scope.bannerDropDownItems =  _.uniq($scope.bannerDropDownItems , 'id');
          break;
        default :
          break;
      }
    }

    function assignAdsToCampaign(campaignId, adIds){
      var assignMessageBody = [];
      assignMessageBody.push(campaignId);
      assignMessageBody = assignMessageBody.concat(adIds);
      var attachAds = EC2Restangular.all('ads/assignMasterAd/Campaign');
      $timeout(function () {
        attachAds.customPOST({entities: assignMessageBody}).then(processAssignResponse,processError);
      }, 1000);
    }

    function processArrayResult(response){
      var newAdsIds = [];
      for (var i = 0; i < $scope.newAds.length; i++) {
        var ad = $scope.newAds[i];
        for (var j = 0; j < response.length; j++) {
          if(ad.clientRefId === response[j].clientRefId){
            ad.id = response[j].id;
            newAdsIds.push(ad.id);
          }
        }
      }
      $scope.newAds = _.filter($scope.newAds, function(ad){
        return ad.id;
      });
      if ($stateParams.campaignId){
        assignAdsToCampaign($stateParams.campaignId, newAdsIds);
      }
      else{
        mmAlertService.addSuccessOnTop(response.length + " ads created successfully.");
        $scope.isReview.val = true;
      }
    }

    function processSingleEntity(response){
      $scope.newAds[0].id = response.id;
      if ($stateParams.campaignId){
        assignAdsToCampaign($stateParams.campaignId, [response.id]);
      }
      else{
        mmAlertService.addSuccess("1 ad created successfully.");
        $scope.isReview.val = true;
      }
    }

    function processAssignResponse(response){
      if(response.length > 1){
        mmAlertService.addSuccessOnTop(response.length + " ads created successfully.");
      }
      else{
        mmAlertService.addSuccess("1 ad created successfully.");
      }
      $scope.isReview.val = true;
    }

	  function processSaveResponse(response){
		  if(Array.isArray(response)){
        processArrayResult(response);
		  }
      else{
        processSingleEntity(response)
		  }
	  }

    function processError(error){
      $scope.newAds = [];
			$scope.isReview.val = true;
    }

    function cleanArray(actual){
      var newArray = new Array();
      for(var i = 0; i<actual.length; i++){
        if (actual[i]){
          newArray.push(actual[i]);
        }
      }
      return newArray;
    }

    function validateAd(ad){
      var isValid = true;
      var adNameUniqueMsg = '';
      if($scope.errorObj[ad.clientRefId] && $scope.errorObj[ad.clientRefId].adName){
        adNameUniqueMsg = $scope.errorObj[ad.clientRefId].adName;
        isValid = false;
      }
      $scope.errorObj[ad.clientRefId] = {};
      if(!massCreateLogic.validateBeforeSave(ad, $scope.errorObj[ad.clientRefId])){
        isValid = false;
      }
      if(!$scope.errorObj[ad.clientRefId].adName){
        $scope.errorObj[ad.clientRefId].adName = adNameUniqueMsg;
      }

      if(!isValid){
        mmAlertService.addError("Please fix errors below");
      }
      return isValid;
    }

    function confirmBackStep() {
      var deferred = $q.defer();

      var modalInstance = $modal.open({
          templateUrl: './adManagementApp/views/massCreateAd/alertMessage.html',
          controller: 'alertMessageCtrl',
          backdrop: 'static',
          resolve: {
              headerText: function(){
                  return "MassCreate_ChangesLossAlertHeader";
              },
              bodyMessage: function(){
                  return "MassCreate_ChangesLossAlertBody"
              }
          }
      });

      modalInstance.result.then(function() {
          $scope.isDiscardModalOpen = false;
          deferred.resolve();
      }, function () {
          $scope.isDiscardModalOpen = false;
          deferred.reject();
      });

      return deferred.promise;
  }

    //wizard
    var onStepClick = function(){
      return false;
    }
    $scope.isMovingForwardOnly = true;
    $scope.wizardSteps = [
      {
        "text":"Select Settings",
        "templatePath":"adManagementApp/views/massCreateAd/introPage.html",
        "onClick":onStepClick,
        "next":
        {
          "name":"select assets",
          "disable":false,
          "onClick": $scope.onNext
        },
        "cancel":{
          "name":"cancel",
          "disable":false,
          "display":true,
          "onClick":$scope.cancel
        }
      },
      {
        "text":"Build ads",
        "templatePath":"adManagementApp/views/massCreateAd/buildAds.html",
        "onClick":onStepClick,
        "next":
        {
          "name":"next",
          "disable":true,
          "display":true,
          "onClick":$scope.save
        },
        "back":{
          "name":"back",
          "display": false
        },
        "cancel":{
          "name":"cancel",
          "disable":false,
          "display":true,
          "onClick":$scope.cancel
        }
      },
      {
        "text":"Review Ads",
        "templatePath":"adManagementApp/views/massCreateAd/reviewAds.html",
        "onClick":onStepClick,
        "cancel":{
          "name":"cancel",
          "display":false,
          "onClick":''
        },
        "back":{
          "name":"back",
          "disable":true,
          "onClick":''
        },
        "done":{
          "name":"done",
          "onClick":$scope.cancel
        }
      }

    ];

    $scope.onAdClick = function(ad){
      ad.selected = !ad.selected;
    }

		function deleteAd(){
			$scope.newAds = _.filter($scope.newAds, function(ad){
				return !ad.selected;
			})
			if($scope.newAds.length === 0) {
				$scope.wizardSteps[1].next.disable = true;
			}
      $scope.isAllSelected.val = false;
		}

		function createNewAd(){
			$scope.newAds.push(massCreateLogic.createNewAd($scope.obj.adFormatType, $scope.$root.loggedInUserAccountId));
			$scope.wizardSteps[1].next.disable = false;
      $scope.isAllSelected.val = false;
		}

    $scope.onNameEnter = function(ad){
      if(!ad.name && $scope.errorObj[ad.clientRefId]){
        $scope.errorObj[ad.clientRefId].adName = "Name is required.";
      }
      else if($scope.errorObj[ad.clientRefId]){
        $scope.errorObj[ad.clientRefId].adName = undefined;
      }
      massCreateLogic.validateAdsNameUnique([ad], $scope.errorObj);
    }

    $scope.formatSelected = function(selectedFormat){
        $scope.obj.adFormatType = selectedFormat;
    }

    $scope.isAllSelected = {val: false};
    $scope.selectAllAds = function(){
      $scope.isAllSelected.val = !$scope.isAllSelected.val;
      for (var i = 0; i < $scope.newAds.length; i++) {
        $scope.newAds[i].selected = $scope.isAllSelected.val;
      }
    }
}]);
