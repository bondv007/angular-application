'use strict';

angular.module('services.config', [])
	.constant('configuration', {
		"env": 'development',
		"ec2": 'http://54.187.0.201/rest/',
        /*"ec2ams":'http://54.187.0.201/rest/ams',*/
        "ec2ams": "http://54.201.242.250:8080/",
		"loginPath": 'http://54.187.0.201/rest/login/Login',
		"resource": 'http://54.213.44.20/_/',
		"debug": 'development' != 'production'
	});
