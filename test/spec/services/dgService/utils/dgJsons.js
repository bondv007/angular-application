/**
 * Created by Ofir.Fridman on 8/12/14.
 */
'use strict';

function dgJson() {
	var selectedSubGroupWithUnSelectedChild = [
				{
					"type": "AdContainer",
					"subContainers": [
						{
							"type": "AdContainer",
							"subContainers": [
								{
									"type": "DeliveryGroupAd",
									"selected": false
								}
							],
							"selected": false
						},
						{
							"type": "DeliveryGroupAd",
							"selected": false
						}
					],
					"selected": true
				}
			];

	var unSelectedSubGroupWithSelectedChild = [
		{
			"type": "AdContainer",
			"subContainers": [
				{
					"type": "AdContainer",
					"subContainers": [
						{
							"type": "DeliveryGroupAd",
							"selected": true
						}
					],
					"selected": true
				},
				{
					"type": "DeliveryGroupAd",
					"selected": true
				}
			],
			"selected": false
		}
	];

	return{
		selectedSubGroupWithUnSelectedChild : selectedSubGroupWithUnSelectedChild,
		unSelectedSubGroupWithSelectedChild:unSelectedSubGroupWithSelectedChild
	}
}