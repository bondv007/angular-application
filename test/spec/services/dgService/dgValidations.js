/**
 * Created by Liron.Tagger on 9/16/14.
 */
'use strict';
describe('Service: dgValidation', function () {

  // load the controller's module
  beforeEach(module('MediaMindApp'));

  // instantiate service
  var dgValidation, enums, rootScope;
  beforeEach(inject(function (_dgValidation_, _enums_, $rootScope) {
    dgValidation = _dgValidation_;
    enums = _enums_;
    rootScope = $rootScope;
  }));

  it('should test the service dgValidation is up', function () {
    expect(!!dgValidation).toBe(true);
  });

  it('should test the service enums is up', function () {
    expect(!!enums).toBe(true);
  });

  it('should test the service rootScope is up', function () {
    expect(!!rootScope).toBe(true);
  });

  it('should test isAdTypeValid', function () {
    var dgType1 = {
      "type": "DeliveryGroup",
      "id": "HRA0UC",
      "name": "a",
      "placementType": "IN_BANNER",
      "rootContainer": {
        "type": "AdContainer",
        "id": "1MZZ8VJCK9I",
        "rotationSetting": {
          "type": "EvenDistribution",
          "enabled": true,
          "weight": null
        },
        "name": "Sub Group",
        "childRotationType": "EvenDistribution",
        "subContainers": [
          {
            "type": "DeliveryGroupAd",
            "id": "81796",
            "rotationSetting": {
              "type": "EvenDistribution",
              "enabled": true,
              "weight": 50.0
            },
            "masterAdId": "HRA0P4"
          },
          {
            "type": "DeliveryGroupAd",
            "id": "16837",
            "rotationSetting": {
              "type": "EvenDistribution",
              "enabled": true,
              "weight": 50.0
            },
            "masterAdId": "HRA0OS"
          }
        ]
      },
      "servingSetting": {
        "type": "APIServingSetting",
        "impressionsPerUser": -1,
        "impressionsPerDay": -1,
        "timeBetweenAds": -1,
        "frequencyCappingLevel": true,
        "serveDefaultImage": true
      },
      "rotationAds": null,
      "draftAds": [],
      "placements": [],
      "defaultAds": [],
      "campaignId": "HRA0MY",
      "targetingTypeId": -1,
      "geoTargetingTypeId": -1,
      "geoTargetingCountryId": -1,
      "aosCrossPlacement": 0,
      "aoMethodTypeId": -1,
      "gmt": -1,
      "sequenceLevelCrossPlacementSupport": true,
      "aoMethodType": -1
    };

    var adType1 = {
      "type": "StandardBannerAd",
      "id": "",
      "name": "",
      "masterAdId": "",
      "isChanged": false,
      "adStatus": "IN_DESIGN",
      "adFormat": 'STANDARD_BANNER_AD',
      "accountId": "",
      "advertiserId": "",
      "campaignId": "",
      "placementId": null,
      "createdBy": null,
      "createdOn": null,
      "lastUpdateBy": null,
      "lastUpdateOn": null,
      "overallSize": null,
      "pricingSize": null,
      "downloadMode": null,
      "defaultImage": {"type": "AdAsset", "assetId": ""},
      "banner": {"type": "AdAsset", "assetId": ""},
      "html5": {"type": "HTML5Workspace", "asset": {"type": "AdAsset", "assetId": ""}, "overallSize": 0},
      "mainClickthrough": {
        "type": "MainClickthrough",
        "url": "",
        "targetWindowType": "NEW",
        "showAddressBar": true,
        "showMenuBar": true,
        "closeAllAdParts": false
      },
      "defaultImageClickthrough": {
        "type": "MainClickthrough",
        "url": "",
        "targetWindowType": "NEW",
        "showAddressBar": true,
        "showMenuBar": true,
        "closeAllAdParts": false
      },
      "tooltip": "",
      "changed": false,
      "panelsAppearance": true,
      "preloadPanels": false,
      "videoStartMethod": "USER_START",
      // Expandable Banner Ad additional properties
      "preloadBanner": {"type": "AdAsset", "assetId": ""},
      "panels": [],
      "additionalAssets": [],
      "customInteractions": []

    };
    var adType2 = {
      "type": "StandardBannerAd",
      "id": "",
      "name": "",
      "masterAdId": "",
      "isChanged": false,
      "adStatus": "IN_DESIGN",
      "adFormat": 'FLOATING_AD',
      "accountId": "",
      "advertiserId": "",
      "campaignId": "",
      "placementId": null,
      "createdBy": null,
      "createdOn": null,
      "lastUpdateBy": null,
      "lastUpdateOn": null,
      "overallSize": null,
      "pricingSize": null,
      "downloadMode": null,
      "defaultImage": {"type": "AdAsset", "assetId": ""},
      "banner": {"type": "AdAsset", "assetId": ""},
      "html5": {"type": "HTML5Workspace", "asset": {"type": "AdAsset", "assetId": ""}, "overallSize": 0},
      "mainClickthrough": {
        "type": "MainClickthrough",
        "url": "",
        "targetWindowType": "NEW",
        "showAddressBar": true,
        "showMenuBar": true,
        "closeAllAdParts": false
      },
      "defaultImageClickthrough": {
        "type": "MainClickthrough",
        "url": "",
        "targetWindowType": "NEW",
        "showAddressBar": true,
        "showMenuBar": true,
        "closeAllAdParts": false
      },
      "tooltip": "",
      "changed": false,
      "panelsAppearance": true,
      "preloadPanels": false,
      "videoStartMethod": "USER_START",
      // Expandable Banner Ad additional properties
      "preloadBanner": {"type": "AdAsset", "assetId": ""},
      "panels": [],
      "additionalAssets": [],
      "customInteractions": []

    };

    expect(dgValidation.isAdTypeValid(dgType1, adType1)).toBe(true);
    expect(dgValidation.isAdTypeValid(dgType1, adType2)).toBe(false);
  });


  //region Time Based Sequence Validation
  it('test function timeBasedSequenceValidation when dg have no ads or sub groups. the root childRotationType="TimeBased"', function () {
    var rootAdContainer = {type: "AdContainer", childRotationType: "TimeBased", subContainers: []};
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(true);
  });

  it('test function timeBasedSequenceValidation with ad that have only startDate', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date()}}
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('Please select an end date.');
  });

  it('test function timeBasedSequenceValidation with 2 ads that the second ad have only startDate', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date(), endDate: new Date()}},
        {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date()}}
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('Please select an end date.');
  });

  it('test function timeBasedSequenceValidation with ad that have only endDate', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {type: "DeliveryGroupAd", rotationSetting: {weight: {endDate: new Date()}}}
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('Please select a start date.');
  });

  it('test function timeBasedSequenceValidation with 2 ads that the second ad have only endDate', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {type: "DeliveryGroupAd", rotationSetting: {weight: {startDate: new Date(), endDate: new Date()}}},
        {type: "DeliveryGroupAd", rotationSetting: {weight: {endDate: new Date()}}}
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('Please select a start date.');
  });

  it('test function timeBasedSequenceValidation with ad that end date greater than start date', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2013", "01", "01")}
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(true);
  });

  it('test function timeBasedSequenceValidation with 2 ads that end date greater from start date', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2013", "01", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2013", "01", "01")}
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(true);
  });

  it('test function timeBasedSequenceValidation with ad that start date == end date', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2012", "01", "01")}
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(true);
  });

  it('test function timeBasedSequenceValidation with 2 ads that start date == end date', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2012", "01", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2012", "01", "01")}
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(true);
  });

  it('test function timeBasedSequenceValidation with ad that start date > end date', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("3000", "01", "01"), endDate: new Date()}}
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('The end date you entered occurs before the start date.');
  });

  it('test function timeBasedSequenceValidation with 2 ads that second ad start date > end date', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2013", "01", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2013", "01", "01"), endDate: new Date("2012", "01", "01")}
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('The end date you entered occurs before the start date.');
  });

  it('test function timeBasedSequenceValidation with sub group ad that his start date > end date', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2012", "01", "01"), endDate: new Date("2013", "01", "01")}
        },
        {
          type: "AdContainer", childRotationType: "TimeBased",
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2014", "01", "01"), endDate: new Date("2013", "01", "01")}
            }
          ]
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('The end date you entered occurs before the start date.');
  });

  it('test function timeBasedSequenceValidation when dg have 2 ads + 2 subContainers  and the root childRotationType!="TimeBased"', function () {
    var rotationType = enums.rotationSettingType;
    enums.rotationSettingType.push({id: 'TimeBased', type: 'TimeBased', name: 'Time Based'});
    var numOfRotationType = rotationType.length;
    var numOfTest = 0;
    for (var i = 0; i < numOfRotationType; i++) {
      var _rotationType = rotationType[i].id;
      if (_rotationType != "TimeBased") {
        numOfTest = numOfTest + 1;
        var rootAdContainer = {
          type: "AdContainer", childRotationType: _rotationType, subContainers: [
            {type: "DeliveryGroupAd"},
            {type: "DeliveryGroupAd"},
            {
              type: "AdContainer", subContainers: [
              {type: "DeliveryGroupAd"}
            ]
            },
            {
              type: "AdContainer", subContainers: [
              {type: "DeliveryGroupAd"}
            ]
            }
          ]
        };
        expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(true);
      }
    }
    expect(numOfRotationType - 1).toBe(numOfTest);

  });

  it('test function timeBasedSequenceValidation when dg childRotationType=="TimeBased" and ads not sorted', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "2", "10"), endDate: new Date("2014", "03", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "03", "01"), endDate: new Date("2015", "01", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "0", "01"), endDate: new Date("2014", "1", "10")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "01", "10"), endDate: new Date("2014", "2", "10")}
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2015", "01", "01"),
            endDate: new Date("2016", "01", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "01", "01")}
            }
          ]
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2016", "01", "01"),
            endDate: new Date("2016", "09", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "8", "10"), endDate: new Date("2017", "8", "10")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "1", "02"), endDate: new Date("2016", "8", "10")}
            }
          ]
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2016", "01", "01"),
            endDate: new Date("2016", "09", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "8", "10"), endDate: new Date("2016", "9", "01")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "1", "02"), endDate: new Date("2016", "8", "10")}
            }
          ]
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(true);
  });

  /*it('test function timeBasedSequenceValidation when no consistent date between one of the sub group end date  and his ads', function () {
   var rootAdContainer = {type: "AdContainer", childRotationType: "TimeBased", subContainers: [
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2014", "2", "10"), endDate: new Date("2014", "03", "01")}},
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2014", "03", "01"), endDate: new Date("2015", "01", "01")}},
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2014", "0", "01"), endDate: new Date("2014", "1", "10")}},
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2014", "01", "10"), endDate: new Date("2014", "2", "10")}},
   {
   type: "AdContainer",
   childRotationType: "TimeBased",
   rotationSetting: {
   weight: {
   startDate: new Date("2015", "01", "01"),
   endDate: new Date("2016", "01", "01")
   }
   },
   subContainers: [
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "01", "01")}}
   ]
   },
   {
   type: "AdContainer",
   childRotationType: "TimeBased",
   rotationSetting: {
   startDate: new Date("2016", "01", "01"),
   endDate: new Date("2016", "09", "01")
   },
   subContainers: [
   {type: "DeliveryGroupAd", rotationSetting: {weight: {startDate: new Date("2016", "8", "10"), endDate: new Date("2017", "8", "10")}}},
   {type: "DeliveryGroupAd", rotationSetting: {weight: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}}},
   {type: "DeliveryGroupAd", rotationSetting: {weight: {startDate: new Date("2016", "1", "02"), endDate: new Date("2016", "8", "10")}}}
   ]
   },
   {
   type: "AdContainer",
   childRotationType: "TimeBased",
   rotationSetting: {
   startDate: new Date("2016", "01", "01"),
   endDate: new Date("2016", "09", "02")
   },
   subContainers: [
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}},
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2016", "1", "02"), endDate: new Date("2016", "8", "10")}},
   {type: "DeliveryGroupAd", rotationSetting: {startDate: new Date("2016", "8", "10"), endDate: new Date("2016", "9", "01")}}
   ]
   }
   ]};
   expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
   expect(rootScope.alerts.error[0].msg).toBe('The date that was defined for serving the ad is not consistent with the date defined for the subgroup.');
   });*/

  it('test function timeBasedSequenceValidation when no consistent date between one of the sub group start date and his ads', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "2", "10"), endDate: new Date("2014", "03", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "03", "01"), endDate: new Date("2015", "01", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "0", "01"), endDate: new Date("2014", "1", "10")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "01", "10"), endDate: new Date("2014", "2", "10")}
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2015", "01", "01"),
            endDate: new Date("2016", "01", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "01", "01")}
            }
          ]
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2016", "01", "01"),
            endDate: new Date("2016", "09", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "8", "10"), endDate: new Date("2017", "8", "10")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "1", "02"), endDate: new Date("2016", "8", "10")}
            }
          ]
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2015", "0", "01"),
            endDate: new Date("2016", "09", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "1", "02"), endDate: new Date("2016", "8", "10")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "8", "10"), endDate: new Date("2016", "9", "01")}
            }
          ]
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('The date that was defined for serving the ad is not consistent with the date defined for the subgroup.');
  });

  it('test function timeBasedSequenceValidation when no consistent date between ads of one of the sub groups', function () {
    var rootAdContainer = {
      type: "AdContainer", childRotationType: "TimeBased", subContainers: [
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "2", "10"), endDate: new Date("2014", "03", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "03", "01"), endDate: new Date("2015", "01", "01")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "0", "01"), endDate: new Date("2014", "1", "10")}
        },
        {
          type: "DeliveryGroupAd",
          rotationSetting: {startDate: new Date("2014", "01", "10"), endDate: new Date("2014", "2", "10")}
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2015", "01", "01"),
            endDate: new Date("2016", "01", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "01", "01")}
            }
          ]
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2016", "01", "01"),
            endDate: new Date("2016", "09", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "8", "10"), endDate: new Date("2017", "8", "10")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "1", "02"), endDate: new Date("2016", "8", "10")}
            }
          ]
        },
        {
          type: "AdContainer",
          childRotationType: "TimeBased",
          rotationSetting: {
            startDate: new Date("2016", "0", "01"),
            endDate: new Date("2016", "09", "01")
          },
          subContainers: [
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2015", "1", "01"), endDate: new Date("2016", "1", "02")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "1", "04"), endDate: new Date("2016", "8", "10")}
            },
            {
              type: "DeliveryGroupAd",
              rotationSetting: {startDate: new Date("2016", "8", "10"), endDate: new Date("2016", "9", "01")}
            }
          ]
        }
      ]
    };
    expect(dgValidation.timeBasedSequenceValidation(rootAdContainer, true)).toBe(false);
    expect(rootScope.alerts.error[0].msg).toBe('The selected date is not consistent with the rotation time that was defined for the delivery group.');
  });
  //endregion

  //region isValidNumOfNestedSubGroupForSwapAction
  it('test function isValidNumOfNestedSubGroupForSwapAction when no ads or sgs', function () {
    var dgs = [
      {rootContainer: {type: "AdContainer", subContainers: []}},
      {rootContainer: {type: "AdContainer", subContainers: []}},
      {rootContainer: {type: "AdContainer", subContainers: []}}
    ];
    expect(dgValidation.isValidNumOfNestedSubGroupForSwapAction(dgs)).toBe(true);
  });

  it('test function isValidNumOfNestedSubGroupForSwapAction when only one level of sub group', function () {
    var dgs = [
      {
        rootContainer: {
          type: "AdContainer", subContainers: [
            {type: "AdContainer", subContainers: []},
            {type: "AdContainer", subContainers: []},
            {type: "AdContainer", subContainers: []}
          ]
        }
      },
      {
        rootContainer: {
          type: "AdContainer", subContainers: [
            {type: "AdContainer", subContainers: []},
            {type: "AdContainer", subContainers: []},
            {type: "AdContainer", subContainers: []}
          ]
        }
      }
    ];
    expect(dgValidation.isValidNumOfNestedSubGroupForSwapAction(dgs)).toBe(false);
  });

  it('test function isValidNumOfNestedSubGroupForSwapAction when two level of sub group', function () {
    var dgs =
      [
        {
          rootContainer: {
            type: "AdContainer", subContainers: [
              {type: "AdContainer", subContainers: []},
              {type: "AdContainer", subContainers: []},
              {type: "AdContainer", subContainers: []}
            ]
          }
        },
        {
          rootContainer: {
            type: "AdContainer",
            subContainers: [
              {
                type: "AdContainer",
                subContainers: [
                  {
                    type: "AdContainer",
                    subContainers: []
                  }
                ]
              }
            ]
          }
        }
      ];
    expect(dgValidation.isValidNumOfNestedSubGroupForSwapAction(dgs)).toBe(false);
  });
  //endregion
});


