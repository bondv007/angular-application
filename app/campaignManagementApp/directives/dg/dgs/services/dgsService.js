/**
 * Created by Ofir.Fridman on 11/17/14.
 */
'use strict';

app.service('dgsService', ['EC2Restangular', '$q', 'dgHelper', 'mmAlertService', 'deliveryGroupJsonObjects', 'dgValidation', 'dgConstants',
  'dgAdCalculateDecision', 'mmModal', '$rootScope', 'secConversion', 'dgPreviewHelperService', 'deliveryGroups', 'enums', 'smartAttachAdsToDgs', '$filter',
  function (EC2Restangular, $q, dgHelper, mmAlertService, deliveryGroupJsonObjects, dgValidation, dgConstants,
            dgAdCalculateDecision, mmModal, $rootScope, secConversion, dgPreviewHelperService, deliveryGroups, enums, smartAttachAdsToDgs, $filter) {
    var actionOptions = dgAdCalculateDecision.actionOptions();

    function renderDgs(dgs, ads) {
      if (dgs.length > 0) {
        createDgsUi(dgs, ads);
      }
    }

    function createDgsUi(dgs, ads) {
      var dg;
      var dgToggleOpen = dgs.length == 1;
      for (var i = 0; i < dgs.length; i++) {
        dg = dgs[i];
        dg.dgToggleOpen = {open: dgToggleOpen};
        dg.isSupportedDg = isSupportedDg(dg.rootContainer, null);
        dg.uiPlacementType = dg.placementType ? enums.mapOfMM2PlacementTypeToMMNextType[dg.placementType] : "";
        dgAdCalculateDecision.calculate(dg.rootContainer, actionOptions.setTotalWeightForAllContainer);
        dgAdCalculateDecision.setSonsRotationOptions(dg.rootContainer);
        dg.dimension = dgHelper.getDgUiDimension(dg).dimension;
        dg.errors = {errorDgName: {text: ''}, errorMinimumTimeBetweenAds: {text: ''}};
        dg.trackId = _.uniqueId('dg_');
        convertServerAdsToDgRotationAds(dg.rootContainer.subContainers, ads);
        convertServerAdsToDgDefaultAds(dg.defaultAds, ads);
      }
    }

    function convertServerAdsToDgRotationAds(subContainers, ads) {
      for (var j = 0; j < subContainers.length; j++) {
        var ad = subContainers[j];
        if (dgHelper.isAdContainer(ad)) {
          convertServerAdsToDgRotationAds(ad.subContainers, ads);
        }
        else {
          if(!ad.name){
            ad.name = getAdName(ads, ad.masterAdId);
          }
          ad.showRotation = ad.rotationSetting.enabled;
          ad.from = dgConstants.strFromRotation;
          ad.isSelected = false;
        }
      }
    }

    function convertServerAdsToDgDefaultAds(defaultAds, ads) {
      if (defaultAds) {
        for (var j = 0; j < defaultAds.length; j++) {
          var ad = angular.copy(defaultAds[j]);
          var uiAd = {};
          uiAd.__type = ad.__type;
          uiAd.type = ad.type;
          uiAd.rotationSetting = {
            __type: dgConstants.mm2RotationSettingType.EvenDistribution,
            enabled: true,
            type: dgConstants.strEvenDistribution
          };
          uiAd.masterAdId = ad.masterAdId;
          uiAd.showRotation = false;
          uiAd.from = dgConstants.strFromDefault;
          uiAd.name = getAdName(ads, uiAd.masterAdId);
          uiAd.isSelected = false;
          defaultAds[j] = uiAd;
        }
      }
    }

    function getAdName(ads, adId) {
      var name = "";
      if (adId) {
        var ad = _.find(ads, {id: adId});
        if (ad && ad.name) {
          name = _.find(ads, {id: adId}).name;
        }
      }
      return name;
    }

    function save(copyTargetAudienceDgs, detachedDgs, copyCampaignDgs) {
      var defer = $q.defer();
      if (dgValidation.saveMultipleDgsValidation(copyTargetAudienceDgs, copyCampaignDgs)) {
        var cloneDg;
        var putDgs = [];
        var postDgs = [];
        var mapOfDetachedDgIds = {};

        angular.forEach(detachedDgs, function (detachedDg) {
          if (detachedDg.id != null && mapOfDetachedDgIds[detachedDg.id] == undefined) {
            mapOfDetachedDgIds[detachedDg.id] = detachedDg.id;
            putDgs.push(detachedDg);
          }
        });

        angular.forEach(copyTargetAudienceDgs, function (dg) {
          cloneDg = angular.copy(dg);
          cloneDg.errors = {errorDgName: ""};
          removeDefaultAdsBeforeSave(cloneDg);
          dgHelper.updateImpressionsPerUserBeforeSave(cloneDg);
          calcTimeBetweenAds(cloneDg);
          if (cloneDg.id) {
            putDgs.push(cloneDg);
          }
          else {
            postDgs.push(cloneDg);
          }
        });

        deliveryGroups.saveDeliveryGroups(putDgs, postDgs).then(function (responses) {
          defer.resolve(responses);
        });
      }
      return defer.promise;
    }

    function removeDefaultAdsBeforeSave(cloneDg) {
      if (isMM2() && dgHelper.isServeDefaultImageSelected(cloneDg)) {
        cloneDg.defaultAds = [];
      }
    }

    function calcTimeBetweenAds(dg) {
      if (dg.timeBetweenAds && dg.timeBetweenAds.selectedTimeUnit) {
        var valToSec = {timeUnit: dg.timeBetweenAds.selectedTimeUnit.id, time: dg.servingSetting.timeBetweenAds};
        dg.servingSetting.timeBetweenAds = secConversion.toSec(valToSec);
      }
    }

    function createNewDg(dgs, campaignId, selectedTargetAudience, campaignDgs) {
      var newDg = deliveryGroupJsonObjects.newDeliveryGroup(campaignId);
      removeTimeBaseRotationFromRootContainer(newDg);
      newDg.targetAudienceId = selectedTargetAudience.id;
      newDg.dgToggleOpen = {open: true};
      newDg.trackId = _.uniqueId('newDg_');
      dgNameCreator(selectedTargetAudience, newDg, campaignDgs, dgs);
      dgs.unshift(newDg);
      $rootScope.isDirtyEntity = true;
    }

    function removeTimeBaseRotationFromRootContainer(dg) {
      if (isMM2()) {
        for (var i = 0; i < dg.rootContainer.rotations.length; i++) {
          if (dg.rootContainer.rotations[i].id == dgConstants.strTimeBased) {
            dg.rootContainer.rotations.splice(i, 1);
            break;
          }
        }
      }
    }

    function isDisableEnable(dgsEnableDisableState) {
      var disableEnable = false;
      var states = _.flatten(_.values(dgsEnableDisableState), "text");
      if (Object.keys(dgsEnableDisableState).length == 0) {
        disableEnable = true;
      }
      else if (_.contains(states, dgConstants.disableEnableButtonOptions.disableEnable)) {
        disableEnable = true;
      }
      else {
        disableEnable = _.contains(states, dgConstants.disableEnableButtonOptions.disable) && _.contains(states, dgConstants.disableEnableButtonOptions.enable);
      }
      return disableEnable;
    }

    function displayExistingDgs(campaignDgs, selectedTargetAudience) {
      var defer = $q.defer();
      mmAlertService.closeAll();
      var modalInstance = mmModal.open({
        templateUrl: "campaignManagementApp/directives/dg/dgs/views/templates/existingDgs.html",
        controller: "existingDgCtrl",
        title: "Select Existing Delivery Group",
        modalWidth: 1000,
        bodyHeight: 500,
        discardButton: {name: "Close", funcName: "cancel"},
        additionalButtons: [
          {name: "Assign & Save", funcName: "onSelect", isPrimary: true}
        ],
        resolve: {
          campaignDgs: function () {
            return campaignDgs;
          },
          selectedTaId: function () {
            return selectedTargetAudience.id;
          }
        }
      });

      modalInstance.result.then(function () {
        defer.resolve(true);
      }, function () {
        // On cancel do nothing
        defer.reject(false);
      });

      return defer.promise;
    }

    function openRemoveModal(scope) {
      var existDgs = getExistingAndSelectedDgs(scope.copyTargetAudienceDgs);
      if (dgValidation.saveMultipleDgsValidation(existDgs, scope.copyCampaignDgs)) {
        mmAlertService.closeAllExceptSuccess();
        var isAtListOneDgSelected = _.find(scope.copyTargetAudienceDgs, {'selected': true});
        if (isAtListOneDgSelected != null) {
          var targetAudienceName = scope.copyTargetAudienceDgs[0].targetAudienceName;
          var modalInstance = mmModal.open({
            templateUrl: 'campaignManagementApp/directives/dg/dgs/views/templates/removeDgsDialog.html',
            controller: 'removeDgsDialogCtrl',
            title: "Remove Delivery Groups",
            modalWidth: 420,
            bodyHeight: 86,
            confirmButton: {name: "Continue", funcName: "discard"},
            discardButton: {name: "Cancel", funcName: "cancel"},
            resolve: {
              targetAudienceName: function () {
                return targetAudienceName;
              }
            }
          });
          modalInstance.result.then(function () {
            var selectedDgs = _.remove(scope.copyTargetAudienceDgs, function (item) {
              if (item.selected) {
                var dg = _.find(scope.copyCampaignDgs, function (campaignDg) {
                  return campaignDg.id == item.id;
                });
                if (dg) {
                  dg.targetAudienceId = null;
                  dg.targetAudienceName = null;
                }
              }
              return item.selected;
            });

            updateDetachedDgs(scope, selectedDgs);

            unSelectSelectedDgs(selectedDgs);

          }, function () {
          });
        }
      }
    }

    function updateDetachedDgs(scope, selectedDgs) {
      var dg;
      for (var i = 0; i < selectedDgs.length; i++) {
        dg = selectedDgs[i];
        if (dg != null) {
          dg.targetAudienceId = null;
          dg.targetAudienceName = null;
          scope.detachedDgs.push(dg);
        }
      }
    }

    function unSelectSelectedDgs(selectedDgs) {
      angular.forEach(selectedDgs, function (selectedDg) {
        selectedDg.selected = false;
      });
    }

    function preview(copyTargetAudienceDgs) {
      var selectedDgs = _.filter(copyTargetAudienceDgs, {selected: true});
      if (selectedDgs.length > 0) {
        dgPreviewHelperService.previewAdsByDgId(_.pluck(selectedDgs, 'id'), false);
      }
      else {
        var adIds = [];
        angular.forEach(copyTargetAudienceDgs, function (dg) {
          getAllSelectedAds(dg.rootContainer.subContainers, adIds);
        });

        dgPreviewHelperService.previewAdsByDgId(adIds, true);
      }
    }

    function getAllSelectedAds(subContainer, adIds) {
      angular.forEach(subContainer, function (item) {
        if (dgHelper.isAdContainer(item)) {
          getAllSelectedAds(item.subContainers, adIds);
        } else if (item.selected) {
          adIds.push(item.masterAdId);
        }
      });
    }

    function disablePreview(copyTargetAudienceDgs, dgsEnableDisableState) {
      var disable = true;
      if (isAtListOneDgOrAdSelected(copyTargetAudienceDgs, false)) {
        var dgSelected = _.find(copyTargetAudienceDgs, function (dg) {
          return dg.selected;
        });
        disable = !!dgSelected && !!Object.keys(dgsEnableDisableState)[0];
      }
      if (!isMM2() && isAtListOneDgSelected(copyTargetAudienceDgs)) {
        disable = true;
      }
      return disable;
    }

    function disableButton(copyTargetAudienceDgs, checkIfDgSelected) {
      var disable = false;
      if (isMM2()) {
        var unSupportedDgs = getUnSupportedDgs(copyTargetAudienceDgs);
        disable = checkIfDefaultAdSelectedForUnSupportedDgs(unSupportedDgs);
        if (!disable) {
          disable = checkIfRotationAdOrDgSelectedForUnSupportedDgs(unSupportedDgs, checkIfDgSelected);
        }
      }
      return disable;
    }

    function checkIfRotationAdOrDgSelectedForUnSupportedDgs(unSupportedDgs, checkIfDgSelected) {
      var disable = false;
      if (unSupportedDgs.length > 0) {
        var dgSelected = _.find(unSupportedDgs, function (dg) {
          return dg.selected;
        });
        if (checkIfDgSelected && dgSelected) {
          disable = true;
        }
        else {
          for (var i = 0; i < unSupportedDgs.length; i++) {
            var isAdSelected = isAtListOneAdSelected(unSupportedDgs[i].rootContainer.subContainers);
            if (isAdSelected) {
              disable = true;
              break;
            }
          }
        }
      }

      return disable;
    }

    function checkIfDefaultAdSelectedForUnSupportedDgs(unSupportedDgs) {
      var disable = false;
      var isDefaultAdSelected = false;
      for (var i = 0; i < unSupportedDgs.length; i++) {
        isDefaultAdSelected = _.find(unSupportedDgs[i].defaultAds, function (ad) {
          return ad.selected;
        });
        if (isDefaultAdSelected) {
          disable = true;
          break;
        }
      }
      return disable;
    }

    function isAtListOneAdSelected(subContainer) {
      var item;
      var selected = false;
      for (var i = 0; i < subContainer.length; i++) {
        item = subContainer[i];
        if (item.selected) {
          return true;
        }
        else {
          if (dgHelper.isAdContainer(item)) {
            selected = isAtListOneAdSelected(item.subContainers);
            if (selected) {
              break;
            }
          }
        }
      }

      return selected;
    }

    function isSupportedDg(rootContainer, subContainer) {
      var support = true;

      if (rootContainer) {
        support = dgHelper.isSupportedRotationType(rootContainer);
        subContainer = rootContainer.subContainers;
      }

      if (support) {
        for (var i = 0; i < subContainer.length; i++) {
          var item = subContainer[i];
          if (dgHelper.isAdContainer(item)) {
            if (dgHelper.isSupportedRotationType(item)) {
              support = isSupportedDg(null, item.subContainers);
              if (!support) {
                return false;
              }
            }
            else {
              return false
            }
          }
        }
      }

      return support;
    }

    function getExistingDgs(dgs) {
      return _.filter(dgs, function (dg) {
        return dg.id != null;
      });
    }

    function getSelectedDgs(dgs) {
      return _.filter(dgs, function (dg) {
        return dg.selected;
      });
    }

    function getExistingAndSelectedDgs(dgs) {
      return getSelectedDgs(getExistingDgs(dgs));
    }

    function getUnSupportedDgs(copyTargetAudienceDgs) {
      return _.filter(copyTargetAudienceDgs, {'isSupportedDg': false})
    }

    function setDisableEnableButtonText(dgsEnableDisableState, buttonState) {
      var cloneDgsEnableDisableState = angular.copy(dgsEnableDisableState);
      if (isDisableEnable(cloneDgsEnableDisableState)) {
        buttonState.text = dgConstants.disableEnableButtonOptions.disableEnable;
      }
      else {
        buttonState = _.values(cloneDgsEnableDisableState)[0];
      }
      return buttonState;
    }

    function getCampaignAndTargetAudienceDgs(selectedTargetAudienceId) {
      var promises = [];
      var defer = $q.defer();
      if (!isDefaultTargetAudience(selectedTargetAudienceId)) {
        promises.push(deliveryGroups.getTargetAudienceDeliveryGroups(selectedTargetAudienceId));
      }
      promises.push(deliveryGroups.getCampaignDeliveryGroups());

      $q.all(promises).then(function (responses) {
        defer.resolve(responses);
      }, function (err) {
        mmAlertService.addError("Server error. Please try again later");
        var error = err.data.error;
        for (var i = 0; i < error.length; i++) {
          for (var j = 0; j < error[i].errors.length; j++) {
            mmAlertService.addError(error[i].errors[j]["innerMessage"]);
          }
        }
      });
      return defer.promise;
    }

    function isAtListOneDgOrAdSelected(dgs, includeDefaultAds) {
      var isAtListOneSelected = isAtListOneDgSelected(dgs);
      if (!isAtListOneSelected) {
        var dg;
        for (var i = 0; i < dgs.length; i++) {
          dg = dgs[i];
          if (includeDefaultAds) {
            isAtListOneSelected = isAtListOneDefaultAdSelected(dg.defaultAds);
            if (isAtListOneSelected) {
              break;
            }
          }
          isAtListOneSelected = isAtListOneAdSelected(dg.rootContainer.subContainers);
          if (isAtListOneSelected) {
            break;
          }
        }
      }
      return isAtListOneSelected;
    }

    function isAtListOneDgSelected(dgs) {
      var dgSelected = _.find(dgs, function (dg) {
        return dg.selected;
      });
      return !!dgSelected;
    }

    function isAtListOneDefaultAdSelected(defaultAds) {
      var isAtListOneSelected = false;
      var ad;
      if (defaultAds) {
        for (var i = 0; i < defaultAds.length; i++) {
          ad = defaultAds[i];
          if (ad.selected) {
            isAtListOneSelected = true;
            break;
          }
        }
      }
      return isAtListOneSelected;
    }

    function isAtListOneDgOrSubGroupSelected(copyTargetAudienceDgs) {
      var selected = isAtListOneDgSelected(copyTargetAudienceDgs);
      if (!selected) {
        var dg;
        for (var i = 0; i < copyTargetAudienceDgs.length; i++) {
          dg = copyTargetAudienceDgs[i];
          if (isAtListOneSubGroupSelected(dg.rootContainer.subContainers)) {
            selected = true;
            break;
          }
        }
      }
      return selected;
    }

    function isAtListOneSubGroupSelected(subGroup) {
      var selected = false;
      var item;
      for (var i = 0; i < subGroup.length; i++) {
        item = subGroup[i];
        if (dgHelper.isAdContainer(item) && item.selected) {
          selected = true;
          break;
        }
      }
      return selected;
    }

    function setOnHeaderTargetAudienceName(contextEntityInfo, selectedTargetAudience) {
      contextEntityInfo.name = selectedTargetAudience.name;
      //contextEntityInfo.id = selectedTargetAudience.id;
    }

    function disableEnableRemoveButton(disableButtonsState, isDefaultTaSelected, dgs) {
      var disable = disableButtonsState;
      if (isDefaultTaSelected) {
        var isAtListOneDgSelected = _.find(dgs, {'selected': true});
        if (isAtListOneDgSelected) {
          disable = !!isAtListOneDgSelected;
        }

      }
      return disable;
    }

    function isDefaultTargetAudience(targetAudienceId) {
      return targetAudienceId == null;
    }

    function isMM2() {
      return dgHelper.isMM2();
    }

    function isMMNext() {
      return dgHelper.isMMNext();
    }

    //region Assign
    function assignAdsToDgs(selectedMasterAds, copyTargetAudienceDgs, campaignId) {
      var defer = $q.defer();
      var selectedDgs = $filter('filter')(copyTargetAudienceDgs, {selected: true});
      var selected = getSelectedDGsAndAds(selectedMasterAds, selectedDgs, campaignId);
      if (validationBeforeAttach(selected)) {
        selected.title = "Assign " + selected.numOfAds + " ads to " + selected.numOfDgs + " Delivery Groups";
        selected.placementType = dgHelper.getUIPlacementType(selected.ads[0].adFormat);
        var cloneSelected = EC2Restangular.copy(selected);
        openAssignModal(cloneSelected).then(function () {
            defer.resolve();
          },
          function () {
            defer.reject();
          });
      }
      unSelectedDgs(selectedDgs);
      return defer.promise;
    }

    function unSelectedDgs(selectedDgs) {
      selectedDgs.forEach(function (dg) {
        dg.selected = false;
      });
    }

    function openAssignModal(cloneSelected) {
      mmAlertService.closeAll();
      var defer = $q.defer();
      var modalInstance = mmModal.open({
        templateUrl: 'infra/directives/views/template/wizard/modalWizard.html',
        controller: 'smartAttachDgsToAdsCtrl',
        title: cloneSelected.title,
        modalWidth: 1300,
        bodyHeight: 500,
        discardButton: {name: "Close", funcName: "cancel"},
        resolve: {
          selected: function () {
            return cloneSelected;
          }
        }
      });

      modalInstance.result.then(function () {
        defer.resolve();
        mmAlertService.closeError();
        $rootScope.isDirtyEntity = false;
      }, function () {
        defer.reject();
        mmAlertService.closeError();
        $rootScope.isDirtyEntity = false;
      });
      return defer.promise;
    }

    function validationBeforeAttach(selected) {
      var isValid = true;
      if (selected.ads < 1) {
        mmAlertService.addError("Please select Delivery Groups and Ads.");
        isValid = false;
      }
      else if (!smartAttachAdsToDgs.isAdFormatValid(selected)) {
        isValid = false;
      }
      return isValid;
    }

    function getSelectedDGsAndAds(selectedMasterAds, selectedDgs, campaignId) {
      var mapAdIDsToNames = mapAdIdsToAdNames(selectedMasterAds);
      var numOfDgs = selectedDgs.length;
      var numOfAds = selectedMasterAds.length;
      return {
        deliveryGroups: selectedDgs,
        ads: selectedMasterAds,
        numOfDgs: numOfDgs,
        numOfAds: numOfAds,
        campaignId: campaignId,
        mapAdIDsToNames: mapAdIDsToNames
      };
    }

    function mapAdIdsToAdNames(selectedMasterAds) {
      var stop = selectedMasterAds.length;
      var mapAdIDsToNames = {};
      var ad;
      for (var i = 0; i < stop; i++) {
        ad = selectedMasterAds[i];
        mapAdIDsToNames[ad.id] = ad.name;
      }
      return mapAdIDsToNames;
    }

    //endregion

    //region DG name Creator
    function dgNameCreator(selectedTaName, newDg, campaignDgs, targetAudienceDgs) {
      var dgsNames = getCampaignDgsNames(campaignDgs, targetAudienceDgs);
      var name = selectedTaName.name + dgConstants.strDgNameConvention;
      for (var i = 0; i < Object.keys(dgsNames).length + 1; i++) {
        if (!dgsNames[name + i]) {
          name = name + i;
          if (isMM2() && name.length > 100) {
            name = "";
          }
          break;
        }
      }
      newDg.name = name;
    }

    function getCampaignDgsNames(campaignDgs, targetAudienceDgs) {
      var dgsNames = {};
      targetAudienceDgs.forEach(function (dg) {
        dgsNames[dg.name] = true;
      });
      campaignDgs.forEach(function (dg) {
        dgsNames[dg.name] = true;
      });
      return dgsNames;
    }

    //endregion

    function updateDgs(copyTargetAudienceDgs, dgsResponse, ads) {
      for (var i = 0; i < dgsResponse.length; i++) {
        for (var j = 0; j < copyTargetAudienceDgs.length; j++) {
          if (dgsResponse[i].id == copyTargetAudienceDgs[j].id) {
            copyTargetAudienceDgs[j] = angular.copy(dgsResponse[i]);
          }
        }
      }
      renderDgs(copyTargetAudienceDgs, ads);
    }

    return {
      save: save,
      createNewDg: createNewDg,
      isDisableEnable: isDisableEnable,
      displayExistingDgs: displayExistingDgs,
      unitTests: {calcTimeBetweenAds: calcTimeBetweenAds, createDgsUi: createDgsUi},
      renderDgs: renderDgs,
      openRemoveModal: openRemoveModal,
      preview: preview,
      disablePreview: disablePreview,
      disableButton: disableButton,
      setDisableEnableButtonText: setDisableEnableButtonText,
      getCampaignAndTargetAudienceDgs: getCampaignAndTargetAudienceDgs,
      isAtListOneDgOrAdSelected: isAtListOneDgOrAdSelected,
      isAtListOneDgOrSubGroupSelected: isAtListOneDgOrSubGroupSelected,
      setOnHeaderTargetAudienceName: setOnHeaderTargetAudienceName,
      disableEnableRemoveButton: disableEnableRemoveButton,
      isMM2: isMM2,
      isMMNext: isMMNext,
      assignAdsToDgs: assignAdsToDgs,
      updateDgs: updateDgs
    };
  }]);
