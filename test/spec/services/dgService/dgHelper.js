/**
 * Created by Ofir.Fridman on 8/11/14.
 */
'use strict';
describe('Service: dgHelper', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var dgHelper;
  var rootScope;
  var dgConstants;
  var enums;
  beforeEach(inject(function (_dgHelper_, _$rootScope_, _dgConstants_,_enums_) {
    dgHelper = _dgHelper_;
    rootScope = _$rootScope_;
    dgConstants = _dgConstants_;
    enums = _enums_;
  }));

  var _unitTestHelper = null;
  beforeEach(function () {
    _unitTestHelper = _unitTestHelper || unitTestHelper();
  });

  it('should test the service dgHelper is up', function () {
    expect(!!dgHelper).toBe(true);
  });

  it('should test the service rootScope is up', function () {
    expect(!!rootScope).toBe(true);
  });

  it('should test the service dgConstants is up', function () {
    expect(!!dgConstants).toBe(true);
  });

  it('should test the service enums is up', function () {
    expect(!!enums).toBe(true);
  });

  //region isEmptyOrNull function tests
  it('test isEmptyOrNull function when set val to null,string empty', function () {
    expect(dgHelper.isEmptyOrNull(undefined)).toBe(true);
    expect(dgHelper.isEmptyOrNull(null)).toBe(true);
    expect(dgHelper.isEmptyOrNull({})).toBe(true);
    expect(dgHelper.isEmptyOrNull([])).toBe(true);
    expect(dgHelper.isEmptyOrNull('')).toBe(true);
    expect(dgHelper.isEmptyOrNull("")).toBe(true);
    expect(dgHelper.isEmptyOrNull(10)).toBe(true);
    expect(dgHelper.isEmptyOrNull(true)).toBe(true);
    expect(dgHelper.isEmptyOrNull(false)).toBe(true);
  });

  it('test isEmptyOrNull function when set val to null,string empty', function () {
    expect(dgHelper.isEmptyOrNull(" ")).toBe(false);
    expect(dgHelper.isEmptyOrNull(' ')).toBe(false);
    expect(dgHelper.isEmptyOrNull([1, 2])).toBe(false);
    expect(dgHelper.isEmptyOrNull([
      {id: 1}
    ])).toBe(false);
    expect(dgHelper.isEmptyOrNull({id: 1})).toBe(false);
  });
  //endregion

  //region isInt function tests
  /// Positive Tests is init where useExactlyEqual = false withe real int number
  it('test isInt function with random positive int number', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomPositiveInt(), false)).toBe(true);
  });

  it('test isInt function with random negative int number', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomNegativeInt(), false)).toBe(true);
  });

  it('test isInt function with number 0', function () {
    expect(dgHelper.isInt(0, false)).toBe(true);
  });

  /// Positive Tests is init where useExactlyEqual = false withe string number
  it('test isInt function with random positive string number', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomPositiveInt(true), false)).toBe(true);
  });

  it('test isInt function with random negative string number', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomNegativeInt(true), false)).toBe(true);
  });

  it('test isInt function with string "0"', function () {
    expect(dgHelper.isInt("0", false)).toBe(true);
  });

  /// Positive Tests is init where useExactlyEqual = true withe int number
  it('test isInt function with random positive int number using Exactly Equal', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomPositiveInt(), true)).toBe(true);
  });

  it('test isInt function with random negative int number using Exactly Equal', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomNegativeInt(), true)).toBe(true);
  });

  it('test isInt function with number 0 using Exactly Equal', function () {
    expect(dgHelper.isInt(0, true)).toBe(true);
  });

  /// Negative Tests is init where useExactlyEqual = true withe string number
  it('test isInt function with random positive int string using Exactly Equal', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomPositiveInt(true), true)).toBe(false);
  });

  it('test isInt function with random negative string number using Exactly Equal', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomNegativeInt(true), true)).toBe(false);
  });

  it('test isInt function with number "0" using Exactly Equal', function () {
    expect(dgHelper.isInt("0", true)).toBe(false);
  });

  /// Negative Tests for char and float numbers
  it('test isInt function with random char', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomAlphabetChar(), false)).toBe(false);
    expect(dgHelper.isInt(_unitTestHelper.getRandomAlphabetChar(), true)).toBe(false);
  });

  it('test isInt function with positive float number', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomPositiveFloat(), false)).toBe(false);
    expect(dgHelper.isInt(_unitTestHelper.getRandomPositiveFloat(), true)).toBe(false);
  });

  it('test isInt function with negative float number', function () {
    expect(dgHelper.isInt(_unitTestHelper.getRandomNegativeFloat(), false)).toBe(false);
    expect(dgHelper.isInt(_unitTestHelper.getRandomNegativeFloat(), true)).toBe(false);
  });

  it('test isInt function with null + undefined', function () {
    expect(dgHelper.isInt(null, false)).toBe(false);
    expect(dgHelper.isInt(undefined, false)).toBe(false);
  });
  //endregion

  //region removeObjectFromArray function tests
  it('test removeObjectFromArray function when remove 1 object from arr', function () {

    // Init params
    var objToRemoveFromArr = {name: 'ofir'};
    var arr = [
      {name: 'Dan'},
      objToRemoveFromArr
    ];
    var arrLengthBeforeRemove = arr.length;

    // Action remove obj
    dgHelper.removeObjectFromArray(arr, objToRemoveFromArr);
    var isObjFound = _.indexOf(arr, objToRemoveFromArr) > -1;

    // Assert
    expect(arr.length).toBe(arrLengthBeforeRemove - 1);
    expect(isObjFound).toBe(false);
  });

  it('test removeObjectFromArray function when remove 1 object that not in arr', function () {

    // Init params
    var objToRemoveFromArr = {name: 'ofir'};
    var arr = [
      {name: 'Dan'},
      {name: 'ofir'}
    ];
    var arrLengthBeforeRemove = arr.length;

    // Action remove obj
    dgHelper.removeObjectFromArray(arr, objToRemoveFromArr);

    // Assert
    expect(arr.length).toBe(arrLengthBeforeRemove);
  });
  //endregion

  //region isAdContainer function tests
  it('test isAdContainer function where type = "AdContainer" ', function () {
    expect(dgHelper.isAdContainer({type: "AdContainer"})).toBe(true);
  });

  it('test isAdContainer function where type != "AdContainer"', function () {
    expect(dgHelper.isAdContainer({type: "DeliveryGroupAd"})).toBe(false);
    expect(dgHelper.isAdContainer({type: ""})).toBe(false);
    expect(dgHelper.isAdContainer({type: ''})).toBe(false);
    expect(dgHelper.isAdContainer({type: null})).toBe(false);
    expect(dgHelper.isAdContainer({type: undefined})).toBe(false);
    expect(dgHelper.isAdContainer({})).toBe(false);
  });
  //endregion

  //region isRotationAd function tests
  it('test isRotationAd function where type = "rotation" ', function () {
    expect(dgHelper.isRotationAd({from: "rotation"})).toBe(true);
  });

  it('test isAdContainer function where type != "rotation"', function () {
    expect(dgHelper.isRotationAd({from: "DeliveryGroupAd"})).toBe(false);
    expect(dgHelper.isRotationAd({from: ""})).toBe(false);
    expect(dgHelper.isRotationAd({from: ''})).toBe(false);
    expect(dgHelper.isRotationAd({from: null})).toBe(false);
    expect(dgHelper.isRotationAd({from: undefined})).toBe(false);
    expect(dgHelper.isRotationAd({})).toBe(false);
  });
  //endregion

  //region isDefaultAd function tests
  it('test isDefaultAd function where type = "default" ', function () {
    expect(dgHelper.isDefaultAd({from: "default"})).toBe(true);
  });

  it('test isDefaultAd function where type != "default"', function () {
    expect(dgHelper.isDefaultAd({from: "DeliveryGroupAd"})).toBe(false);
    expect(dgHelper.isDefaultAd({from: ""})).toBe(false);
    expect(dgHelper.isDefaultAd({from: ''})).toBe(false);
    expect(dgHelper.isDefaultAd({from: null})).toBe(false);
    expect(dgHelper.isDefaultAd({from: undefined})).toBe(false);
    expect(dgHelper.isDefaultAd({})).toBe(false);
  });
  //endregion

  //region mapRotationType
  it('test mapRotationType',function(){
    var rotations = enums.rotationSettingType;
    var mapRotationType = dgHelper.mapRotationType();
    rotations.forEach(function(rotation){
      expect(mapRotationType[rotation.type]).toBe(rotation.name);
    });
  });
  //endregion

  //region getUiAdFormat
  it('test getUiAdFormat',function(){
    for (var i = 0; i < enums.adFormats.length; i++) {
      expect(dgHelper.getUiAdFormat(enums.adFormats[i].id)).toBe(enums.adFormats[i].name);
    }
  });
  //endregion

  //region getPlacementTypeFromAdFormat
  it('test getPlacementTypeFromAdFormat check that enums.adFormat and mapOfAdFormatToPlacementType are sync',function(){
    enums.adFormats.forEach(function(adFormat){
      var placementType = dgHelper.getPlacementTypeFromAdFormat(adFormat.id);
      if(placementType == undefined){
        var error = "***Error: add to enums.mapOfAdFormatToPlacementType the new key and value for '" + adFormat.name + "' ***";
        expect("Please read the to be text:").toBe(error);
      }
      else{
        expect(dgHelper.getUiAdFormat(enums.mapOfAdFormatToPlacementType[placementType])).toBe(placementType.name);
      }
    });
  });
  //endregion

  //region getMapPlacementType
  it('test getMapPlacementType',function(){
    var mapPlacementType = dgHelper.getMapPlacementType();
    for (var i = 0; i < enums.placementTypes.length; i++) {
      expect(mapPlacementType[enums.placementTypes[i].id]).toBe(enums.placementTypes[i].name);
    }
  });
  //endregion

  //region mapAdFormats
  it('test mapAdFormats',function(){
    var mapAdFormats = dgHelper.mapAdFormats();
    for (var i = 0; i < enums.adFormats.length; i++) {
      expect(mapAdFormats[enums.adFormats[i].id]).toBe(enums.adFormats[i].name);
    }
  });
  //endregion

  //region getUIPlacementType
  it('test getUIPlacementType',function(){
    var expectedRes = {
      'ENHANCED_STANDARD_BANNER_AD':'In Banner',
      'EXPANDABLE_BANNER_AD':'In Banner',
      'FLOATING_AD':'Out of Banner',
      'HTML5_RICH_MEDIA_BANNER_AD':'In Banner',
      'HTML5_EXPANDABLE_BANNER_AD':'In Banner',
      'HTML5_SINGLE_EXPANDABLE_BANNER_AD':'Out of Banner',
      'INSTREAM_AD':'In-Stream Video',
      'INSTREAM_INTERACTIVE_AD':'In-Stream Video',
      'INSTREAM_ENHANCED_AD':'In-Stream Video',
      'PUSHDOWN_BANNER_AD':'Out of Banner',
      'RICH_MEDIA_BANNER_AD':'In Banner',
      'SINGLE_EXPANDABLE_BANNER_AD':'In Banner',
      'STANDARD_BANNER_AD':'In Banner',
      'TRACKING_PIXEL_AD':'Tracking'
    }

    for (var adFormatId in expectedRes){
      expect(dgHelper.getUIPlacementType(adFormatId)).toBe(expectedRes[adFormatId]);
    }
  });
  //endregion

  //region isTimeBasedAdContainer
  it('test isTimeBasedAdContainer function when the container={type:"AdContainer",childRotationType:"TimeBased"}', function () {
    var container = {type: "AdContainer", childRotationType: "TimeBased"};
    expect(dgHelper.isTimeBasedAdContainer(container)).toBe(true);
  });

  it('test isTimeBasedAdContainer function when the container={}', function () {
    var container = {};
    expect(dgHelper.isTimeBasedAdContainer(container)).toBe(false);
  });

  it('test isTimeBasedAdContainer function when the container={type:"AdContainer",childRotationType:"Weighted"}', function () {
    var container = {type: "AdContainer", childRotationType: "Weighted"};
    expect(dgHelper.isTimeBasedAdContainer(container)).toBe(false);
  });

  it('test isTimeBasedAdContainer function when the container={type:"DeliveryGroupAd",childRotationType:"TimeBased"}', function () {
    var container = {type: "DeliveryGroupAd", childRotationType: "TimeBased"};
    expect(dgHelper.isTimeBasedAdContainer(container)).toBe(false);
  });
  //endregion

  //region isTimeBasedAdContainerWithChildes
  it('test is TimeBased Ad Container With Childes in case yes',function(){
    var item = {type : dgConstants.strAdContainer,childRotationType:dgConstants.strTimeBased, subContainers:[1]};
    expect(dgHelper.isTimeBasedAdContainerWithChildes(item)).toBe(true);
  });

  it('test is TimeBased Ad Container With Childes in case no',function(){
    var item = {type: dgConstants.strAdContainer, childRotationType: dgConstants.strTimeBased, subContainers: []};
    expect(dgHelper.isTimeBasedAdContainerWithChildes(item)).toBe(false);
    item = {type: dgConstants.strAdContainer, childRotationType: dgConstants.strEvenDistribution, subContainers: [1]};
    expect(dgHelper.isTimeBasedAdContainerWithChildes(item)).toBe(false);
    var item = {type: dgConstants.strDeliveryGroupAd, childRotationType: dgConstants.strTimeBased, subContainers: [1]};
    expect(dgHelper.isTimeBasedAdContainerWithChildes(item)).toBe(false);
  });
  //endregion

  //region isDate
  it('test isDate function when set date', function () {
    expect(dgHelper.isDate(new Date())).toBe(true);
  });

  it('test isDate function when set ticks', function () {
    expect(dgHelper.isDate(new Date().getTime())).toBe(true);
  });

  it('test isDate function when the set value is no date', function () {
    expect(dgHelper.isDate(null)).toBe(false);
    expect(dgHelper.isDate(undefined)).toBe(false);
    expect(dgHelper.isDate({})).toBe(false);
  });
  //endregion

  //region getNowDateWithoutHours
  it('test getNowDateWithoutHours function to be equal to now date', function () {
    expect(moment(dgHelper.getNowDateWithoutHours()).isSame(new Date().setHours(0, 0, 0, 0))).toBe(true);
  });

  it('test getNowDateWithoutHours function to be different to now date', function () {
    expect(moment(dgHelper.getNowDateWithoutHours()).isSame(new Date().setHours(1, 0, 0, 0))).toBe(false);
  });
  //endregion

  //region sortTimeBasedDateByStartDate
  it('test sortTimeBasedDateByStartDate function when dates are order', function () {
    var subContainers = [
      {id: 0, rotationSetting: {weight: {startDate: new Date("1977", "01", "01")}}},
      {id: 1, rotationSetting: {weight: {startDate: new Date("2014", "01", "01")}}},
      {id: 2, rotationSetting: {weight: {startDate: new Date("2014", "01", "15")}}},
      {id: 3, rotationSetting: {weight: {startDate: new Date("2014", "01", "27")}}},
      {id: 4, rotationSetting: {weight: {startDate: new Date("2014", "02", "15")}}},
      {id: 5, rotationSetting: {weight: {startDate: new Date("2015", "01", "27")}}}
    ];
    subContainers = dgHelper.sortTimeBasedDateByStartDate(subContainers);

    var numOfTests;
    for (var i = 0; i < subContainers.length; i++) {
      expect(i).toBe(subContainers[i].id);
      numOfTests = i;
    }

    expect(numOfTests).toBe(subContainers.length - 1);

  });

  it('test sortTimeBasedDateByStartDate function when dates are not order', function () {
    var subContainers = [
      {id: 5, rotationSetting: {startDate: new Date("2015", "01", "27")}},
      {id: 4, rotationSetting: {startDate: new Date("2014", "02", "15")}},
      {id: 0, rotationSetting: {startDate: new Date("1977", "01", "01")}},
      {id: 3, rotationSetting: {startDate: new Date("2014", "01", "27")}},
      {id: 2, rotationSetting: {startDate: new Date("2014", "01", "15")}},
      {id: 1, rotationSetting: {startDate: new Date("2014", "01", "01")}}
    ];
    subContainers = dgHelper.sortTimeBasedDateByStartDate(subContainers);

    var numOfTests;
    for (var i = 0; i < subContainers.length; i++) {
      expect(i).toBe(subContainers[i].id);
      numOfTests = i;
    }

    expect(numOfTests).toBe(subContainers.length - 1);

  });
  //endregion

  //region maxValidLevelOfSubContainers
  it('test maxValidLevelOfSubContainers function', function () {
    expect(dgHelper.maxValidLevelOfSubContainers()).toBe(1);
  });
  //endregion

  //region isAdDisabled
  it('test is Ad Disabled when asd is disable', function () {
    var ad = {rotationSetting: {enabled: false}};
    expect(dgHelper.isAdDisabled(ad)).toBe(true);
  });

  it('test is Ad Disabled when asd is enable', function () {
    var ad = {rotationSetting: {enabled: true}};
    expect(dgHelper.isAdDisabled(ad)).toBe(false);
  });
  //endregion

  //region getDgUiDimension
  it('test get dg ui dimension when dg have dimension', function () {
    expect(dgHelper.getDgUiDimension({width: 1, height: 160}).dimension).toEqual("1X160");
    expect(dgHelper.getDgUiDimension({width: 500, height: 400}).dimension).toEqual("500X400");
    expect(dgHelper.getDgUiDimension({width: 11, height: 11}).dimension).toEqual("11X11");
  });

  it('test get dg ui dimension when dg do not have dimension', function () {
    expect(dgHelper.getDgUiDimension({}).dimension).toBe("");
  });

  it('test get dg ui dimension when dg have only width', function () {
    expect(dgHelper.getDgUiDimension({width: 1}).dimension).toBe("");
  });

  it('test get dg ui dimension when dg have only height', function () {
    expect(dgHelper.getDgUiDimension({height: 1}).dimension).toBe("");
  });
  //endregion

  //region isMMNext
  it('test isMMNext ', function () {
    expect(dgHelper.isMMNext()).toBe(true);
  });

  it('test isMM2', function () {
    rootScope.isMMNext = false;
    expect(dgHelper.isMMNext()).toBe(false);
    expect(dgHelper.isMM2()).toBe(true);
  });
  //endregion

  //region isSupportedRotationType
  it('test isSupportedRotationType when types are supported', function () {
    for (var key in dgConstants.supportedRotation) {
      expect(dgHelper.isSupportedRotationType({childRotationType: dgConstants.supportedRotation[key]})).toBe(true);
    }
  });

  it('test isSupportedRotationType when type not supported', function () {
    rootScope.isMMNext = false;
    expect(dgHelper.isSupportedRotationType({childRotationType: "Sequence"})).toBe(false);
  });
  //endregion

  //region isServeDefaultImageSelected
  it('test isServeDefaultImageSelected when it selected', function () {
    expect(dgHelper.isServeDefaultImageSelected({servingSetting: {serveDefaultImage: true}})).toBe(true);
  });

  it('test isServeDefaultImageSelected when it not selected', function () {
    expect(dgHelper.isServeDefaultImageSelected({servingSetting: {serveDefaultImage: false}})).toBe(false);
  });
  //endregion

  //region initDgError
  it('test initDgError when dg errors is undefined',function(){
    var dg = {};
    dgHelper.initDgError(dg);
    expect(dg.errors.errorDgName.text).toBe("");
    expect(dg.errors.errorMinimumTimeBetweenAds.text).toBe("");
  });

  it('test initDgError when dg errors is defined',function(){
    var dg = {errors:{errorDgName:{text:"error1"}, errorMinimumTimeBetweenAds:{text:"error2"}}};
    dgHelper.initDgError(dg);
    expect(dg.errors.errorDgName.text).toBe("error1");
    expect(dg.errors.errorMinimumTimeBetweenAds.text).toBe("error2");
  });
  //endregion

});
