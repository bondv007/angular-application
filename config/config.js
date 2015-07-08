'use strict';

angular.module('services.config', [])
	.constant('configuration', {
		"env": '@@env',
		"ec2": '@@ec2',
		"ec2ams":'@@ec2ams',
        "mdx2Api" : '@@mdx2Api',
		"loginPath": '@@loginPath',
		"resource": '@@resource',
		"debug": '@@env' != 'production',
    "cache": true,
    "cacheInterval": 300,
    "featureToggleInterval" : 1000*60*10
	});
