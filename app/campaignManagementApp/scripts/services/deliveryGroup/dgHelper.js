'use strict';

app.service('dgHelper', ['enums', 'EC2Restangular', 'dgConstants', '$rootScope', function (enums, EC2Restangular, dgConstants, $rootScope) {
  var rotations = enums.rotationSettingType;
  var placementTypes = enums.placementTypes;
  var _mapAdFormat = null;
  var _mapPlacementType = null;

  // return true for >> undefined,null,{},[],'',"",number,true,false
  function isEmptyOrNull(val) {
    return _.isNull(val) || _.isEmpty(val);
  }

  /**
   * Check if a number is integer
   * @param {Number} num
   * @param {Boolean} useExactlyEqual - equal value and equal type
   * @return {Boolean} isInteger
   **/
  function isInt(num, useExactlyEqual) {
    var isInteger;
    if (useExactlyEqual === true) {
      isInteger = num === Math.round(num);
    }
    else {
      isInteger = num == Math.round(num);
    }
    return isInteger;
  }

  function removeObjectFromArray(arr, objToRemove) {
    var index = _.findIndex(arr, function (item) {
      return item === objToRemove;
    });
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

  function isAdOrRootContainer(item) {
    return item.type === dgConstants.strAdContainer || item.type === dgConstants.strRootContainer;
  }

  function isAdContainer(ad) {
    return ad.type == dgConstants.strAdContainer;
  }

  function isTimeBasedAdContainer(item) {
    return item.type == dgConstants.strAdContainer && item.childRotationType == dgConstants.strTimeBased;
  }

  function isTimeBasedAdContainerWithChildes(item) {
    return item.type == dgConstants.strAdContainer && item.childRotationType == dgConstants.strTimeBased && item.subContainers && item.subContainers.length > 0;
  }

  function isRotationAd(ad) {
    return ad.from == dgConstants.strFromRotation;
  }

  function isDefaultAd(ad) {
    return ad.from == dgConstants.strFromDefault;
  }

  function mapRotationType() {
    var mapRotationType = {};
    var stop = rotations.length;
    for (var i = 0; i < stop; i++) {
      mapRotationType[rotations[i].type] = rotations[i].name;
    }
    return mapRotationType;
  }

  function getUiAdFormat(adFormat) {
    var adFormats = mapAdFormats();
    return adFormats[adFormat];
  }

  function getPlacementTypeFromAdFormat(adFormat) {
    var adFormats = mapAdFormats();
    return enums.mapOfAdFormatToPlacementType[adFormats[adFormat]];
  }

  function getMapPlacementType() {
    if (!_mapPlacementType) {
      var mapPlacementType = {};
      for (var i = 0; i < placementTypes.length; i++) {
        mapPlacementType[placementTypes[i].placementType] = placementTypes[i].name;
      }
      _mapPlacementType = mapPlacementType;
    }

    return _mapPlacementType;
  }

  getMapPlacementType();

  function mapAdFormats() {
    if (!_mapAdFormat) {
      var adFormats = enums.adFormats;
      var mapAdFormats = {};
      var stop = adFormats.length;
      for (var i = 0; i < stop; i++) {
        mapAdFormats[adFormats[i].id] = adFormats[i].name;
      }
      _mapAdFormat = mapAdFormats;
    }
    return _mapAdFormat;
  }

  mapAdFormats();

  function getUIPlacementType(adFormat) {
    return _mapPlacementType[enums.mapOfAdFormatToPlacementType[_mapAdFormat[adFormat]]];
  }

  function maxValidLevelOfSubContainers() {
    return dgConstants.maxTreeDepth;
  }

  function getNowDateWithoutHours() {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  function isDate(date) {
    var isDate = true;
    if (date == undefined || date == null || isNaN(date)) {
      isDate = false;
    }
    return isDate;
  }

  function sortTimeBasedDateByStartDate(subContainers) {
    var cloneDates = EC2Restangular.copy(subContainers);
    return cloneDates.sort(function sortByStartDateAsc(date, nextDate) {
      if (moment(date.rotationSetting.startDate).isSame(nextDate.rotationSetting.startDate)) {
        return 0;
      }
      if (moment(date.rotationSetting.startDate).isBefore(nextDate.rotationSetting.startDate)) {
        return -1;

      }
      if (moment(date.rotationSetting.startDate).isAfter(nextDate.rotationSetting.startDate)) {
        return 1;
      }
      return 0;
    });
  }

  function isAdDisabled(ad) {
    return !ad.rotationSetting.enabled;
  }

  function getDgUiDimension(dg) {
    return (_.isNumber(dg.width) && _.isNumber(dg.height)) ? {dimension: dg.width + "X" + dg.height} : {dimension: ""};
  }

  function updateImpressionsPerUserBeforeSave(dg) {
    if (!dg.servingSetting.impressionsPerUser) {
      dg.servingSetting.impressionsPerUser = -1;
    }
    if (!dg.servingSetting.impressionsPerDay) {
      dg.servingSetting.impressionsPerDay = -1;
    }
  }

  function isMMNext() {
    return $rootScope.isMMNext == undefined;
  }

  function isMM2() {
    return !isMMNext();
  }

  function isSupportedRotationType(item) {
    var supported = true;
    if (isMM2()) {
      supported = dgConstants.supportedRotation[item.childRotationType] != undefined;
    }
    return supported;
  }

  function isServeDefaultImageSelected(dg) {
    return dg.servingSetting.serveDefaultImage;
  }

  function initDgError(dg) {
    if (!dg.errors) {
      dg.errors = {errorDgName: {text: ''}, errorMinimumTimeBetweenAds: {text: ''}};
    }
  }

  return {
    isEmptyOrNull: isEmptyOrNull,
    isInt: isInt,
    removeObjectFromArray: removeObjectFromArray,
    isAdOrRootContainer: isAdOrRootContainer,
    isAdContainer: isAdContainer,
    isTimeBasedAdContainer: isTimeBasedAdContainer,
    isTimeBasedAdContainerWithChildes: isTimeBasedAdContainerWithChildes,
    isRotationAd: isRotationAd,
    isDefaultAd: isDefaultAd,
    mapRotationType: mapRotationType,
    getPlacementTypeFromAdFormat: getPlacementTypeFromAdFormat,
    getUiAdFormat: getUiAdFormat,
    getMapPlacementType: getMapPlacementType,
    mapAdFormats: mapAdFormats,
    getUIPlacementType: getUIPlacementType,
    maxValidLevelOfSubContainers: maxValidLevelOfSubContainers,
    getNowDateWithoutHours: getNowDateWithoutHours,
    isDate: isDate,
    sortTimeBasedDateByStartDate: sortTimeBasedDateByStartDate,
    isAdDisabled: isAdDisabled,
    getDgUiDimension: getDgUiDimension,
    updateImpressionsPerUserBeforeSave: updateImpressionsPerUserBeforeSave,
    isMMNext: isMMNext,
    isMM2: isMM2,
    isSupportedRotationType: isSupportedRotationType,
    isServeDefaultImageSelected: isServeDefaultImageSelected,
    initDgError: initDgError
  };
}]);
