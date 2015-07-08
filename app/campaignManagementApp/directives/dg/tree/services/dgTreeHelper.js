/**
 * Created by Ofir.Fridman on 10/25/14.
 */
'use strict';

app.service('dgTreeHelper', ['dgConstants', 'mmAlertService', 'deliveryGroupJsonObjects', 'dgAdCalculateDecision', 'dgValidation', '$rootScope',
    function (dgConstants, mmAlertService, deliveryGroupJsonObjects, dgAdCalculateDecision, dgValidation, $rootScope) {
        var actionOptions = dgAdCalculateDecision.actionOptions();

        function isMMNext() {
            return $rootScope.isMMNext == undefined;
        }

        function isMM2() {
            return !isMMNext();
        }

        function getMaxTreeDepth() {
            return isMM2() ? dgConstants.maxTreeDepth_MM2
                : dgConstants.maxTreeDepth;
        }

        function isSubGroup(item) {
            return item.type == dgConstants.strAdContainer;
        }

        function isAd(item) {
            return item.type == dgConstants.strDeliveryGroupAd;
        }

        function isAdEnable(ad) {
            return ad.rotationSetting.enabled;
        }

        function isAdDisable(ad) {
            return !isAdEnable(ad);
        }

        function acceptDropToRotation(sourceNodeScope, destinationNodesScope, dg) {
            var accept = !isFromDefaultServe(sourceNodeScope.$modelValue);
            if (sourceNodeScope.$modelValue.dgId != undefined) {
                accept = dg.id == sourceNodeScope.$modelValue.dgId;
            }
            if (accept && destinationNodesScope.$childNodesScope) {// if drag item is container
                accept = isDragContainerDepthInLimit(sourceNodeScope, 1);
            }
            if (accept) {
                if (!isSubGroup(sourceNodeScope.$modelValue)) {
                    accept = true;
                } else {
                    accept = destinationNodesScope.depth() < getMaxTreeDepth();
                }
            }
            if (isCentralAd(sourceNodeScope.$modelValue) && !dgValidation.isValidateAdTypeAndSize(dg, sourceNodeScope.$modelValue)) {// Ad Type and Size validation
                accept = false;
            }
            if (accept) {
                $rootScope.isDirtyEntity = true;
            }
            return accept;
        }

        function acceptDropToDefaultServe(dropItem, destinationNodesScope, dg) {
            var accept = false;
            if (dropItem.dgId && dropItem.dgId != dg.id) {
                return false;
            }
            var isDropToContainer = destinationNodesScope.depth() > 0;
            if (isDropToContainer && (isAd(dropItem) || isCentralAd(dropItem))) {
                accept = true;
                if (!isFromDefaultServe(dropItem)) {
                    var adId = isCentralAd(dropItem) ? dropItem.id : dropItem.masterAdId;
                    accept = !_isAdIdExistInDefaultServe(destinationNodesScope, adId);
                    if (accept && isCentralAd(dropItem) && !dgValidation.isValidateAdTypeAndSize(dg, dropItem)) {// Ad Type and Size validation
                        accept = false;
                    }
                }
            }
            if (accept) {
                $rootScope.isDirtyEntity = true;
            }
            return  accept;
        }

        function allowCreateSubContainer(container, depth) {
            var resultObj = {allow: true, depth: depth};
            for (var i = 0; i < container.length; i++) {
                if (isSubGroup(container[i])) {
                    ++resultObj.depth;
                    if (container[i].selected) {
                        resultObj.allow = resultObj.depth < getMaxTreeDepth();
                        if (!resultObj.allow) {
                            var alertErrorMessage = isMM2() ? "mm2_MaximumNumberOfSubgroups" : "mm3_MaximumNumberOfSubgroups";
                            mmAlertService.addError(alertErrorMessage);
                        }
                        break;
                    }
                    else {
                        resultObj = allowCreateSubContainer(container[i].subContainers, resultObj.depth);
                        if (!resultObj.allow) {
                            break;
                        }
                    }
                }
            }
            return {allow: resultObj.allow, depth: --resultObj.depth};
        }

        function isDragContainerDepthInLimit(sourceNodeScope, depth) {
            var isInLimit = true;
            if (sourceNodeScope.hasChild()) {
                for (var i = 0; i < sourceNodeScope.childNodesCount(); i++) {
                    if (isSubGroup(sourceNodeScope.childNodes()[i].$modelValue)) {
                        depth = depth + 1;
                        if (depth < getMaxTreeDepth()) {
                            isInLimit = isDragContainerDepthInLimit(sourceNodeScope.childNodes()[i], depth);
                            depth = depth - 1;
                            return isInLimit;
                        }
                        else {
                            return false;
                        }
                    }
                }
            }
            return isInLimit;
        }

        function isFromRotation(item) {
            return item.from == dgConstants.strFromRotation;
        }

        function isFromDefaultServe(item) {
            return  item.from == dgConstants.strFromDefault;
        }

        function _isAdIdExistInDefaultServe(destinationNodesScope, id) {
            var isExist = false;
            var ads = destinationNodesScope.$modelValue;
            for (var i = 0; i < ads.length; i++) {
                if (ads[i].masterAdId == id) {
                    isExist = true;
                    break;
                }
            }
            return isExist;
        }

        function selectVisibleServeAds(mmDefaultAds, mmHideDisabled, mmDefaultAdsCb) {
            for (var i = 0; i < mmDefaultAds.length; i++) {
                var ad = mmDefaultAds[i];
                ad.selected = (isAdDisable(ad) && mmHideDisabled.val) ? false : mmDefaultAdsCb.isSelected;
            }
        }

        function getAcceptDropItem(sourceNodeScope) {
            return sourceNodeScope.$modelValue;
        }

        function getEventDragOrDropItem(event) {
            return event.source.nodeScope.$modelValue;
        }

        function getDropDestination(event, mmModel) {
            return event.dest.nodesScope.$parent.$modelValue ? event.dest.nodesScope.$parent.$modelValue : mmModel;
        }

        function getParentSource(event, mmModel) {
            return event.source.nodesScope.$parent.$modelValue ? event.source.nodesScope.$parent.$modelValue : mmModel;
        }

        function createSubGroup(dg) {
            var selectedAdContainer = getSelectedAdContainer(dg.rootContainer);
            if (!selectedAdContainer && dg.selected) {
                selectedAdContainer = dg.rootContainer;
            }
            if (selectedAdContainer) {
                var subContainer = newSubContainer(dg.rootContainer.subContainers, selectedAdContainer);
                subContainer.rotations = filterRotationTypeOptions(selectedAdContainer, selectedAdContainer.rotations);
                selectedAdContainer.subContainers.push(subContainer);
                dgAdCalculateDecision.calculate(selectedAdContainer, actionOptions.add);
            }
        }

        function newSubContainer(rootSubContainer, selectedAdContainer) {
            var subContainer = deliveryGroupJsonObjects.getDefaultAdContainer(selectedAdContainer.childRotationType);
            if (isMM2()) {
                var childRotationType = getFirstSubGroupRotation(rootSubContainer);
                subContainer.childRotationType = childRotationType ? childRotationType : dgConstants.strEvenDistribution;
            }
            return subContainer;
        }

        function getFirstSubGroupRotation(rootSubContainer) {
            var item;
            var subGroupRotation;
            for (var i = 0; i < rootSubContainer.length; i++) {
                item = rootSubContainer[i];
                if (isSubGroup(item)) {
                    subGroupRotation = item.childRotationType;
                    break
                }
            }
            return subGroupRotation;
        }


        function getSelectedAdContainer(container) {
            if (container.type === dgConstants.strAdContainer && container.selected) {
                return container;
            }
            var selectedAdContainer = null;
            for (var i = 0; i < container.subContainers.length; i++) {
                var subContainer = container.subContainers[i];
                if (subContainer && subContainer.type === dgConstants.strAdContainer && !selectedAdContainer) {
                    selectedAdContainer = getSelectedAdContainer(subContainer);
                }
            }
            return selectedAdContainer;
        }

        function onParentSelectedSelectAllChildes(selectedSubGroup) {
            var isSubGroupSelected = selectedSubGroup.selected;
            var subContainer;
            for (var i = 0; i < selectedSubGroup.subContainers.length; i++) {
                subContainer = selectedSubGroup.subContainers[i];
                subContainer.selected = isSubGroupSelected;
                if (isSubGroup(subContainer)) {
                    onParentSelectedSelectAllChildes(subContainer);
                }
            }
        }

        function isCentralAd(item) {
            return item.from == dgConstants.strFromCentral;
        }

        function convertCentralAdToDgRotationAd(ad, dropDestination) {
            var cloneAd = angular.copy(ad);
            setAdTypeKey(ad);
            ad.name = cloneAd.name;
            ad.rotationSetting = deliveryGroupJsonObjects.getRotationSetting(dropDestination.childRotationType);
            ad.type = dgConstants.strDeliveryGroupAd;
            ad.masterAdId = cloneAd.id;
            ad.showRotation = true;
            ad.from = dgConstants.strFromRotation;
        }

        function convertCentralAdToDgDefaultServeAd(ad) {
            var cloneAd = angular.copy(ad);
            setAdTypeKey(ad);
            ad.name = cloneAd.name;
            ad.rotationSetting = deliveryGroupJsonObjects.getRotationSettingForDefaultServe();
            ad.type = dgConstants.strDeliveryGroupAd;
            ad.masterAdId = isFromRotation(cloneAd) ? cloneAd.masterAdId : cloneAd.id;
            ad.showRotation = false;
            ad.from = dgConstants.strFromDefault;
        }

        function setAdTypeKey(ad) {
            deleteAllObjectKeys(ad);
            ad.__type = dgConstants.typeForMM2.deliveryGroupAd;
        }

        function deleteAllObjectKeys(obj) {
            for (var key in obj) {
              if(obj.hasOwnProperty(key)){
                delete obj[key];
              }
            }
        }

        //region Enable Disable
        function enableDisableButtonState(dg, mmDefaultAdsCb) {
            var buttonState = {};
            if (!mmDefaultAdsCb.isSelected) {
                buttonState = _enableDisableButtonStateRotationAds(dg.rootContainer.subContainers, buttonState);
                if (buttonState.text != dgConstants.disableEnableButtonOptions.disableEnable) {
                    buttonState = _enableDisableButtonStateDefaultServeAds(dg.defaultAds, buttonState);
                }
            }
            if (!buttonState.text) {
                buttonState.text = dgConstants.disableEnableButtonOptions.disableEnable;
            }
            if (!isAtListOneAdSelected(dg.rootContainer.subContainers, dg.defaultAds)) {
                buttonState.action = dgConstants.disableEnableButtonAction.remove;
            }
            return buttonState;
        }

        function _enableDisableButtonStateRotationAds(container, buttonState) {
            for (var i = 0; i < container.length; i++) {
                var item = container[i];
                if (isSubGroup(item)) {
                    if (item.selected) {
                        buttonState.text = dgConstants.disableEnableButtonOptions.disableEnable;
                        return buttonState;
                    } else {
                        buttonState = _enableDisableButtonStateRotationAds(item.subContainers, buttonState);
                        if (buttonState.text == dgConstants.disableEnableButtonOptions.disableEnable) {
                            return buttonState;
                        }
                    }
                }
                else {
                    buttonState = _enableButtonForAd(item, buttonState);
                    if (buttonState.text == dgConstants.disableEnableButtonOptions.disableEnable) {
                        return buttonState;
                    }
                }
            }
            return buttonState;
        }

        function _enableDisableButtonStateDefaultServeAds(container, buttonState) {
            if (container) {
                var ad;
                for (var i = 0; i < container.length; i++) {
                    ad = container[i];
                    buttonState = _enableButtonForAd(ad, buttonState);
                    if (buttonState.text == dgConstants.disableEnableButtonOptions.disableEnable) {
                        break;
                    }
                }
            }
            return buttonState;
        }

        function _enableButtonForAd(ad, buttonState) {
            if (ad.selected) {
                if (isAdEnable(ad)) {
                    if (buttonState.text == dgConstants.disableEnableButtonOptions.disableEnable
                        || buttonState.text == dgConstants.disableEnableButtonOptions.enable) {
                        buttonState.text = dgConstants.disableEnableButtonOptions.disableEnable;
                    }
                    else {
                        buttonState.text = dgConstants.disableEnableButtonOptions.disable;
                    }
                } else {
                    if (buttonState.text == dgConstants.disableEnableButtonOptions.disableEnable
                        || buttonState.text == dgConstants.disableEnableButtonOptions.disable) {
                        buttonState.text = dgConstants.disableEnableButtonOptions.disableEnable;
                    }
                    else {
                        buttonState.text = dgConstants.disableEnableButtonOptions.enable;
                    }
                }
            }
            return buttonState;
        }

        function enableDisableAds(dg, actionType, mmDefaultAdsCb) {
            if (actionType != dgConstants.disableEnableButtonOptions.disableEnable) {
                enableDisableAdsRotationAds(dg.rootContainer, actionType);
                enableDisableAdsDefaultServeAds(dg.defaultAds, actionType);
            }
            return enableDisableButtonState(dg, mmDefaultAdsCb);
        }

        function enableDisableAdsRotationAds(containerObj, actionType) {
            var item;
            var container = containerObj.subContainers;
            var arrLengthBeforeChange = _.filter(container,function (container) {
                return container.rotationSetting.enabled
            }).length;
            for (var i = 0; i < container.length; i++) {
                item = container[i];
                if (isSubGroup(item)) {
                    enableDisableAdsRotationAds(item, actionType);
                }
                else if (item.selected) {
                    var enableAndShowRotation = actionType == dgConstants.disableEnableButtonOptions.enable;
                    container[i].showRotation = enableAndShowRotation;
                    container[i].rotationSetting.enabled = enableAndShowRotation;
                }
            }
            dgAdCalculateDecision.calculate(containerObj, actionType, arrLengthBeforeChange);
        }

        function enableDisableAdsDefaultServeAds(container, actionType) {
            if (container) {
                for (var i = 0; i < container.length; i++) {
                    if (container[i].selected) {
                        container[i].rotationSetting.enabled = actionType == dgConstants.disableEnableButtonOptions.enable;
                    }
                }
            }
        }

        //endregion

        //region Hide Disable Ads CB
        function onAfterHideDisabledClick(dg, mmDefaultAdsCb) {
            unCheckDisabledAds(dg.rootContainer);
            unCheckDisabledAdsInDefaultServe(dg.defaultAds);
            return enableDisableButtonState(dg, mmDefaultAdsCb);
        }

        function unCheckDisabledAds(container) {
            if (!container.subContainers) {
                return;
            }
            for (var i = 0; i < container.subContainers.length; i++) {
                var subContainer = container.subContainers[i];
                if (isSubGroup(subContainer)) {
                    unCheckDisabledAds(subContainer);
                } else if (subContainer.selected && isAdDisable(subContainer)) {
                    subContainer.selected = false;
                }
            }
        }

        function unCheckDisabledAdsInDefaultServe(defaultAds) {
            var ad;
            for (var i = 0; i < defaultAds.length; i++) {
                ad = defaultAds[i];
                if (isAdDisable(ad)) {
                    ad.selected = false;
                }
            }
        }

        //endregion

        //region Remove
        function removeAds(rotationAds) {
            removeSelectedAds(rotationAds);
            return {text: dgConstants.disableEnableButtonOptions.disableEnable};
        }

        function removeSelectedAds(container) {
            if (!container.subContainers) {
                return;
            }
            var arrLengthBeforeChange = _.filter(container.subContainers,function (container) {
                return container.rotationSetting.enabled;
            }).length;
            for (var i = 0; i < container.subContainers.length; i++) {
                var subContainer = container.subContainers[i];
                if (subContainer.type === dgConstants.strAdContainer) {
                    removeSelectedAds(subContainer);
                }
            }
            container.subContainers = _.remove(container.subContainers, function (item) {
                return !item.selected;
            });
            dgAdCalculateDecision.calculate(container, actionOptions.remove, arrLengthBeforeChange);
        }

        function filterRotationTypeOptions(parentContainer, rotations) {
            var allowedRotations = rotations;
            if (parentContainer.childRotationType !== "TimeBased") {
                allowedRotations = _.filter(rotations, function (item) {
                    return item.id !== "TimeBased"
                });
            }

            return allowedRotations;
        }

        //endregion

        function toggleSelectAll(selectAll, subGroup) {
            var item;
            for (var i = 0; i < subGroup.length; i++) {
                item = subGroup[i];
                item.selected = selectAll;
                if (isSubGroup(item)) {
                    toggleSelectAll(selectAll, item.subContainers)
                }
            }
        }

        function isAtListOneAdSelected(subContainer, defaultAds) {
            return isAtListOneRotationAdSelected(subContainer) || isAtListOneDefaultAdSelected(defaultAds);
        }

        function isAtListOneRotationAdSelected(subContainer) {
            var item;
            var selected = false;
            for (var i = 0; i < subContainer.length; i++) {
                item = subContainer[i];
                if (item.selected) {
                    return true;
                }
                else {
                    if (isSubGroup(item)) {
                        selected = isAtListOneRotationAdSelected(item.subContainers);
                        if (selected) {
                            break;
                        }
                    }
                }
            }

            return selected;
        }

        function isAtListOneDefaultAdSelected(defaultAds) {
            var selected = false;
            for (var i = 0; i < defaultAds.length; i++) {
                if (defaultAds[i].selected) {
                    selected = true;
                    break;
                }
            }
            return selected;
        }

        function changeAndCalcAllSubContainer(item, rootSubContainer) {
            dgAdCalculateDecision.calculate(item, actionOptions.rotationChange);
            if(isMM2() && !isRootContainer(item)){
                var subContainerItem;
                for (var i = 0; i < rootSubContainer.length; i++) {
                    subContainerItem = rootSubContainer[i];
                    if (isSubGroup(subContainerItem) && isSubContainerRotationTypeDifferent(subContainerItem, item)) {
                        subContainerItem.childRotationType = item.childRotationType;
                        subContainerItem.rotationSetting.__type = dgConstants.mm2RotationSettingType[item.childRotationType];
                        subContainerItem.rotationSetting.type = item.childRotationType;

                        dgAdCalculateDecision.calculate(subContainerItem, actionOptions.rotationChange);
                    }
                }
            }
        }

        function isRootContainer(item){
            return item.type == dgConstants.strRootContainer;
        }

        function isSubContainerRotationTypeDifferent(subContainerA, subContainerB) {
            return subContainerA.childRotationType != subContainerB.childRotationType;
        }

        function setRefIdWithNull(event) {
            // This is for server
            if (isMM2()) {
                event.source.nodeScope.$modelValue.SubDeliveryGroupRefID = -1;
                event.source.nodeScope.$modelValue.SubDeliveryGroupMasterAdRefID = -1;
            }
        }

        function setPlacementTypeNull(dg) {
            dg.placementType = null;
            dg.uiPlacementType = null;
        }

        function isAtListOneAdExist(dg) {
            var adExist = isAtListOneAdExistInDefaultServe(dg.defaultAds);
            if (!adExist) {
                adExist = isAtListOneAdExistInRotation(dg.rootContainer.subContainers);
            }
            return adExist;
        }

        function isAtListOneAdExistInRotation(subContainer) {
            var adExist = false;
            var item;
            for (var i = 0; i < subContainer.length; i++) {
                item = subContainer[i];
                if (isSubGroup(item)) {
                    adExist =  isAtListOneAdExistInRotation(item.subContainers);
                    if(adExist){
                        break;
                    }
                }
                else {
                    adExist = true;
                    break;
                }
            }
            return adExist;
        }

        function isAtListOneAdExistInDefaultServe(defaultAds) {
            return defaultAds.length > 0;
        }

        function checkIfToSetPlacementTypeAsNull(dg) {
            if (!isAtListOneAdExist(dg)) {
                setPlacementTypeNull(dg);
            }
        }

        return {
            getMaxTreeDepth: getMaxTreeDepth,
            isSubGroup: isSubGroup,
            isAd: isAd,
            isAdEnable: isAdEnable,
            isAdDisable: isAdDisable,
            acceptDropToRotation: acceptDropToRotation,
            acceptDropToDefaultServe: acceptDropToDefaultServe,
            allowCreateSubContainer: allowCreateSubContainer,
            isFromRotation: isFromRotation,
            isFromDefaultServe: isFromDefaultServe,
            selectVisibleServeAds: selectVisibleServeAds,
            getAcceptDropItem: getAcceptDropItem,
            getEventDragOrDropItem: getEventDragOrDropItem,
            getDropDestination: getDropDestination,
            getParentSource: getParentSource,
            createSubGroup: createSubGroup,
            onParentSelectedSelectAllChildes: onParentSelectedSelectAllChildes,
            isCentralAd: isCentralAd,
            convertCentralAdToDgRotationAd: convertCentralAdToDgRotationAd,
            convertCentralAdToDgDefaultServeAd: convertCentralAdToDgDefaultServeAd,
            enableDisableButtonState: enableDisableButtonState,
            enableDisableAds: enableDisableAds,
            removeAds: removeAds,
            onAfterHideDisabledClick: onAfterHideDisabledClick,
            toggleSelectAll: toggleSelectAll,
            changeAndCalcAllSubContainer: changeAndCalcAllSubContainer,
            setRefIdWithNull: setRefIdWithNull,
            setPlacementTypeNull: setPlacementTypeNull,
            checkIfToSetPlacementTypeAsNull: checkIfToSetPlacementTypeAsNull
        };
    }]);