 /**
 * Created by Alon.Shemesh 31/12/14
 */
'use strict';

app.controller('uploadFromWorkshopModalCtrl', ['$scope', 'enums', 'mmAlertService','EC2Restangular', 'EC2AMSRestangular', '$modal','$modalInstance','creativeConsts', 'entityMetaData', '$q', 'assetsLibraryService', '$state', '$stateParams', '$filter', 'mmUtils',
  function($scope, enums, mmAlertService, EC2Restangular, EC2AMSRestangular, $modal, $modalInstance, creativeConsts, entityMetaData,  $q, assetsLibraryService, $state, $stateParams, $filter, mmUtils){

    var serverAssets = EC2AMSRestangular.all('mediaPrep/uploadFromURL');
    var xOffset = 30;
    var yOffset = 15;
    $scope.isDisplaySteps = false;
    $scope.isMovingForwardOnly = true;
    $scope.entityPage = entityMetaData.masterAd.editPageURL;
    $scope.foreignKey = entityMetaData.masterAd.foreignKey;
    $scope.bannerDropDownItems = [];
    $scope.editMode = {val: false};
    $scope.newAds = [
        {adId:"",
		 name : $stateParams.name,
         url:$stateParams.file,
         adFormat: enums.adFormats.getName($stateParams.adFormat),
         thumbnail_url: $stateParams.thumb,
		 dimensions : $stateParams.dimensions,
		 size : $stateParams.size,
         folder : "",
         parsedFileSize : assetsLibraryService.parseSizeFromBytes($stateParams.size)}];

    $scope.selectFormatDisabled = {val: false};
    $scope.showSelectTab=true;
    $scope.imageHeight = '45';
    $scope.imageWidth = '45';
    $scope.selectedAssets = [];
    $scope.step = {val: 1};
    $scope.items = [];
    $scope.errorObj = {};
    $scope.state= {update : $stateParams.isNew ?  $stateParams.isNew == 'true' : false};
    $scope.isExist = _.find($scope.newAds, function(ad) {
													return ad.id == '';
											});
    $scope.gridColumns = [
        {displayName: 'Ad name'},
		{displayName: 'Update', savePage: true, update: $scope.state.update},
		{displayName: 'ID', review: true, exist: $scope.isExist},
        {displayName: 'Thumbnail'},
        {displayName: 'Format'},
		{displayName: 'Size'},
		{displayName: 'Dimensions'},
        {displayName: 'Ad Folder'}
    ];
    $scope.step = {val :''};
    $scope.buttonsDisabledState = {
      next: true
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
      $scope.isModalOpen = false;
			$state.go("spa.creativeCentralMain.adList");
    };


    $scope.onNext = function(){
    }


    $scope.save = function(){
      for (var i = 0; i < $scope.newAds.length; i++) {
        var ad = {"url": $scope.newAds[i].url,
            "name" : parseFileFromUrl($scope.newAds[i].url),
            "destinationFolder" : $scope.newAds[i].destinationFolder,
            "adId" :  $scope.newAds[i].adId,
            "adName" : $scope.newAds[i].name,
            "folder" : $scope.newAds[i].folder};
        serverAssets.post(ad).then(processData, processError);
        }
    }
    function processData(response){
        if(Array.isArray(response)){
          for (var i = 0; i < $scope.newAds.length; i++) {
              var ad = $scope.newAds[i];
              for (var j = 0; j < response.length; j++) {
                  if(ad.clientRefId === response[j].clientRefId){
                      ad.id = response[j].id;
                  }
              }
          }

          $scope.newAds = _.filter($scope.newAds, function(ad){
              return ad.id;
          });
          }else{
              var jsonResponse = JSON.parse(JSON.stringify(eval("(" + response.files + ")")));
            if(Array.isArray(jsonResponse)){
                for (var i = 0; i < jsonResponse.length; i++) {
                    for (var j = 0; j < jsonResponse[i].ads.length; j++) {
                        var ad =  jsonResponse[i].ads[j];
                    $scope.newAds[i].id = ad.id;
                    $scope.newAds[i].adName =  ad.fileName;
                    $scope.newAds[i].parsedFileSize = assetsLibraryService.parseSizeFromBytes( ad.fileSize);
                    }
                }
            }
            else{
                var ad = $scope.newAds[i];
            }
          }
        $scope.step.val = "success";
      }

    function processError(error){
      $scope.newAds = [];
      $scope.step.val = "finish";//"fail";
      //mmAlertService.addError(error);
    }
    function parseFileFromUrl(url){
        var n = (url.lastIndexOf("/") + 1);
        return url.substring(n);
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

    $scope.wizardSteps = [
      {
        "text":"Build ads",
        "templatePath":"adManagementApp/views/uploadFromWorkShop/saveAds.html",
        "onClick":onStepClick,
        "next":
        {
          "name":"create",
          "disable":false,
          "display":true,
          "onClick":$scope.save
        },
        "cancel":{
          "name":"cancel",
          "disable":false,
          "display":true,
          "onClick":$scope.cancel
        }
      },
      {
        "text":"Review",
        "templatePath":"adManagementApp/views/uploadFromWorkShop/summaryPage.html",
        "onClick":onStepClick,
        "cancel":{
          "name":"cancel",
          "display":false,
          "onClick": $scope.cancel
        },
        "done":{
          "name":"done",
          "onClick":$scope.cancel
        }
      }

    ];

    $scope.deleteAd = function(ad){
      $scope.newAds = _.filter($scope.newAds, function(ad){
        return !ad.selected;
      })
      if($scope.newAds.length === 0) {
          $scope.wizardSteps[1].next.disable = true;
      }
    }


    $scope.onNameEnter = function(ad){
      if(ad.name){
	    if($scope.errorObj[ad.clientRefId]){
        	$scope.errorObj[ad.clientRefId].adName = undefined;
				}
		if(ad.name.length > 0){
            var validationObject ={name : ad.name , adFormat : 'STANDARD_BANNER_AD', type : "StandardBannerAd", id:""}
            EC2Restangular.all('ads/validateAdNameUniqueness').post(validationObject).then(function(){},adNameError);
		}
	  }
     }


    function adNameError(error) {
          var error = error.data.error.errors[0];
          var errorMessage = $filter('T')(error.code.toString());
          if(error.params && error.params.length > 0){
              errorMessage = mmUtils.utilities.replaceParams(errorMessage,error.params);
              $scope.errors.adName = errorMessage;

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
}]);