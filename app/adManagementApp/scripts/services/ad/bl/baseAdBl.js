/**
 * Created by roi.levy on 10/6/14.
 */
'use strict';
app.factory('baseAdBl', [ 'adValidator', 'validationHelper', 'adService',  '$q', 'mmAlertService', 'mmModal', '$state', 'enums',
	function(adValidator, validationHelper, adService, $q, mmAlertService, mmModal, $state, enums) {

		var enableDeleteButton = function(ads){
			if(!ads.length || ads.length === 0){
				return true;
			}

			for(var i=0; i < ads.length; i++){
				var isDisable = checkNumberOfPlacementAds(ads[i]);
				if(isDisable){
					return true;
				}
			}
			return false;
		}

		var checkNumberOfPlacementAds = function (item){
			if(item.numberOfPlacementAds > 0){
				return true;
			}
			return false;
		}

		var setInitialSize = function(ad){
			ad.initialSize = ad.defaultImage ? ad.defaultImage.size : 0;
		}

		var validateBeforeSave = function(ad, errors, isMultiple, isDefaultImage){
			var isValid = true;

			if (!ad.name){
				isValid = false;
				errors.adName= "Name is required";
			}

      if(!isDefaultImage) {
        if (!ad.defaultImage || (!isMultiple && !ad.defaultImage.assetId)) {
          isValid = false;
          errors.creativeAssets = "You must supply a default image.";
          errors.defaultImage = "Default image is mandatory";
        }
        else if (!adValidator.validateImage(ad.defaultImage, errors)) {
          isValid = false;
        }
      }

			if(!ad.masterAdId && !adValidator.validateCustomInteractions(ad.customInteractions)){
				isValid = false;
			}

			if(ad.mainClickthrough.url && !adValidator.validateClickUrl(ad.mainClickthrough.url, isMultiple, errors)){
				isValid = false;
			}

      if(ad.adURLs){
        for (var i = 0; i < ad.adURLs.length; i++ ) {
          var adUrl = ad.adURLs[i];
          if(!adUrl.url || !adValidator.validateClickUrl(adUrl.url, isMultiple, {})){
            errors.adURLs = "Enter valid URL";
            isValid = false;
            break;
          }
        }
      }


			return isValid;
		}

    var  prepareSaveData = function(ad){
      prepareThirdPartyForSave(ad.adURLs);
    }

		var resetSize = function(ad){
			if(ad)
				ad.overallSize = 0;
			ad.pricingSize = 0;
		}

    function duplicateAds(adsList, selectedItems) {
      var newAdId = '';
      var adIds = _.pluck(selectedItems, 'id');
      adService.duplicateAds(adIds).then(function(response){
        for (var i = 0; i < response.length; i++) {
          var obj = response[i];
          adsList.push(obj);
        }
        adsList.refreshCentral();
        if(response.length === 1){
          newAdId = response[0].id;
          var sref = "spa.ad.adEdit({adId:'" + newAdId + "'})";
          mmAlertService.addSuccess("Ad was successfully duplicated. You can now", sref, "edit the new ad.");
        }
        else{
          mmAlertService.addSuccess("Ads were successfully duplicated.");
        }

      });
    }

    function deleteAds(adsList, selectedItems) {
      var deferred = $q.defer();
      var modalInstance = mmModal.openAlertModal("DeleteAlertTitle", "DeleteAlertMessage");
      modalInstance.result.then(function() {
        adService.deleteAds(selectedItems).then(function(deletedIds){
          for (var i = 0; i < deletedIds.length; i++ ) {
            var deletedAdId = deletedIds[i];
            for (var j = adsList.length - 1; j >=0; j--) {
              var ad = adsList[j];
              if(ad.id === deletedAdId){
                adsList.splice(j,1);
              }
            }
          }
          adsList.refreshCentral();
          mmAlertService.addSuccess("Ads successfully deleted");
          deferred.resolve();
        });
      })
      return deferred.promise;
    }

    function deleteAdIDs(adIds){
      var modalInstance = mmModal.openAlertModal("DeleteAlertTitle", "DeleteAlertMessage");
      modalInstance.result.then(function() {
        adService.deleteAdIDs(adIds).then(function(deletedIds){
          mmAlertService.addSuccess("Ads successfully deleted");
        });
      })
    }

    function duplicateAdIDs(adIds) {
      var newAdId = '';
      adService.duplicateAds(adIds).then(function(response){
        if(response.length === 1){
          newAdId = response[0].id;
          var sref = "spa.ad.adEdit({adId:'" + newAdId + "'})";
          mmAlertService.addSuccess("Ad was successfully duplicated. You can now", sref, "edit the new ad.");
        }
        else{
          mmAlertService.addSuccess("Ads were successfully duplicated.");
        }

      });
    }

    function preparePanelSettingsForSave(ad) {
      if (ad.panelsSettings && ad.panelsSettings.panelFrequency && ad.panelsSettings.defaultPanelFrequency == "UNLIMITED") {
        ad.panelsSettings.panelFrequency = "UNLIMITED";
      }
    }

    function fillEventTypes(ad) {
      if(ad && ad.adURLs){
        for ( var i = 0; i < ad.adURLs.length; i++ ) {
          var obj = ad.adURLs[i];
          obj.gridListDataArray = enums.urlTypes;
        }
      }
    }

    return {
			validateBeforeSave: validateBeforeSave,
			setInitialSize: setInitialSize,
			resetSize: resetSize,
			enableDeleteButton: enableDeleteButton,
			checkNumberOfPlacementAds: checkNumberOfPlacementAds,
			duplicateAds: duplicateAds,
      deleteAds: deleteAds,
      deleteAdIDs: deleteAdIDs,
      duplicateAdIDs: duplicateAdIDs,
      prepareSaveData: prepareSaveData,
      fillEventTypes: fillEventTypes
		}

	}]);
