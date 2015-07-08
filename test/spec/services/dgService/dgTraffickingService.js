/**
 * Created by Ofir.Fridman on 11/26/14.
 */
'use strict';
describe('Service: dgsService', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var dgsService, dgConstants, enums, rootScope;

  beforeEach(inject(function (_dgsService_, _dgConstants_, _enums_, _$rootScope_) {
    dgsService = _dgsService_;
    dgConstants = _dgConstants_;
    enums = _enums_;
    rootScope = _$rootScope_;
  }));

  it('should test the service dgsService is up', function () {
    expect(!!dgsService).toBe(true);
  });

  it('should test the service dgConstants is up', function () {
    expect(!!dgConstants).toBe(true);
  });

  it('should test the service enums is up', function () {
    expect(!!enums).toBe(true);
  });

  it('should test the service rootScope is up', function () {
    expect(!!rootScope).toBe(true);
  });

  it('should test if need to display text "Disable\Enable" when at list one of the dg return state of disableEnable', function () {
    var dgsEnableDisableState = [
      {text: dgConstants.disableEnableButtonOptions.disable},
      {text: dgConstants.disableEnableButtonOptions.disableEnable}
    ];
    expect(dgsService.isDisableEnable(dgsEnableDisableState)).toBe(true);
  });

  it('should test if need to display text "Disable\Enable" when none of dg ads or sub group selected', function () {
    var dgsEnableDisableState = [];
    expect(dgsService.isDisableEnable(dgsEnableDisableState)).toBe(true);
  });

  it('should test if need to display text "Disable\Enable" when all dgs return disable state', function () {
    var dgsEnableDisableState = [
      {text: dgConstants.disableEnableButtonOptions.disable},
      {text: dgConstants.disableEnableButtonOptions.disable},
      {text: dgConstants.disableEnableButtonOptions.disable}
    ];
    expect(dgsService.isDisableEnable(dgsEnableDisableState)).toBe(false);
  });

  it('should test if need to display text "Disable\Enable" when all dgs return enable state', function () {
    var dgsEnableDisableState = [
      {text: dgConstants.disableEnableButtonOptions.enable},
      {text: dgConstants.disableEnableButtonOptions.enable},
      {text: dgConstants.disableEnableButtonOptions.enable}
    ];
    expect(dgsService.isDisableEnable(dgsEnableDisableState)).toBe(false);
  });

  it('should test if need to display text "Disable\Enable" when all dgs return enable or disable state', function () {
    var dgsEnableDisableState = [
      {text: dgConstants.disableEnableButtonOptions.disable},
      {text: dgConstants.disableEnableButtonOptions.enable}
    ];
    expect(dgsService.isDisableEnable(dgsEnableDisableState)).toBe(true);
  });

  it('should test Calc Time Between Ads value when id=1', function () {
    var id = 1;
    var dg = {servingSetting: {timeBetweenAds: 1}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(1);

    dg = {servingSetting: {timeBetweenAds: 60}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(60);

    dg = {servingSetting: {timeBetweenAds: 999}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(999);
  });

  it('should test Calc Time Between Ads value when id = 60', function () {
    var id = 60;
    var dg = {servingSetting: {timeBetweenAds: 1}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(1 * id);

    dg = {servingSetting: {timeBetweenAds: 60}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(60 * id);

    dg = {servingSetting: {timeBetweenAds: 999}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(999 * id);
  });

  it('should test Calc Time Between Ads value when id = 3600', function () {
    var id = 3600;
    var dg = {servingSetting: {timeBetweenAds: 1}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(1 * id);

    dg = {servingSetting: {timeBetweenAds: 60}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(60 * id);

    dg = {servingSetting: {timeBetweenAds: 999}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(999 * id);
  });

  it('should test Calc Time Between Ads value when id = 86400', function () {
    var id = 86400;
    var dg = {servingSetting: {timeBetweenAds: 1}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(1 * id);

    dg = {servingSetting: {timeBetweenAds: 60}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(60 * id);

    dg = {servingSetting: {timeBetweenAds: 999}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(999 * id);
  });

  it('should test Calc Time Between Ads value when id = 604800', function () {
    var id = 604800;
    var dg = {servingSetting: {timeBetweenAds: 1}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(1 * id);

    dg = {servingSetting: {timeBetweenAds: 60}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(60 * id);

    dg = {servingSetting: {timeBetweenAds: 999}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(999 * id);
  });

  it('should test Calc Time Between Ads value when id = 2419200', function () {
    var id = 2419200;
    var dg = {servingSetting: {timeBetweenAds: 1}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(1 * id);

    dg = {servingSetting: {timeBetweenAds: 60}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(60 * id);

    dg = {servingSetting: {timeBetweenAds: 999}, timeBetweenAds: {selectedTimeUnit: {id: id}}};
    dgsService.unitTests.calcTimeBetweenAds(dg);
    expect(dg.servingSetting.timeBetweenAds).toBe(999 * id);
  });

  it('should test createNewDg in the top of the array', function () {
    var dgs = [
      {campaignId: "HRA170"}
    ];
    var campaignId = "HRA9OP";
    var selectedTargetAudience = {id: 123};
    dgsService.createNewDg(dgs, campaignId, selectedTargetAudience, []);
    expect(dgs[0].campaignId).toBe("HRA9OP");
    expect(dgs[1].campaignId).toBe("HRA170");
  });

  it('should test the dg name when createNewDg in mmNext', function () {
    var dgs = [];
    var campaignId = "HRA170";
    var taName = "TA";
    for (var i = 0; i < 100; i++) {
      taName = taName+i;
    }
    var selectedTargetAudience = {id: 123, name: taName};
    dgsService.createNewDg(dgs, campaignId, selectedTargetAudience, []);
    dgsService.createNewDg(dgs, campaignId, selectedTargetAudience, []);
    expect(dgs[0].name).toBe(taName + "_DG_1");
    expect(dgs[1].name).toBe(taName + "_DG_0");
  });

  it('should test the dg name when createNewDg  in mm2 and the name length is bigger than 100 chars', function () {
    rootScope.isMMNext = false;
    var dgs = [];
    var campaignId = "HRA170";
    var taName = "TA";
    for (var i = 0; i < 100; i++) {
      taName = taName+i;
    }
    var selectedTargetAudience = {id: 123, name: taName};
    dgsService.createNewDg(dgs, campaignId, selectedTargetAudience, []);
    dgsService.createNewDg(dgs, campaignId, selectedTargetAudience, []);
    expect(dgs[0].name).toBe("");
    expect(dgs[1].name).toBe("");
  });

  it('should test the dg name when createNewDg in mm2 and the name length is less than 100 chars', function () {
    rootScope.isMMNext = false;
    var dgs = [];
    var campaignId = "HRA170";
    var taName = "TA1";
    var selectedTargetAudience = {id: 123, name: taName};
    dgsService.createNewDg(dgs, campaignId, selectedTargetAudience, []);
    dgsService.createNewDg(dgs, campaignId, selectedTargetAudience, []);
    expect(dgs[0].name).toBe(taName + "_DG_1");
    expect(dgs[1].name).toBe(taName + "_DG_0");
  });

  it('should test createDgsUi function init each dg with correct values', function () {
    var dgs = [
      {
        defaultAds: [], width: 120, height: 600, rootContainer: {
        type: dgConstants.strAdContainer, subContainers: [
          {masterAdId: "HRA100", type: dgConstants.strDeliveryGroupAd, rotationSetting: {enabled: true}},
          {masterAdId: "HRA101", type: dgConstants.strDeliveryGroupAd, rotationSetting: {enabled: false}},
          {
            type: dgConstants.strAdContainer, subContainers: [
            {masterAdId: "HRA100", type: dgConstants.strDeliveryGroupAd, rotationSetting: {enabled: true}},
            {masterAdId: "HRA101", type: dgConstants.strDeliveryGroupAd, rotationSetting: {enabled: false}}
          ]
          }
        ]
      }
      },
      {defaultAds: [], width: null, height: null, rootContainer: {type: dgConstants.strAdContainer, subContainers: []}}
    ];
    var ads = [{id: "HRA100", name: "Ad1"}, {id: "HRA101", name: "Ad2"}];
    dgsService.unitTests.createDgsUi(dgs, ads);
    expect(dgs[0].dimension).toBe("120X600");
    expect(dgs[1].dimension).toBe("");
//        // check rotation array contain on the root all rotation types
    for (var i = 0; i < enums.rotationSettingType.length; i++) {
      expect(dgs[0].rootContainer.rotations[i].id).toBe(enums.rotationSettingType[i].id);
      expect(dgs[0].rootContainer.rotations[i].name).toBe(enums.rotationSettingType[i].name);
      expect(dgs[0].rootContainer.rotations[i].type).toBe(enums.rotationSettingType[i].type);
      expect(dgs[1].rootContainer.rotations[i].id).toBe(enums.rotationSettingType[i].id);
      expect(dgs[1].rootContainer.rotations[i].name).toBe(enums.rotationSettingType[i].name);
      expect(dgs[1].rootContainer.rotations[i].type).toBe(enums.rotationSettingType[i].type);
    }
//        // check init dg error options as empty string
    expect(dgs[0].errors.errorDgName.text).toBe("");
    expect(dgs[0].errors.errorMinimumTimeBetweenAds.text).toBe("");
    expect(dgs[0].errors.errorDgName.text).toBe("");
    expect(dgs[0].errors.errorMinimumTimeBetweenAds.text).toBe("");
//        // check dg ads
    expect(dgs[0].rootContainer.subContainers[0].name).toBe("Ad1");
    expect(dgs[0].rootContainer.subContainers[0].showRotation).toBe(true);
    expect(dgs[0].rootContainer.subContainers[0].from).toBe(dgConstants.strFromRotation);
    expect(dgs[0].rootContainer.subContainers[0].isSelected).toBe(false);
    expect(dgs[0].rootContainer.subContainers[1].name).toBe("Ad2");
    expect(dgs[0].rootContainer.subContainers[1].showRotation).toBe(false);
    expect(dgs[0].rootContainer.subContainers[1].from).toBe(dgConstants.strFromRotation);
    expect(dgs[0].rootContainer.subContainers[1].isSelected).toBe(false);

    expect(dgs[0].rootContainer.subContainers[2].subContainers[0].name).toBe("Ad1");
    expect(dgs[0].rootContainer.subContainers[2].subContainers[0].showRotation).toBe(true);
    expect(dgs[0].rootContainer.subContainers[2].subContainers[0].from).toBe(dgConstants.strFromRotation);
    expect(dgs[0].rootContainer.subContainers[2].subContainers[0].isSelected).toBe(false);
//
//        // the second dg should be without ads
    expect(dgs[1].rootContainer.subContainers.length).toBe(0);
  });
});



