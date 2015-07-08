'use strict';

app.controller('deliveryGroupEditCtrl', ['$scope', '$stateParams', 'EC2Restangular', '$state', '$filter', 'secConversion', 'enums', 'dgAdCalculateDecision',
    'deliveryGroupJsonObjects', 'dgHelper', 'mmAlertService', 'dgValidation', 'dgConstants', 'mmPermissions',
    function ($scope, $stateParams, EC2Restangular, $state, $filter, secConversion, enums, dgAdCalculateDecision,
              deliveryGroupJsonObjects, dgHelper, mmAlertService, dgValidation, dgConstants, mmPermissions) {

        //region Init Params
        $scope.hasDGManagementPermission = true;//mmPermissions.hasPermissionBySession('DGManagement');
        $scope.mainEntityEdit={};
        $scope.mainEntityEdit.defaultAds = [];
        $scope.mainEntityEdit.rootContainer = {};
        $scope.mainEntityEdit.rootContainer.subContainers=[];
        var tempDefaultAds;
        var serverDeliveryGroup = EC2Restangular.all('deliveryGroups');
        var serverAds = EC2Restangular.all('ads');
        var campaignId = $stateParams.campaignId;
        $scope.defaultServeRadioButton = enums.defaultServeOptions;
        $scope.timeZoneRadioButton = enums.timeBaseTimeZoneOptions;
        $scope.FrequencyCapping = {};
        $scope.timeBetweenAds = {value: null};
        $scope.selectedTimeUnit = {id: 1};
        $scope.uiTimeBetweenAds = null;
        $scope.showSPinner = false;
        $scope.deliveryGroupId = ($stateParams.deliveryGroupId == "") ? null : $stateParams.deliveryGroupId;
        $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: [], isDisabled: !$scope.hasDGManagementPermission};
        $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: [], isPrimary: true, isDisabled: !$scope.hasDGManagementPermission};
        $scope.stickyObject = {stickElementId: "adsAreaButtons", bottomReferencePointId: "adsAreaFrame", fixedCss: "divButtonFixed", finTune: -10};
        $scope.hideDisabled = {val: false};
        $scope.attachedPlacementsLink = {val: "0 placements"};
        $scope.buttonState = {text: dgConstants.disableEnableButtonOptions.disableEnable};
        var actionOptions = dgAdCalculateDecision.actionOptions();
        var mapPlacementType = dgHelper.getMapPlacementType();
        //endregion

        var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
            if (newValue != oldValue || oldValue == null || $scope.isEntral) {
                updateState();
            }
        });

        updateState();

        function isNewMode() {
            return  $scope.$parent.mainEntity === undefined || $scope.$parent.mainEntity === null || $scope.$parent.mainEntity.id === undefined;
        }

        function initErrorsToEmptyString() {
            if ($scope.mainEntityEdit) {
                $scope.mainEntityEdit.errors = {errorDgName: {text: ""}, errorMinimumTimeBetweenAds: {text: ""}};
            }
        }

        function setDefaultValues() {
            $scope.firstPlacementType = {name: ""};
            $scope.attachedPlacementsLink = {val: "0 placements"};
            $scope.firstAdDimension = {dimension: ""};
            $scope.targetAudience = {value: "All"};
            $scope.enableDisableState = { text: "Disable/Enable", notClickable: true};
            setDefaultAreaCB();
        }

        function updateState() {
            setDefaultValues();
            updateByMode();
            initErrorsToEmptyString();
            setFrequencyCapping();
            setTimeBetweenAds();
            getAdsByCampId();
        }

        function getAdsByCampId() {
            serverAds.getList({"campaignId": campaignId, "adType": dgConstants.strMasterAd_Rest_API_Filter}).then(function (all) {
                $scope.ads = all;
                setAdsToAdsArea();
            }, function (response) {
                mmAlertService.addError(response);
            });
        }

        function setDefaultAreaCB() {
            $scope.defaultAdsCB = {isSelected: false};
        }

        function updateByMode() {
            if (isNewMode()) { // Case New
                newMode();
            }
            else { // Case Edit
                editMode();
            }
        }

        function newMode() {
            $scope.essentialArea = {dgName: {open: true}};
            $scope.settings = {open: true};
            $scope.adsArea = {open: true, dgWeight: {open: true}};
            $scope.mainEntityEdit = deliveryGroupJsonObjects.newDeliveryGroup(campaignId);
            $scope.mainEntityEdit.servingSetting.impressionsPerUser = -1;
            $scope.mainEntityEdit.servingSetting.impressionsPerDay = -1;
        }

        function editMode() {
            $scope.mainEntityEdit = EC2Restangular.copy($scope.$parent.mainEntity);
            $scope.mainEntityEdit.isSupportedDg = true;
            $scope.deliveryGroupId = $scope.mainEntityEdit.id;
            dgAdCalculateDecision.setSonsRotationOptions($scope.mainEntityEdit.rootContainer);
            if ($scope.mainEntityEdit.servingSetting === null) {
                $scope.mainEntityEdit.servingSetting = deliveryGroupJsonObjects.getDefaultServingSetting();
            }

            if ($scope.mainEntityEdit.defaultAds === null) {
                $scope.mainEntityEdit.defaultAds = [];
            }

            $scope.attachedPlacementsLink.val = ($scope.mainEntityEdit.placements) ? $scope.mainEntityEdit.placements.length + " placements" : "0 placements";

            $scope.essentialArea = {dgName: {open: false}};
            $scope.settings = {open: false};
            $scope.adsArea = {open: true, dgWeight: {open: true}};

            $scope.firstPlacementType = $scope.mainEntityEdit.placementType ? {name: mapPlacementType[$scope.mainEntityEdit.placementType]} : {name: ""};

            $scope.firstAdDimension = dgHelper.getDgUiDimension($scope.mainEntityEdit);
        }

        function getRealAdsByIds(adIds) {
            var ads = [];
            var ad;
            for (var i = 0; i < adIds.length; i++) {
                ad = _.find($scope.ads, {id: adIds[i].masterAdId});
                if (ad) {
                    ads.push(ad);
                }
            }
            return ads;
        }

        function getRealAdById(adId) {
            return  _.find($scope.ads, {id: adId});
        }

        function createUiAdsFromAdsIds(adsIds, uiAdAttributes) {
            var ads = getRealAdsByIds(adsIds);
            var setAds = [];
            for (var i = 0; i < ads.length; i++) {
                setAds.push(createDgAd(ads[i], uiAdAttributes));
            }
            return setAds;
        }

        function createUiAdFromAdId(adId, uiAdAttributes) {
            var ad = getRealAdById(adId);
            return createDgAd(ad, uiAdAttributes);
        }

        function setFrequencyCapping() {
            $scope.FrequencyCapping.impressionsPerUser = ($scope.mainEntityEdit.servingSetting.impressionsPerUser != -1);
            $scope.FrequencyCapping.impressionsPerDay = ($scope.mainEntityEdit.servingSetting.impressionsPerDay != -1);
            $scope.FrequencyCapping.minimumTimeBetweenAds = ($scope.mainEntityEdit.servingSetting.timeBetweenAds != -1);
        }

        function getActiveAds(rootContainer) {

            var subContainers = [];
            if (!rootContainer.subContainers) {
                return subContainers;
            }

            for (var i = 0; i < rootContainer.subContainers.length; i++) {
                var subContainer = rootContainer.subContainers[i];
                if (subContainer.type === dgConstants.strDeliveryGroupAd) {
                    var uiAdAttributes = {showRotation: true, from: dgConstants.strFromRotation};
                    var dgAd = createUiAdFromAdId(subContainer.masterAdId, uiAdAttributes);
                    if (dgAd) {
                        dgAd.rotationSetting = subContainer.rotationSetting;
                        subContainers.push(dgAd)
                    }
                }
                else {
                    subContainer[dgConstants.strFrom] = dgConstants.strFromRotation;
                    subContainer.subContainers = getActiveAds(subContainer);
                    subContainers.push(subContainer);
                }
            }
            return subContainers;
        }

        function setAdsToAdsArea() {
            $scope.activeAds = $scope.mainEntityEdit.rootContainer;
            $scope.activeAds.subContainers = getActiveAds($scope.mainEntityEdit.rootContainer);
            setUiAttributesToActiveAds($scope.activeAds);
            var uiDefaultAdAttributes = {showRotation: false, from: dgConstants.strFromDefault};
            $scope.mainEntityEdit.defaultAds = createUiAdsFromAdsIds($scope.mainEntityEdit.defaultAds, uiDefaultAdAttributes);
            dgAdCalculateDecision.calculate($scope.mainEntityEdit.rootContainer, actionOptions.setTotalWeightForAllContainer);
        }

        function setUiAttributesToActiveAds(container) {
            if (!container.subContainers) {
                return;
            }

            for (var i = 0; i < container.subContainers.length; i++) {
                var subContainer = container.subContainers[i];
                if (subContainer.type === dgConstants.strAdContainer) {
                    subContainer.showRotation = true;
                    setUiAttributesToActiveAds(subContainer);
                }
                else {
                    subContainer.showRotation = subContainer.rotationSetting.enabled;
                }
            }
        }

        function setTimeBetweenAds() {
            $scope.mainEntityEdit.servingSetting.timeBetweenAds = ($scope.mainEntityEdit.servingSetting.timeBetweenAds == -1) ? null : $scope.mainEntityEdit.servingSetting.timeBetweenAds;
            var res = secConversion.fromSec($scope.mainEntityEdit.servingSetting.timeBetweenAds);
            $scope.selectedTimeUnit.id = res.timeUnit;
            $scope.timeBetweenAds.value = res.time;
        }

        function refreshMainEntity(data) {
            mmAlertService.addSuccess("dgSaveSuccess");
            return $scope.$parent.mainEntity = data;
        }

        function save() {
            $scope.mainEntityEdit.servingSetting.timeBetweenAds = $scope.timeBetweenAds.value;
            if (dgValidation.saveValidation([$scope.mainEntityEdit])) {
                beforeSave();
                var dg = EC2Restangular.copy($scope.mainEntityEdit);
                var res;
                if (!$scope.entityId) {
                    res = serverDeliveryGroup.post(dg).then(refreshMainEntity, processError);
                }
                else {
                    res = dg.put().then(refreshMainEntity, processError);
                }
                afterSave();
                return res;
            }
            else {
                mmAlertService.addErrorOnTop("Please fix the errors below.");
            }
        }

        function beforeSave() {
            calcTimeBetweenAds();
            setAdsBeforeSave();
            dgHelper.updateImpressionsPerUserBeforeSave($scope.mainEntityEdit);
        }

        function afterSave() {
            $scope.mainEntityEdit.defaultAds = tempDefaultAds;
        }

        function setAdsBeforeSave() {
            $scope.mainEntityEdit.rootContainer = $scope.activeAds;
            tempDefaultAds = angular.copy($scope.mainEntityEdit.defaultAds);
        }

        function processError(error) {
            if (error.data.error === undefined) {
                mmAlertService.addError("Server error. Please try again later");
            } else {
                mmAlertService.addError(error.data.error);
            }
        }

        function calcTimeBetweenAds() {
            var valToSec = {timeUnit: $scope.selectedTimeUnit.id, time: $scope.timeBetweenAds.value};
            $scope.mainEntityEdit.servingSetting.timeBetweenAds = secConversion.toSec(valToSec);
        }

        $scope.rotations = enums.rotationSettingType;

        $scope.timeOptions = [
            {id: secConversion.allNumbers[0], name: 'Seconds'},
            {id: secConversion.allNumbers[1], name: 'Minutes'},
            {id: secConversion.allNumbers[2], name: 'Hours'},
            {id: secConversion.allNumbers[3], name: 'Days'},
            {id: secConversion.allNumbers[4], name: 'Weeks'},
            {id: secConversion.allNumbers[5], name: 'Months'}
        ];

        $scope.onImpressionsPerUserClick = function () {
            if ($scope.FrequencyCapping.impressionsPerUser) {
                $scope.mainEntityEdit.servingSetting.impressionsPerUser = 1;
            }
            else if (!$scope.FrequencyCapping.impressionsPerUser) {
                $scope.mainEntityEdit.servingSetting.impressionsPerUser = null;
            }
        };

        $scope.onImpressionsPerDayClick = function () {
            if ($scope.FrequencyCapping.impressionsPerDay) {
                $scope.mainEntityEdit.servingSetting.impressionsPerDay = 1;
            }
            else if (!$scope.FrequencyCapping.impressionsPerDay) {
                $scope.mainEntityEdit.servingSetting.impressionsPerDay = null;
            }
        };

        $scope.onTimeBetweenAdsClick = function () {
            if (!$scope.FrequencyCapping.minimumTimeBetweenAds) {
                $scope.timeBetweenAds.value = null;
            }
            $scope.selectedTimeUnit.id = secConversion.allNumbers[0];
        };

        (function fillImpressionDropDown() {
            $scope.impressionsPerUserDD = [];
            $scope.impressionsPerUserPerDayDD = [];
            for (var i = 1; i < 61; i++) {
                var val = {id: i, name: i};
                $scope.impressionsPerUserDD.push(val);
                $scope.impressionsPerUserPerDayDD.push(val);
            }
        })();

        var assignEvent = $scope.$on(dgConstants.assignAdsAction, function (e, selectedMasterAds) {
            $scope.$root.isDirtyEntity = true;
            $scope.addAds(selectedMasterAds);
        });

        function createDgAd(ad, uiAdAttributes) {
            var showRotation = uiAdAttributes.showRotation, from = uiAdAttributes.from, parentContainer = uiAdAttributes.parentContainer;
            if (!ad) {
                return null;
            }

            if (!showRotation) {
                showRotation = false;
            }

            var dgAd = {};
            dgAd['type'] = dgConstants.strDeliveryGroupAd;
            if (parentContainer !== undefined) {
                dgAd['rotationSetting'] = {type: parentContainer.childRotationType, enabled: true};
            } else if (from === dgConstants.strFromDefault) {
                dgAd['rotationSetting'] = {type: 'EvenDistribution', enabled: true};
            }

            dgAd[dgConstants.strMasterAdId] = (ad.id) ? ad.id : ad[dgConstants.strMasterAdId];
            dgAd['name'] = ad.name;
            dgAd['showRotation'] = showRotation;
            dgAd[dgConstants.strFrom] = from;
            return dgAd;
        }

        function pushToAdArray(addToArray, selectedMasterAds, uiAdAttributes) {
            for (var i = 0; i < selectedMasterAds.length; i++) {
                addToArray.push(createDgAd(selectedMasterAds[i], uiAdAttributes));
            }
        }

        function pushAdToContainer(selectedAds) {
            var selectedContainer = getSelectedAdContainer($scope.activeAds);
            if (!selectedContainer) {
                selectedContainer = $scope.activeAds;
            }
            var uiAdAttributes = {showRotation: true, from: dgConstants.strFromRotation, parentContainer: selectedContainer};
            pushToAdArray(selectedContainer.subContainers, selectedAds, uiAdAttributes);
            dgAdCalculateDecision.calculate(selectedContainer, actionOptions.add);
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

        function validateAdTypeAndSize(ad) {
            var isAdValid = dgValidation.isAdTypeValid($scope.mainEntityEdit, ad);
            dgValidation.isAdSizeValid($scope.mainEntityEdit, ad);
            return isAdValid;
        }

        function validateAdsTypeAndSize(selectedMasterAds) {
            var valid = true;
            for (var i = 0; i < selectedMasterAds.length; i++) {
                if (!validateAdTypeAndSize(selectedMasterAds[i])) {
                    valid = false;
                    break;
                }
            }
            return valid;
        }

        // Assign Ads
        $scope.addAds = function (selectedMasterAds) {
            if (selectedMasterAds === null || selectedMasterAds === undefined || selectedMasterAds.length < 1) return;
            if (!validateAdsTypeAndSize(selectedMasterAds)) return;

            if (!$scope.defaultAdsCB.isSelected) { // Active Ads
                if ($scope.activeAds === undefined) {
                    $scope.activeAds = [];
                    $scope.activeAds.subContainers = [];
                }
                pushAdToContainer(selectedMasterAds);
            }
            else if ($scope.defaultAdsCB.isSelected) { // Default Ads
                var uiAdAttributes = {showRotation: false, from: dgConstants.strFromDefault};
                pushToAdArray($scope.mainEntityEdit.defaultAds, selectedMasterAds, uiAdAttributes);
                $scope.mainEntityEdit.defaultAds = _.uniq($scope.mainEntityEdit.defaultAds, dgConstants.strMasterAdId);
            }
        };

        $scope.frequencyCappingLevel = [
            {name: "Each Placement Separately", id: true},
            {name: "Entire Delivery Group(Across Placements)", id: false}
        ];

        function unCheckDisabledAds(container) {
            if (!container.subContainers) {
                return;
            }
            for (var i = 0; i < container.subContainers.length; i++) {
                var subContainer = container.subContainers[i];
                if (subContainer.type === dgConstants.strAdContainer) {
                    unCheckDisabledAds(subContainer);
                } else if (subContainer.selected && !subContainer.rotationSetting.enabled) {
                    subContainer.selected = false;
                }
            }
        }

        $scope.unCheckALlDefaultServeItems = function () {
            if ($scope.mainEntityEdit.servingSetting.serveDefaultImage) {
                $scope.defaultAdsCB.isSelected = false;
            }
            for (var i = 0; i < $scope.mainEntityEdit.defaultAds.length; i++) {
                $scope.mainEntityEdit.defaultAds[i].selected = false;
            }
        };

        //region Button Action
        $scope.preview = function () {
            $scope.$broadcast(dgConstants.dgTreeBroadcastAction.preview);
        };

        $scope.createSubGroup = function () {
            $scope.mainEntityEdit.selected = true;
            $scope.$broadcast(dgConstants.dgTreeBroadcastAction.newSubGroup);
        };

        $scope.enableDisableAds = function () {
            $scope.$broadcast(dgConstants.dgTreeBroadcastAction.disableEnable);
        };

        var disableEnableResolveEvent = $scope.$on(dgConstants.dgTreeBroadcastAction.disableEnableResolve, function (e, buttonState) {
            $scope.buttonState = buttonState;

        });

        $scope.remove = function () {
            $scope.$broadcast(dgConstants.dgTreeBroadcastAction.remove);
        };
        //endregion

        $scope.$on('$destroy', function () {
            $scope.mainEntityEdit = null;
            if (watcher) watcher();
            if (disableEnableResolveEvent) {
                disableEnableResolveEvent();
            }
            if (assignEvent) {
                assignEvent();
            }
        });
    }]);
