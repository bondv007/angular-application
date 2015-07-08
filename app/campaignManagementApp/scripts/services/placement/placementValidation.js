'use strict';

app.service('placementValidation', ['placementHelper', 'validationHelper', function (placementHelper, validationHelper) {

		var bannerSizeErrorText = "Please enter a positive whole number between 1-9999.";
		var trackingAdsValidationObjects = {};

    function bannerSizeValidation(bannerSize, bannerSizeMap) {
        var bannerSizeError = {isValid: true, widthText: '', heightText: ''};

        // width validation
        if (placementHelper.isEmptyOrNull(bannerSize.width)) {
            bannerSizeError.widthText = bannerSizeErrorText;
            bannerSizeError.isValid = false;
        }
        else if (!placementHelper.isInt(bannerSize.width) || bannerSize.width < 1 || bannerSize.width > 10000) {
            bannerSizeError.widthText = bannerSizeErrorText;
            bannerSizeError.isValid = false;
        }

        // height validation
        if (placementHelper.isEmptyOrNull(bannerSize.height)) {
            bannerSizeError.heightText = bannerSizeErrorText;
            bannerSizeError.isValid = false;
        }
        else if (!placementHelper.isInt(bannerSize.height) || bannerSize.height < 1 || bannerSize.height > 10000) {
            bannerSizeError.heightText = bannerSizeErrorText;
            bannerSizeError.isValid = false;
        }

        // Check new dim banner size not exist
        var newBannerSizeName = bannerSize.width + 'X' + bannerSize.height;
        if (bannerSizeMap[newBannerSizeName] == newBannerSizeName) {
            bannerSizeError.widthText = "Banner Size exist.";
            bannerSizeError.isValid = false;
        }

        return bannerSizeError;
    }

    function servingValidation(dateValidationObj) {
        return validationHelper.rangeDatePickerValidation(dateValidationObj);
    }

		function setTrackingAdValidationObjPropertyValue(clientRefId, property, value){
			if(trackingAdsValidationObjects[clientRefId]){
				trackingAdsValidationObjects[clientRefId][property] = value;
			}
			else{
				addTrackingAdValidationObj(clientRefId);
				trackingAdsValidationObjects[clientRefId][property] = value;
			}
		}

		function addTrackingAdValidationObj(clientRefId){
			trackingAdsValidationObjects[clientRefId] = {};
		}

		function removeTrackingAdValidationObj(clientRefId){
			delete trackingAdsValidationObjects.clientRefId;
		}

		function isRowValid(validationRow){
			if(validationRow){
				for (var key in validationRow){
					if(!validationRow[key]){
						return false;
					}
				}
			}
			return true;
		}

		function validateTrackingAds(){
			for (var clientRefId in trackingAdsValidationObjects){
				if(!isRowValid(trackingAdsValidationObjects[clientRefId])){
					return false;
				}
			}
			return true;
		}

    return {
			bannerSizeValidation: bannerSizeValidation,
			servingValidation: servingValidation,
			setTrackingAdValidationObjPropertyValue: setTrackingAdValidationObjPropertyValue,
			addTrackingAdValidationObj: addTrackingAdValidationObj,
			removeTrackingAdValidationObj: removeTrackingAdValidationObj,
			validateTrackingAdsBeforeSave: validateTrackingAds
    };
}]);
