/**
* Created by liron.tagger on 6/12/14.
*/
'use strict';
describe('Service: dgAdCalculateDecision', function () {

	// load the controller's module
	beforeEach(module('MediaMindApp'));

	// instantiate service
	var dgAdCalculateDecision;
	beforeEach(inject(function (_dgAdCalculateDecision_) {
        dgAdCalculateDecision = _dgAdCalculateDecision_;
	}));

	it('should test the service is up', function () {
		expect(!!dgAdCalculateDecision).toBe(true);
	});

	it('should test calculateEvenDistribution', function () {
		var container = {
			"type": "AdContainer",
			"name": "Sub Group",
			"childRotationType": "EvenDistribution",
			"from": "rotation",
			"subContainers": [
				{
					"type": "DeliveryGroupAd",
					"rotationSetting": {
						"type": "EvenDistribution",
						"enabled": true,
						"weight": null
					},
					"masterAdId": "1120OKDKDUC",
					"name": "aaa",
					"showRotation": true,
					"from": "rotation"
				},
				{
					"type": "DeliveryGroupAd",
					"rotationSetting": {
						"type": "EvenDistribution",
						"enabled": true,
						"weight": null
					},
					"masterAdId": "1120OKDKDUC",
					"name": "aaa",
					"showRotation": true,
					"from": "rotation"
				},
				{
					"type": "DeliveryGroupAd",
					"rotationSetting": {
						"type": "EvenDistribution",
						"enabled": true,
						"weight": null
					},
					"masterAdId": "1120OKDKDUC",
					"name": "aaa",
					"showRotation": true,
					"from": "rotation"
				}
			]
		};

        dgAdCalculateDecision.calculate(container)
		expect(container.subContainers[0].rotationSetting.weight).toBe(33.33);
		expect(container.subContainers[2].rotationSetting.weight).toBe(33.34);
	});
});