app.factory('previewService', [ 'csb', '$http', '$q',
	function( csb, $http, $q ) {

		var baseUrl = csb.config.baseApiUrl + 'Preview';
		var factory = {};
		var TESTING_MODE = false; // In order to retrieve dummy data

		var DUMMY_DATA = {};
		DUMMY_DATA.GetPreviewAdsByIDs = {
		    "RequestID": "11e4d4e5-5405-48cf-98da-fba054543dce",
		    "ResponseStatus": 1,
		    "ResponseTimeStamp": "/Date(1410459529772+0300)/",
		    "StatusMessage": "",
		    "AdsInfoList": [{
		        "AdId": 12121,
		        "AdName": "NGC - Slide",
		        "AdSizeInBytes": 0,
		        "AdTag": "<script>\r\nvar gnEbMinZIndex = 10000;\r\nvar gfEbInIframe = false;\r\nvar gEbAd = new Object();\r\ngEbAd.nFlightID = 12121;\r\ngEbAd.nAdID=12121;\n</script>\r\n<script src=\"http://ds.serving-sys-dev4.com/BurstingScript/ebServing_12121.js\"></script>\r\n",
		        "AdType": "Floating Ad",
		        "ResponseStatus": 0,
		        "responseStatusMessage": null
		    }, {
		        "AdId": 1362455,
		        "AdName": "VolvoMoradAD12_1",
		        "AdSizeInBytes": 12574,
		        "AdTag": "<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1362455&w=300&h=250&ord=&p=&npu=$$$$&ncu=$$$$\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=7040&pr=1&EyeblasterID=1362455\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=7040&pr=1&EyeblasterID=1362455\" border=0 width=300 height=250></a>\r\n</noscript>\r\n",
		        "AdType": "Standard Banner",
		        "ResponseStatus": 0,
		        "responseStatusMessage": null
		    }]
		};

		DUMMY_DATA.GetPreviewAdsByDeliveryGroupsIDs = {
		    "RequestID": "2fafcdc3-6b28-4535-a011-139271063fc6",
		    "ResponseStatus": 1,
		    "ResponseTimeStamp": "/Date(1410459653822+0300)/",
		    "StatusMessage": "",
		    "PreviewDeliveryGroupsList": [
			    {
			        "DeliveryGroupID": 165008,
			        "PreviewAdsInfoList": [
				        {
				            "AdId": 1364819,
				            "AdName": "EliasRose1",
				            "AdSizeInBytes": 0,
				            "AdTag": "\r\n<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1364819&w=21&h=16&ord=\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=2101&pr=1&EyeblasterID=1364819\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=2101&pr=1&EyeblasterID=1364819\" border=0 width=21 height=16></a>\r\n</noscript>\r\n",
				            "AdType": "Polite Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }, {
				            "AdId": 1364820,
				            "AdName": "EliasRose2",
				            "AdSizeInBytes": 0,
				            "AdTag": "\r\n<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1364820&w=320&h=256&ord=\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=2973&pr=1&EyeblasterID=1364820\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=2973&pr=1&EyeblasterID=1364820\" border=0 width=320 height=256></a>\r\n</noscript>\r\n",
				            "AdType": "Polite Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }, {
				            "AdId": 1364823,
				            "AdName": "EliasFine",
				            "AdSizeInBytes": 0,
				            "AdTag": "\r\n<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1364823&w=106&h=52&ord=\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=4609&pr=1&EyeblasterID=1364823\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=4609&pr=1&EyeblasterID=1364823\" border=0 width=106 height=52></a>\r\n</noscript>\r\n",
				            "AdType": "Polite Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }, {
				            "AdId": 1364826,
				            "AdName": "EliasSapSup",
				            "AdSizeInBytes": 0,
				            "AdTag": "\r\n<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1364826&w=234&h=60&ord=\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=2658&pr=1&EyeblasterID=1364826\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=2658&pr=1&EyeblasterID=1364826\" border=0 width=234 height=60></a>\r\n</noscript>\r\n",
				            "AdType": "Polite Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }, {
				            "AdId": 1364932,
				            "AdName": "sembaWithScript",
				            "AdSizeInBytes": 0,
				            "AdTag": "\r\n<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1364932&w=234&h=60&ord=\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=5481&pr=1&EyeblasterID=1364932\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=5481&pr=1&EyeblasterID=1364932\" border=0 width=234 height=60></a>\r\n</noscript>\r\n",
				            "AdType": "Polite Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }, {
				            "AdId": 1364936,
				            "AdName": "google",
				            "AdSizeInBytes": 0,
				            "AdTag": "\r\n<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1364936&w=800&h=600&ord=\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=7117&pr=1&EyeblasterID=1364936\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=7117&pr=1&EyeblasterID=1364936\" border=0 width=800 height=600></a>\r\n</noscript>\r\n",
				            "AdType": "Polite Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }, {
				            "AdId": 1365390,
				            "AdName": "kher12",
				            "AdSizeInBytes": 0,
				            "AdTag": "\r\n<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1365390&w=400&h=400&ord=\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=5166&pr=1&EyeblasterID=1365390\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=5166&pr=1&EyeblasterID=1365390\" border=0 width=400 height=400></a>\r\n</noscript>\r\n",
				            "AdType": "Polite Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }
			        ],
			        "ResponseStatus": 1,
			        "ResponseStatusMessage": ""
			    }, 
			    {
			        "DeliveryGroupID": 165008,
			        "PreviewAdsInfoList": [
				        {
				            "AdId": 1362455,
				            "AdName": "VolvoMoradAD12_1",
				            "AdSizeInBytes": 12574,
				            "AdTag": "<script src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=rsb&c=28&pli=&PluID=0&pr=1&ai=1362455&w=300&h=250&ord=&p=&npu=$$$$&ncu=$$$$\"></script>\r\n<noscript>\r\n<a href=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=brd&FlightID=&Page=&PluID=0&Pos=7989&pr=1&EyeblasterID=1362455\" target=\"_blank\"><img src=\"http://bs.preview.serving-sys-dev4.com/BurstingPipe/adServer.bs?cn=bsr&FlightID=&Page=&PluID=0&Pos=7989&pr=1&EyeblasterID=1362455\" border=0 width=300 height=250></a>\r\n</noscript>\r\n",
				            "AdType": "Standard Banner",
				            "ResponseStatus": 1,
				            "responseStatusMessage": null
				        }
			        ],
			        "ResponseStatus": 1,
			        "ResponseStatusMessage": ""
			    }
		    ]
		};

        var transformResponseHelper = function(data, fieldToReturn) {
            // there was no data received
            if (!data) {
                return [];
            } else {
                var response = JSON.parse(data);    // parsing the response object
                var status = response.ResponseStatus;
                var statusMessage = response.StatusMessage;

                // status 1 means request succeeded
                if (status === 1) {
                    // this is the array we are after
                    return response[fieldToReturn];
                } else { 
                	// console.log('FAILED to call API. TO DO: Determine how to error handle when API fails or whatever, same way the loading spinning.');
                }
            }
        };

		factory.GetPreviewAdsByIDs = function(AdsIDs, UserID) {
			var q = $q.defer();

			if (TESTING_MODE) {
				q.resolve(DUMMY_DATA.GetPreviewAdsByIDs.AdsInfoList);
				return q.promise;
				// end of execution
			}

// console.log('AdsIDs', AdsIDs, 'UserID', UserID);

			// Example input: {"AdsIDs":[12121,1362455],"UserID":84533}
			$http({
				url: baseUrl + '/GetPreviewAdsByIDs/',
				method: 'POST',
				params: {
					AdsIDs: AdsIDs,
					UserID: UserID
				},
			})
			.success(function(response) {
				var output = transformResponseHelper(response, 'AdsInfoList');
				q.resolve(output);
			})
			.error(function(e) {
				q.reject('There was an error while calling the Preview API');
			});

			return q.promise;
		}

		factory.GetPreviewAdsByDeliveryGroupsIDs = function(DeliveryGroupsIDs, UserID) {
			var q = $q.defer();

			if (TESTING_MODE) {
				q.resolve(DUMMY_DATA.GetPreviewAdsByDeliveryGroupsIDs.PreviewDeliveryGroupsList);
				return q.promise;
			}

			// Example input: {"DeliveryGroupsIDs":[166588,165008],"UserID":84533}
			$http({
				url: baseUrl + '/GetPreviewAdsByDeliveryGroupsIDs/',
				method: 'GET',
				params: {
					DeliveryGroupsIDs: DeliveryGroupsIDs,
					UserID: UserID
				}
			})
			.success(function(response){
				var output = transformResponseHelper(response, 'PreviewDeliveryGroupsList');
				q.resolve(output);
			})
			.error(function(e){
				q.reject('There was an error while calling the Preview API');
			});

			return q.promise;
		}

		return factory;
	}
]);