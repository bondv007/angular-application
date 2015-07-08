'use strict';

app.service('dgValidation', ['mmAlertService', 'dgConstants', 'validationHelper', 'dgHelper', '$filter', '$rootScope', 'enums', 'dgAdCalculateDecision',
  function (mmAlertService, dgConstants, validationHelper, dgHelper, $filter, $rootScope, enums, dgAdCalculateDecision) {
    var actionOptions = dgAdCalculateDecision.actionOptions();

    function saveValidation(dgs) {
            var valid = true;
            var dg;
            for (var i = 0; i < dgs.length; i++) {
                dg = dgs[i];
                dgHelper.initDgError(dg);
                if (!dgNameValidation(dg.name, dg.errors.errorDgName))
                    valid = false;
                if (!minimumTimeBetweenAdsValidation(dg.servingSetting.timeBetweenAds, dg.errors.errorMinimumTimeBetweenAds))
                    valid = false;
                if (!defaultServeValidation(dg.servingSetting.serveDefaultImage, dg.defaultAds))
                    valid = false;
                if (!weightValidation(undefined, dg.rootContainer.childRotationType, dg.rootContainer, dg))
                    valid = false;
                if (!timeBasedSequenceValidation(dg.rootContainer, true))
                    valid = false;
                if (!subGroupValidation(dg.rootContainer))
                    valid = false;
                if(!dgSubGroupNameValidation(dg.rootContainer.subContainers))
                    valid = false;
                if (!weightedValueValidation(dg.rootContainer.subContainers, dg.rootContainer.childRotationType))
                    valid = false;
                if(isMM2()){ // validation for MM2
                    if(!isDgHaveAtListOneAd(dg.rootContainer.subContainers)){
                        valid = false;
                        mmAlertService.addError("error_DgNeedAtListOneAd");
                    }
                }
            }
            return valid;
        }

        function saveMultipleDgsValidation(targetAudienceDgs, campaignDgs) {
            var valid = saveValidation(targetAudienceDgs);
            if (isMM2()) {
                if (isDgNameExist(campaignDgs, targetAudienceDgs)) {
                    valid = false;
                }
            }
            return valid;
        }

        function isMM2(){
            return $rootScope.isMMNext != undefined;
        }

        function isDgNameExist(campaignDgs, targetAudienceDgs) {
            var exist = false;
            if (!isAllTargetAudienceDgsHaveUniqueName(targetAudienceDgs)) {
                exist = true;
                mmAlertService.addError("error_dgNameUnique");
            }
            if (!isAllCampaignDgsHaveUniqueName(campaignDgs, targetAudienceDgs)) {
                exist = true;
                mmAlertService.addError("error_dgNameUnique");
            }
            return exist;
        }

        function isAllTargetAudienceDgsHaveUniqueName(targetAudienceDgs) {
            var unique = true;
            var dgNames = {};
            var dg;
            for (var i = 0; i < targetAudienceDgs.length; i++) {
                dg = targetAudienceDgs[i];
                if (dgNames[dg.name.toLowerCase()] == undefined) {
                    dgNames[dg.name.toLowerCase()] = dg.name;
                }
                else {
                    unique = false;
                }
            }
            return unique;
        }

        function isAllCampaignDgsHaveUniqueName(campaignDgs, targetAudienceDgs) {
            var unique = true;
            var campDgNames = getMapOfAllCampaignDgNames(campaignDgs);
            var dg;
            for (var i = 0; i < targetAudienceDgs.length; i++) {
                dg = targetAudienceDgs[i];
                if(campDgNames[dg.name.toLowerCase()] != undefined && dg.id != campDgNames[dg.name.toLowerCase()]){
                    unique = false;
                    break;
                }
            }
            return unique;
        }

        function getMapOfAllCampaignDgNames(campaignDgs){
            var campDgNames = {};
            for (var i = 0; i < campaignDgs.length; i++) {
                campDgNames[campaignDgs[i].name.toLowerCase()] = campaignDgs[i].id;
            }
            return campDgNames;
        }

        function subGroupValidation(subContainer){
            var valid = true;

            var enabledSubContainers = _.filter(subContainer.subContainers, function (container) {
                return dgHelper.isAdContainer(container) || container.rotationSetting.enabled;
            });

            if (valid && !(subContainer.isRoot && subContainer.subContainers.length == 0)) {
                if (enabledSubContainers.length == 0) {
                    mmAlertService.addError("dgSubgroupsWithoutAds");
                    return false;
                }
                else {
                    for (var i = 0; i < subContainer.subContainers.length; i++) {
                        if (subContainer.subContainers[i].type != dgConstants.strDeliveryGroupAd) {
                            valid = subGroupValidation(subContainer.subContainers[i]);
                            if (!valid) {
                                return;
                            }
                        }
                    }
                    return true;
                }
            } else {
                return valid;
            }
        }

        function dgNameValidation(dgName, errorObj) {
            var validationTypes = [
                {func: validationHelper.requiredValidation},
                {func: validationHelper.isValidChars}
            ];
            if (isMM2()) {
                validationTypes.push({func: validationHelper.maxLengthValidation});
            }
            var valid = validationHelper.isValid({value: dgName, error: errorObj, fieldName: "Name", maxLength: 100}, validationTypes);
            if (!valid) {
                mmAlertService.addError("error_dgNameNotValid");
            }
            return valid;
        }

        function dgSubGroupNameValidation(subContainer) {
            var valid = true;
            var item;
            for (var i = 0; i < subContainer.length; i++) {
                item = subContainer[i];
                if (dgHelper.isAdContainer(item)) {
                    var validationTypes = [
                        {func: validationHelper.requiredValidation},
                        {func: validationHelper.isValidChars}
                    ];
                    valid = validationHelper.isValid({value: item.name, error: {text:""}, fieldName: "Name"}, validationTypes);
                    if (valid) {
                        valid =  dgSubGroupNameValidation(item.subContainers);
                        if(!valid){
                            break;
                        }
                    }
                    else{
                        mmAlertService.addError("error_SubgroupNameValidation");
                        break;
                    }
                }
            }
            return valid;
        }

        function minimumTimeBetweenAdsValidation(timeBetweenAdsVal, errorObj) {
            var valid = true;
            errorObj.text = '';
            if (!isMinimumTimeBetweenAdsValid(timeBetweenAdsVal)) {
                errorObj.text = 'Please type a whole number between 1 – 999.';
                valid = false;
            }
            return valid;
        }

        function isMinimumTimeBetweenAdsValid(timeBetweenAdsVal) {
            return  dgHelper.isEmptyOrNull(timeBetweenAdsVal) || dgHelper.isInt(timeBetweenAdsVal, false) && (timeBetweenAdsVal > 0 && timeBetweenAdsVal < 1000);
        }

        function weightValidation(subContainer, rotationType, activeAds, mainEntityEdit) {
            var errorMessage = "wightedShouldAddUpTo100";
            var valid = true;
            if (!activeAds || activeAds.subContainers.length > 0) {
                if (!subContainer) {

                  if (!activeAds.totalWeight && mainEntityEdit) {
                    dgAdCalculateDecision.calculate(mainEntityEdit.rootContainer,actionOptions.setTotalWeightForAllContainer);
                  }
                  if (rotationType == dgConstants.strWeighted && activeAds.totalWeight != 100) {
                    mmAlertService.addError(errorMessage);
                    return false;
                  }
                    subContainer = (mainEntityEdit && mainEntityEdit.rootContainer && mainEntityEdit.rootContainer.subContainers) ? mainEntityEdit.rootContainer.subContainers : [];
                }
                for (var i = 0; i < subContainer.length; i++) {
                    if (subContainer[i].type == dgConstants.strAdContainer) {
                        if (subContainer[i].childRotationType == dgConstants.strWeighted && subContainer[i].totalWeight != 100) {
                            mmAlertService.addError(errorMessage);
                            return false;
                        }
                        valid = weightValidation(subContainer[i].subContainers);
                    }
                }
            }
            return valid;
        }

        function defaultServeValidation(serveDefaultImage, defaultAds) {
            var valid = true;
            if (!serveDefaultImage && (defaultAds === undefined || defaultAds.length === 0)) {
                mmAlertService.addError("defaultServeAdMustBeAtListOneAd");
                valid = false;
            }
            return valid;
        }

        function weightValueValidation(container) {
            var val = container.rotationSetting.weight;
            var valid = false;
            container.rotationSetting.adWeightError = {text: ''};
            if (!isNaN(Math.round(val))) {
                var num = parseFloat(val);
                if (num >= 0 && num <= 100 && $filter('number')(num, 2) - num == 0) {
                    valid = true;
                }
            }
            if (!valid) {
                container.rotationSetting.adWeightError = {text: 'Please type a number between 0 – 100.'};
            }
        }

        function weightedValueValidation(subContainer, rotationType) {
            var valid = true;
            var item;
            for (var i = 0; i < subContainer.length; i++) {
                item = subContainer[i];
                if (dgHelper.isAdContainer(item)) {
                    valid = weightedValueValidation(item.subContainers, item.childRotationType);
                    if (!valid) {
                        break;
                    }
                }
                if (rotationType == dgConstants.strWeighted) {
                    if (item.rotationSetting.weight == null) {
                        mmAlertService.addError('error_WeightedCantBeNull');
                        return false;
                    }
                    else if (isNaN(Math.round(item.rotationSetting.weight))) {
                        mmAlertService.addError('error_WeightedCantBeNull');
                        return false;
                    }
                    else {
                        var num = parseFloat(item.rotationSetting.weight);
                        if (num < 1) {
                            mmAlertService.addError('error_WeightedCantBeNull');
                            return false;
                        }
                    }
                }
            }
            return valid;
        }

        function isAdTypeValid(dg, ad) {
            var typeValid = true;
            if(dgHelper.isMM2()){
                    if(dg.uiPlacementType){
                        if(dg.uiPlacementType.toLowerCase() != enums.mapOfAdFormatToPlacementType[ad.adFormat].toLowerCase()){
                            typeValid = false;
                            mmAlertService.addError('The ad that you are trying to assign to the delivery group does not match the ad type that was defined for the delivery group.');
                        }
                    }
                    else if (ad.adFormat){
                        dg.placementType = enums.mapOfAdFormatToPlacementType[ad.adFormat];
                        dg.uiPlacementType = enums.mapOfAdFormatToPlacementType[ad.adFormat];
                    }
            }
            else{
                var adType = dgHelper.getPlacementTypeFromAdFormat(ad.adFormat);
                adType = adType ? adType.toLowerCase() : '';
                if (dg.placementType) {
                    if (dg.placementType.toLowerCase() != adType) {
                        typeValid = false;
                        mmAlertService.addError('The ad that you are trying to assign to the delivery group does not match the ad type that was defined for the delivery group.');
                    }
                }
                else if (ad.adFormat) {
                    dg.placementType = adType.toUpperCase();
                    dg.uiPlacementType =  dgHelper.getUIPlacementType(ad.adFormat);
                }
            }
            return typeValid;
        }

        function isAdSizeValid(dg, ad) {
            if (dg.width && dg.height) {
                if (dgHelper.getDgUiDimension(dg).dimension != dgHelper.getDgUiDimension(ad.defaultImage).dimension) {
                    mmAlertService.addWarning('The ad that you are trying to assign to the delivery group does not match the dimensions that were defined for the delivery group.');
                }
            }
            else if (ad.dimension) {
                dg.adSize = ad.dimension;
            }
        }

        function isValidateAdTypeAndSize(dg, ad) {
            var isAdValid = isAdTypeValid(dg, ad);
            isAdSizeValid(dg, ad);
            return isAdValid;
        }

        function isDgHaveAtListOneAd(subContainer){
            var valid = false;

            for (var i = 0; i < subContainer.length; i++) {

                if(dgHelper.isAdContainer(subContainer[i])){
                    valid =  isDgHaveAtListOneAd(subContainer[i].subContainers);
                }
                else{
                    return true;
                }
            }
            return valid;
        }

        //region Time Based Validation
        function timeBasedSequenceValidation(rootContainer, isRootAdContainer) {
            rootContainer.isRoot = isRootAdContainer;
            var isRootWithoutChild = rootContainer.isRoot && rootContainer.subContainers.length == 0;
            var subContainers = rootContainer.subContainers;

            if (!isRootWithoutChild) {

                for (var i = 0; i < subContainers.length; i++) {
                    if (dgHelper.isAdContainer(subContainers[i])) {
                        if (!timeBasedSequenceValidation(subContainers[i], false)) {
                            return false;
                        }
                    }
                }

                if (dgHelper.isTimeBasedAdContainer(rootContainer)) {
                    rootContainer.subContainers = dgHelper.sortTimeBasedDateByStartDate(rootContainer.subContainers);
                    return isSequenceAndSequenceWithParent(rootContainer);
                }
            }

            return true;
        }

        function isSequenceAndSequenceWithParent(rootContainer) {
            var valid = true;
            var subContainers = rootContainer.subContainers;
            if (!subContainers || subContainers.length === 0) {
                return valid;
            }
            if (!subContainers[0].rotationSetting.datesAccordingToPlacements && !dgHelper.isDate(subContainers[0].rotationSetting.startDate)) {
                valid = false;
                mmAlertService.addError("Please select a start date.");
            }
            else if (!subContainers[0].rotationSetting.datesAccordingToPlacements && !dgHelper.isDate(subContainers[0].rotationSetting.endDate)) {
                valid = false;
                mmAlertService.addError("Please select an end date.");
            }
            else if (!subContainers[0].rotationSetting.datesAccordingToPlacements && moment(subContainers[0].rotationSetting.startDate).isAfter(subContainers[0].rotationSetting.endDate)) {
                valid = false;
                mmAlertService.addError("The end date you entered occurs before the start date.");
            }
            else {
                var minChildStartDate = subContainers[0].rotationSetting.startDate;
                var maxChildEndDate = subContainers[subContainers.length - 1].rotationSetting.endDate;
                if (!rootContainer.isRoot && !rootContainer.rotationSetting.datesAccordingToPlacements && ( moment(minChildStartDate).isAfter(rootContainer.rotationSetting.startDate)
                    || moment(maxChildEndDate).isBefore(rootContainer.rotationSetting.endDate))) {
                    valid = false;
                    mmAlertService.addError("The date that was defined for serving the ad is not consistent with the date defined for the subgroup.");
                }
                else {
                    var stop = subContainers.length - 1;
                    for (var i = 0; i < stop; i++) {
                        var nextrotationSetting = subContainers[i + 1].rotationSetting;
                        var currentWeight = subContainers[i].rotationSetting;
                        if (!nextrotationSetting.datesAccordingToPlacements && !dgHelper.isDate(nextrotationSetting.startDate)) {
                            valid = false;
                            mmAlertService.addError("Please select a start date.");
                            break;
                        }
                        else if (!nextrotationSetting.datesAccordingToPlacements && !dgHelper.isDate(nextrotationSetting.endDate)) {
                            valid = false;
                            mmAlertService.addError("Please select an end date.");
                            break;
                        }
                        if (!nextrotationSetting.datesAccordingToPlacements && moment(nextrotationSetting.startDate).isAfter(nextrotationSetting.endDate)) {
                            valid = false;
                            mmAlertService.addError("The end date you entered occurs before the start date.");
                            break;
                        }
                        if (!nextrotationSetting.datesAccordingToPlacements && moment(nextrotationSetting.startDate).isAfter(currentWeight.endDate)) {
                            valid = false;
                            mmAlertService.addError("The selected date is not consistent with the rotation time that was defined for the delivery group.");
                            break;
                        }
                    }
                }
            }
            return valid;
        }

        //endregion

        function swapNameValidation(dgName, errorObj) {
            var validationTypes = [
                {func: validationHelper.requiredValidation},
                {func: validationHelper.isValidChars}
            ];
            return validationHelper.isValid({value: dgName, error: errorObj, fieldName: "Name"}, validationTypes);
        }

        function swapStartDateMandatoryValidation(startDate, errorObj) {
            return validationHelper.singleDatePickerRequiredValidation({value: startDate, error: errorObj, fieldName: "Start Date"});
        }

        function isSwapEndGreaterThanStartDate(fieldObj) {
            return validationHelper.isEndGreaterThanStartDate(fieldObj);
        }

        function isValidNumOfNestedSubGroupForSwapAction(deliveryGroups) {
            var valid = true;
            var stop = deliveryGroups.length;
            for (var i = 0; i < stop; i++) {
                if (_isMoreThanOneNestedSubGroup(deliveryGroups[i].rootContainer.subContainers, 0)) {
                    valid = false;
                    mmAlertService.addError("These delivery groups cannot be assigned to these ads because there are already one subgroup levels.");
                    break;
                }
            }
            return valid;
        }

        function _isMoreThanOneNestedSubGroup(container, deepLevel) {
            var isMore = false;
            var maxValidLevelOfSubContainers = dgHelper.maxValidLevelOfSubContainers();
            for (var i = 0; i < container.length; i++) {
                if (dgHelper.isAdContainer(container[i])) {
                    deepLevel = deepLevel + 1;
                    if (deepLevel == maxValidLevelOfSubContainers) {
                        return true;
                    }
                    else {
                        isMore = _isMoreThanOneNestedSubGroup(container[i].subContainers, deepLevel);
                        deepLevel = deepLevel - 1;
                    }
                    if (isMore) {
                        return true;
                    }

                }
            }
            return isMore;
        }

        function isSwapStartDateEqualOrGreaterThanToday(fieldObj) {
            return validationHelper.isStartDateEqualOrGreaterThanToday(fieldObj);
        }

        return {
            saveValidation: saveValidation,
            dgNameValidation: dgNameValidation,
            minimumTimeBetweenAdsValidation: minimumTimeBetweenAdsValidation,
            weightValidation: weightValidation,
            defaultServeValidation: defaultServeValidation,
            weightValueValidation: weightValueValidation,
            isAdTypeValid: isAdTypeValid,
            isAdSizeValid: isAdSizeValid,
            isValidateAdTypeAndSize: isValidateAdTypeAndSize,
            timeBasedSequenceValidation: timeBasedSequenceValidation,
            swapNameValidation: swapNameValidation,
            swapStartDateMandatoryValidation: swapStartDateMandatoryValidation,
            isSwapEndGreaterThanStartDate: isSwapEndGreaterThanStartDate,
            isValidNumOfNestedSubGroupForSwapAction: isValidNumOfNestedSubGroupForSwapAction,
            isSwapStartDateEqualOrGreaterThanToday: isSwapStartDateEqualOrGreaterThanToday,
            subGroupValidation: subGroupValidation,
            saveMultipleDgsValidation: saveMultipleDgsValidation
        };
    }]);
