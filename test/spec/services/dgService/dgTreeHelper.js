/**
 * Created by Ofir.Fridman on 10/26/14.
 */
'use strict';
describe('Service: dgTreeHelper', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var dgTreeHelper, dgConstants;
  beforeEach(inject(function (_dgTreeHelper_, _dgConstants_) {
    dgTreeHelper = _dgTreeHelper_;
    dgConstants = _dgConstants_;
  }));

  it('should test the service dgConstants is up', function () {
    expect(!!dgConstants).toBe(true);
  });

  it('should test the service dgTreeHelper is up', function () {
    expect(!!dgTreeHelper).toBe(true);
  });

  it('should test getMaxTreeDepth is equal to 2', function () {
    expect(dgTreeHelper.getMaxTreeDepth()).toBe(1);
  });

  it('should test isSubGroup when it sub group', function () {
    expect(dgTreeHelper.isSubGroup({type: dgConstants.strAdContainer})).toBe(true);
  });

  it('should test isSubGroup when it no sub group', function () {
    expect(dgTreeHelper.isSubGroup({type: dgConstants.strDeliveryGroupAd})).toBe(false);
  });

  it('should test isAd when it ad', function () {
    expect(dgTreeHelper.isAd({type: dgConstants.strDeliveryGroupAd})).toBe(true);
  });

  it('should test isAd when it no ad', function () {
    expect(dgTreeHelper.isAd({type: dgConstants.strAdContainer})).toBe(false);
  });

  it('should test isAdEnable when it enable', function () {
    expect(dgTreeHelper.isAdEnable({rotationSetting: {enabled: true}})).toBe(true);
  });

  it('should test isAdEnable when it disable', function () {
    expect(dgTreeHelper.isAdEnable({rotationSetting: {enabled: false}})).toBe(false);
  });

  it('should test isAdDisable when it disable', function () {
    expect(dgTreeHelper.isAdDisable({rotationSetting: {enabled: false}})).toBe(true);
  });

  it('should test isAdDisable when it enable', function () {
    expect(dgTreeHelper.isAdDisable({rotationSetting: {enabled: true}})).toBe(false);
  });

  it('should test accept drop for sub container to other sub container in depth 1 ', function () {
    var sourceNodeScope = {$modelValue: {type: dgConstants.strAdContainer}};
    var destinationNodesScope = {depth: function () {
      return 1;
    }};
    expect(dgTreeHelper.acceptDropToRotation(sourceNodeScope, destinationNodesScope)).toBe(false);
  });

  it('should test prevent drop for sub container to other sub container in depth 2 ', function () {
    var sourceNodeScope = {$modelValue: {type: dgConstants.strAdContainer}};
    var destinationNodesScope = {depth: function () {
      return 2;
    }};
    expect(dgTreeHelper.acceptDropToRotation(sourceNodeScope, destinationNodesScope)).toBe(false);
  });

  it('should test accept drop for ad to other sub container in depth 100 ', function () {
    var sourceNodeScope = {$modelValue: {type: dgConstants.strDeliveryGroupAd}};
    var destinationNodesScope = {depth: function () {
      return 100;
    }};
    expect(dgTreeHelper.acceptDropToRotation(sourceNodeScope, destinationNodesScope)).toBe(true);
  });

  it('should test prevent drop for ad from default serve', function () {
    var sourceNodeScope = {$modelValue: {type: dgConstants.strDeliveryGroupAd, from: dgConstants.strFromDefault}};
    var destinationNodesScope = {depth: function () {
      return 100;
    }};
    expect(dgTreeHelper.acceptDropToRotation(sourceNodeScope, destinationNodesScope)).toBe(false);
  });

  it('should test create sub container in root container ', function () {
    var container1 = [];
    var container2 = [
      {
        type: dgConstants.strAdContainer,
        subContainers: [
          {
            type: dgConstants.strAdContainer,
            selected: false,
            subContainers: []
          }
        ]
      },
      {
        type: dgConstants.strAdContainer,
        subContainers: [
          {
            type: dgConstants.strAdContainer,
            subContainers: []
          }
        ]
      }
    ];
    var depth = 0;
    expect(dgTreeHelper.allowCreateSubContainer(container1, depth).allow).toBe(true);
    expect(dgTreeHelper.allowCreateSubContainer(container2, depth).allow).toBe(true);

  });

  it('should test create sub container under sub container from level 1 ', function () {
    var container1 = [
      {type: dgConstants.strAdContainer, selected: true}
    ];
    var container2 = [
      {type: dgConstants.strAdContainer, selected: false, subContainers: []},
      {type: dgConstants.strAdContainer, selected: true, subContainers: []}
    ];
    var depth = 0;
    expect(dgTreeHelper.allowCreateSubContainer(container1, depth).allow).toBe(false);
    expect(dgTreeHelper.allowCreateSubContainer(container2, depth).allow).toBe(false);
  });

  it('should test create sub container under sub container from level 2 not allow ', function () {
    var container1 = [
      {
        type: dgConstants.strAdContainer,
        subContainers: [
          {
            type: dgConstants.strAdContainer,
            subContainers: [],
            selected: true
          }
        ]
      }
    ];
    var container2 = [
      {
        type: dgConstants.strAdContainer,
        subContainers: [
          {
            type: dgConstants.strAdContainer,
            subContainers: [],
            selected: false
          }
        ]
      },
      {
        type: dgConstants.strAdContainer,
        subContainers: [
          {
            type: dgConstants.strAdContainer,
            subContainers: [],
            selected: true
          }
        ]
      }
    ];
    var depth = 0;
    expect(dgTreeHelper.allowCreateSubContainer(container1, depth).allow).toBe(false);
    expect(dgTreeHelper.allowCreateSubContainer(container2, depth).allow).toBe(false);
  });

  it('should test isFromRotation when it from rotation', function () {
    expect(dgTreeHelper.isFromRotation({from: dgConstants.strFromRotation})).toBe(true);
  });

  it('should test isFromRotation when it from default serve', function () {
    expect(dgTreeHelper.isFromRotation({from: dgConstants.strFromDefault})).toBe(false);
  });

  it('should test isFromDefaultServe when it default serve', function () {
    expect(dgTreeHelper.isFromDefaultServe({from: dgConstants.strFromDefault})).toBe(true);
  });

  it('should test isFromDefaultServe when it from rotation', function () {
    expect(dgTreeHelper.isFromDefaultServe({from: dgConstants.strFromRotation})).toBe(false);
  });

  it('should test selectVisibleServeAds when all ads enabled and default serve container cb selected  expected all ads to be selected', function () {
    var ads = [
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}}
    ];
    var hideDisabled = {val: true};
    var defaultServeContainer = {isSelected: true};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    expect(_.every(ads, {selected: true})).toBe(true);


    ads = [
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}}
    ];
    hideDisabled = {val: false};
    defaultServeContainer = {isSelected: true};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    expect(_.every(ads, {selected: true})).toBe(true);
  });

  it('should test selectVisibleServeAds when all ads enabled and default serve container cb not selected  expected all ads to be un selected', function () {
    var ads = [
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}}
    ];
    var hideDisabled = {val: true};
    var defaultServeContainer = {isSelected: false};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    expect(_.every(ads, {selected: false})).toBe(true);


    ads = [
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: true}}
    ];
    hideDisabled = {val: false};
    defaultServeContainer = {isSelected: false};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    expect(_.every(ads, {selected: false})).toBe(true);
  });


  it('should test selectVisibleServeAds when some of the ads disable and default serve container cb selected  expected all ads to be selected', function () {
    var ads = [
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: false}},
      {rotationSetting: {enabled: false}},
      {rotationSetting: {enabled: true}}
    ];
    var hideDisabled = {val: false};
    var defaultServeContainer = {isSelected: true};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    expect(_.every(ads, {selected: true})).toBe(true);
  });

  it('should test selectVisibleServeAds when some of the ads disable and default serve container cb selected  expected all ads to be un selected', function () {
    var ads = [
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: false}},
      {rotationSetting: {enabled: false}},
      {rotationSetting: {enabled: true}}
    ];
    var hideDisabled = {val: false};
    var defaultServeContainer = {isSelected: false};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    expect(_.every(ads, {selected: false})).toBe(true);
  });

  it('should test selectVisibleServeAds when some of the ads disable and default serve container cb selected  expected only enable ads to be selected', function () {
    var ads = [
      {expectedSelected: true, rotationSetting: {enabled: true}},
      {expectedSelected: false, rotationSetting: {enabled: false}},
      {expectedSelected: false, rotationSetting: {enabled: false}},
      {expectedSelected: true, rotationSetting: {enabled: true}}
    ];
    var hideDisabled = {val: true};
    var defaultServeContainer = {isSelected: true};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    for (var i = 0; i < ads.length; i++) {
      expect(ads[i].expectedSelected).toBe(ads[i].selected);
    }
  });

  it('should test selectVisibleServeAds when some of the ads disable and default serve container cb not selected expected all ads to be un selected', function () {
    var ads = [
      {rotationSetting: {enabled: true}},
      {rotationSetting: {enabled: false}},
      {rotationSetting: {enabled: false}},
      {rotationSetting: {enabled: true}}
    ];
    var hideDisabled = {val: true};
    var defaultServeContainer = {isSelected: false};
    dgTreeHelper.selectVisibleServeAds(ads, hideDisabled, defaultServeContainer);
    expect(_.every(ads, {selected: false})).toBe(true);
  });

  it('should test accept drop ad into default serve container', function () {
    var dropItem = {type: dgConstants.strDeliveryGroupAd, from: dgConstants.strFromDefault};
    var destinationNodesScope = {depth: function () {
      return 1;
    }};
    expect(dgTreeHelper.acceptDropToDefaultServe(dropItem, destinationNodesScope)).toBe(true);
  });

  it('should test not accept drop ad when try to drop ad out from default serve container', function () {
    var dropItem = {type: dgConstants.strDeliveryGroupAd};
    var destinationNodesScope = {depth: function () {
      return 0;
    }};
    expect(dgTreeHelper.acceptDropToDefaultServe(dropItem, destinationNodesScope)).toBe(false);
  });

  it('should test not accept drop exist ad into default serve container when the ad is from rotation container', function () {
    var dropItem = {type: dgConstants.strDeliveryGroupAd, masterAdId: "123", from: dgConstants.strFromRotation};
    var destinationNodesScope = {
      $modelValue: [
        {masterAdId: "123"},
        {masterAdId: "456"},
        {masterAdId: "789"}
      ],
      depth: function () {
        return 1;
      }};
    expect(dgTreeHelper.acceptDropToDefaultServe(dropItem, destinationNodesScope)).toBe(false);
  });

  it('should test accept drop ad that not exist into default serve container', function () {
    var dropItem = {type: dgConstants.strDeliveryGroupAd, masterAdId: "888", from: dgConstants.strFromRotation};
    var destinationNodesScope = {
      $modelValue: [
        {masterAdId: "123"},
        {masterAdId: "456"},
        {masterAdId: "789"}
      ],
      depth: function () {
        return 1;
      }};
    expect(dgTreeHelper.acceptDropToDefaultServe(dropItem, destinationNodesScope)).toBe(true);
  });


  it('should test is central ad in case ad is from central', function () {
    expect(dgTreeHelper.isCentralAd({from: dgConstants.strFromCentral})).toBe(true);
  });

  it('should test is central ad in case ad is not from central', function () {
    expect(dgTreeHelper.isCentralAd({})).toBe(false);
    expect(dgTreeHelper.isCentralAd({from: dgConstants.strFromRotation})).toBe(false);
    expect(dgTreeHelper.isCentralAd({from: dgConstants.strFromDefault})).toBe(false);
    expect(dgTreeHelper.isCentralAd({masterAdId: "123", from: dgConstants.strFromDefault})).toBe(false);
  });

  it('should test the expected value after convert central ad to dg rotation ad', function () {
    var ad = {id: "111", testKeyThatShouldDelete: "test"};
    var dropDestination = {childRotationType: dgConstants.strEvenDistribution};
    dgTreeHelper.convertCentralAdToDgRotationAd(ad, dropDestination);
    expect(ad.__type).toBe(dgConstants.typeForMM2.deliveryGroupAd);
    expect(ad.rotationSetting.enabled).toBe(true);
    expect(ad.rotationSetting.type).toBe(dgConstants.strEvenDistribution);
    expect(ad.rotationSetting.weight).toBe(undefined);
    expect(ad.type).toBe(dgConstants.strDeliveryGroupAd);
    expect(ad.masterAdId).toBe("111");
    expect(ad.showRotation).toBe(true);
    expect(ad.from).toBe(dgConstants.strFromRotation);
    expect(ad.testKeyThatShouldDelete).toBe(undefined);
  });

  it('should test the __type is the first key in the ad json when we call convertCentralAdToDgDefaultServeAd', function () {
    var ad = {id: "111", testKeyThatShouldDelete: "test"};
    var dropDestination = {childRotationType: dgConstants.strEvenDistribution};
    dgTreeHelper.convertCentralAdToDgRotationAd(ad, dropDestination);
    expect(Object.keys(ad)[0]).toBe("__type");
  });


  it('should test the expected value after convert central ad to dg default serve ad', function () {
    var ad = {id: "111", testKeyThatShouldDelete: "test"};
    dgTreeHelper.convertCentralAdToDgDefaultServeAd(ad);
    expect(ad.__type).toBe(dgConstants.typeForMM2.deliveryGroupAd);
    expect(ad.rotationSetting.enabled).toBe(true);
    expect(ad.type).toBe(dgConstants.strDeliveryGroupAd);
    expect(ad.masterAdId).toBe("111");
    expect(ad.showRotation).toBe(false);
    expect(ad.from).toBe(dgConstants.strFromDefault);
    expect(ad.testKeyThatShouldDelete).toBe(undefined);
  });

  it('should test the __type is the first key in the ad json when we call convertCentralAdToDgDefaultServeAd', function () {
    var ad = {id: "111", testKeyThatShouldDelete: "test"};
    dgTreeHelper.convertCentralAdToDgDefaultServeAd(ad);
    expect(Object.keys(ad)[0]).toBe("__type");
  });

  it('should test placementType and uiPlacementType are null in case dg dosnt have ads', function () {
    var dg = {rootContainer: {subContainers: [
      {type: dgConstants.strAdContainer, subContainers: [
        {type: dgConstants.strAdContainer, subContainers: []}
      ]}
    ]}, placementType: "test", uiPlacementType: "test", defaultAds: []};
    dgTreeHelper.checkIfToSetPlacementTypeAsNull(dg);
    expect(dg.placementType).toBe(null);
    expect(dg.uiPlacementType).toBe(null);
  });

  it('should test placementType and uiPlacementType are not null in case dg has default ads', function () {
    var dg = {rootContainer: {subContainers: []}, placementType: "test", uiPlacementType: "test", defaultAds: [
      {name: "ad1"}
    ]};
    dgTreeHelper.checkIfToSetPlacementTypeAsNull(dg);
    expect(dg.placementType).toBe("test");
    expect(dg.uiPlacementType).toBe("test");
  });

  it('should test placementType and uiPlacementType are not null in case dg has rotation ads', function () {
    var dg = {rootContainer: {subContainers: [
      {type: dgConstants.strDeliveryGroupAd}
    ]}, placementType: "test", uiPlacementType: "test", defaultAds: []};
    dgTreeHelper.checkIfToSetPlacementTypeAsNull(dg);
    expect(dg.placementType).toBe("test");
    expect(dg.uiPlacementType).toBe("test");
  });

  it('should test placementType and uiPlacementType are not null in case dg have sub group with ads inside', function () {
    var dg = {rootContainer: {subContainers: [
      {type: dgConstants.strAdContainer, subContainers: [
        {type: dgConstants.strDeliveryGroupAd}
      ]}
    ]}, placementType: "test", uiPlacementType: "test", defaultAds: []};
    dgTreeHelper.checkIfToSetPlacementTypeAsNull(dg);
    expect(dg.placementType).toBe("test");
    expect(dg.uiPlacementType).toBe("test");
  });

  it('should test placementType and uiPlacementType are not null in case dg have sub group with ads inside', function () {
    var dg = {rootContainer: {subContainers: [
      {type: dgConstants.strAdContainer, subContainers: [
        {type: dgConstants.strAdContainer, subContainers: [
          {type: dgConstants.strDeliveryGroupAd}
        ]}
      ]}
    ]}, placementType: "test", uiPlacementType: "test", defaultAds: []};
    dgTreeHelper.checkIfToSetPlacementTypeAsNull(dg);
    expect(dg.placementType).toBe("test");
    expect(dg.uiPlacementType).toBe("test");
  });

  it('should test sub group was not created when dg and sub group not selected', function () {
      var dg = {rootContainer: {subContainers: []}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers.length).toBe(0);

      dg = {rootContainer: {subContainers: [
        {type: dgConstants.strAdContainer, subContainers: []}
      ]}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers[0].subContainers.length).toBe(0);
    }
  );

  it('should test sub group was created when dg is selected', function () {
      var dg = {selected: true, rootContainer: {subContainers: []}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers.length).toBe(1);
    }
  );

  it('should test sub group was created under the selected subgroup', function () {
      var dg = {rootContainer: {subContainers: [
        {type: dgConstants.strAdContainer, selected: true, subContainers: []}
      ]}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers[0].subContainers.length).toBe(1);
    }
  );

  it('should test sub group was created under the selected subgroup even if the dg selected too', function () {
      var dg = {selected: true, rootContainer: {subContainers: [
        {type: dgConstants.strAdContainer, selected: true, subContainers: []}
      ]}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers[0].subContainers.length).toBe(1);
    }
  );

  it('should test sub group was created under the selected subgroup', function () {
      var dg = {rootContainer: {subContainers: [
        {type: dgConstants.strAdContainer, selected: false, subContainers: []},
        {type: dgConstants.strAdContainer, selected: true, subContainers: []}
      ]}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers[0].subContainers.length).toBe(0);
      expect(dg.rootContainer.subContainers[1].subContainers.length).toBe(1);
    }
  );

  it('should test sub group was created under the selected sub >> subgroup', function () {
      var dg = {rootContainer: {subContainers: [
        {type: dgConstants.strAdContainer, selected: false, subContainers: []},
        {type: dgConstants.strAdContainer, selected: false, subContainers: [
          {type: dgConstants.strAdContainer, selected: true, subContainers: []}
        ]}
      ]}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers[0].subContainers.length).toBe(0);
      expect(dg.rootContainer.subContainers[1].subContainers.length).toBe(1);
      expect(dg.rootContainer.subContainers[1].subContainers[0].subContainers.length).toBe(1);
    }
  );

  it('should test sub group was created on the first sub group that selected', function () {
      var dg = {rootContainer: {subContainers: [
        {type: dgConstants.strAdContainer, selected: false, subContainers: []},
        {type: dgConstants.strAdContainer, selected: true,  subContainers: [
          {type: dgConstants.strAdContainer, selected: true, rotationSetting:{enabled:true}, subContainers: []}
        ]}
      ]}};
      dgTreeHelper.createSubGroup(dg);
      expect(dg.rootContainer.subContainers[0].subContainers.length).toBe(0);
      expect(dg.rootContainer.subContainers[1].subContainers.length).toBe(2);
      expect(dg.rootContainer.subContainers[1].subContainers[0].subContainers.length).toBe(0);
    }
  );

  it('check that when sub container is selected all his childes selected too', function () {
    var selectedSubGroup = {
      selected: true,
      subContainers: [{}, {}, {}, {type: dgConstants.strAdContainer, subContainers: [{},{},{}]}]
    };
    dgTreeHelper.onParentSelectedSelectAllChildes(selectedSubGroup);

    selectedSubGroup.subContainers.forEach(function (ad) {
        expect(ad.selected).toBe(selectedSubGroup.selected);
        if(ad.type == dgConstants.strAdContainer){
          ad.subContainers.forEach(function(item){
            expect(item.selected).toBe(selectedSubGroup.selected);
          });
        }
      }
    );
  });

  it('check that when sub container is un selected all his childes un selected too', function () {
    var selectedSubGroup = {
      selected: false,
      subContainers: [{}, {}, {}, {type: dgConstants.strAdContainer, subContainers: [{},{},{}]}]
    };
    dgTreeHelper.onParentSelectedSelectAllChildes(selectedSubGroup);

    selectedSubGroup.subContainers.forEach(function (ad) {
        expect(ad.selected).toBe(selectedSubGroup.selected);
        if(ad.type == dgConstants.strAdContainer){
          ad.subContainers.forEach(function(item){
            expect(item.selected).toBe(selectedSubGroup.selected);
          });
        }
      }
    );
  });

  it('check that when no ads selected the "Disable/Enable" button is get the text: "Disable/Enable" ', function () {
    var dg = {rootContainer: {subContainers: []}, defaultAds: []};
    var mmDefaultAdsCb = {isSelected: false};
    expect(dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb).text).toBe(dgConstants.disableEnableButtonOptions.disableEnable);
  });

  it('check that when default Ads checkbox is selected the "Disable/Enable" button is get the text: "Disable/Enable" ', function () {
    var dg = {rootContainer: {subContainers: []}, defaultAds: [{rotationSetting: {enabled: true}, selected: true}]};
    var mmDefaultAdsCb = {isSelected: true};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.disableEnable);
    expect(buttonState.action).toBe(undefined);
  });

  it('check that when enable ad in default serve is selected the "Disable/Enable" button is get the text: "disable" ', function () {
    var dg = {rootContainer: {subContainers: []}, defaultAds: [{rotationSetting: {enabled: true}, selected: true}, {rotationSetting: {enabled: false}, selected: false}]};
    var mmDefaultAdsCb = {isSelected: false};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.disable);
    expect(buttonState.action).toBe(undefined);
  });

  it('check that when disable ad in default serve is selected the "Disable/Enable" button is get the text: "enable" ', function () {
    var dg = {rootContainer: {subContainers: []}, defaultAds: [{rotationSetting: {enabled: false}, selected: true}, {rotationSetting: {enabled: true}, selected: false}]};
    var mmDefaultAdsCb = {isSelected: false};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.enable);
    expect(buttonState.action).toBe(undefined);
  });

  it('check that when no ads are selected the action we get is remove ', function () {
    var dg = {rootContainer: {subContainers: []}, defaultAds: [{rotationSetting: {enabled: true}, selected: false}]};
    var mmDefaultAdsCb = {isSelected: false};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.disableEnable);
    expect(buttonState.action).toBe("remove");
  });

  it('check that when we have enable and disable ads in default serve is selected the "Disable/Enable" button is get the text: "Disable/Enable" ', function () {
    var dg = {rootContainer: {subContainers: []}, defaultAds: [{rotationSetting: {enabled: false}, selected: true},{rotationSetting: {enabled: true}, selected: true}]};
    var mmDefaultAdsCb = {isSelected: false};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.disableEnable);
    expect(buttonState.action).toBe(undefined);
  });

  it('check that when disable ad in rotation is selected the "Disable/Enable" button is get the text: "enable" ', function () {
    var dg = {rootContainer: {subContainers: [{rotationSetting: {enabled: false}, selected: true},{rotationSetting: {enabled: true}, selected: false}]}, defaultAds: [{rotationSetting: {enabled: false}, selected: false}, {rotationSetting: {enabled: true}, selected: false}]};
    var mmDefaultAdsCb = {isSelected: false};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.enable);
    expect(buttonState.action).toBe(undefined);
  });

  it('check that when enable ad in rotation is selected the "Disable/Enable" button is get the text: "disable" ', function () {
    var dg = {rootContainer: {subContainers: [{rotationSetting: {enabled: true}, selected: true},{rotationSetting: {enabled: false}, selected: false}]}, defaultAds: [{rotationSetting: {enabled: false}, selected: false}, {rotationSetting: {enabled: true}, selected: false}]};
    var mmDefaultAdsCb = {isSelected: false};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.disable);
    expect(buttonState.action).toBe(undefined);
  });

  it('check that when subgroup selected the "Disable/Enable" button is get the text: "Disable/Enable" ', function () {
    var dg = {rootContainer: {subContainers: [{type:dgConstants.strAdContainer, selected: true}, {rotationSetting: {enabled: true}, selected: true},{rotationSetting: {enabled: false}, selected: false}]}, defaultAds: [{rotationSetting: {enabled: false}, selected: false}, {rotationSetting: {enabled: true}, selected: false}]};
    var mmDefaultAdsCb = {isSelected: false};
    var buttonState = dgTreeHelper.enableDisableButtonState(dg, mmDefaultAdsCb);
    expect(buttonState.text).toBe(dgConstants.disableEnableButtonOptions.disableEnable);
    expect(buttonState.action).toBe(undefined);
  });
});
