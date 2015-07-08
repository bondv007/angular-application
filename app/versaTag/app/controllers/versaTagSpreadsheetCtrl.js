app.controller( 'versaTagSpreadsheetCtrl' , [ '$scope', '$stateParams', 'EC2Restangular', 'FileUploader', '$timeout', 'entityMetaData', 'versaTagConstants',
	function( $scope, $stateParams, EC2Restangular, FileUploader, $timeout, entityMetaData, versaTagConstants ) {


		/**
		 * top right button ( save/update/upload button )
		 */
		$scope.entityLayoutInfraButtons.saveButton = {
			name: 'Update VersaTags',
			func: function() { $scope.saveFlag = true }
		};

		/**
		 * NOT SURE IF I WANT TO KEEP THIS.. EXPOSES THE SHEET DATA
		 * @type {{}}
		 */
		$scope.spreadsheetData = {};

		$scope.$watch( 'spreadsheetData', function( newVal ) {
			//console.log('spreadsheet changed: ', newVal );
		}, true );


		/**
		 *
		 * -------------------------------------------------------------------------
		 * THE FOLLOWING IS ALL THE DATA NEEDED FOR LOADING THE SPREADSHEET DIRECTIVE
		 * -------------------------------------------------------------------------
		 *
		 **/

		/**
		 * Defining the sheets needed
		 *
		 * name (string) (*required*): The name of the sheet
		 * rest path (string): the path that will be used to fetch the data for that sheet
		 * conversionFromServerFunction (function): the function that will do any conversion of data after retrieving from server
		 * converionToServerFuction (function): the function that will do any conversion before sending to server
		 * singleEntity (boolean): if object instead of array is retrieved from server it uses a different method
		 * data (array): Can be used to pass data into the sheet instead of a rest path
		 */
		$scope.spreadsheetName = $stateParams.versaTagId + '-spreadsheet';

		$scope.spreadsheetSheets = [
			{
				name: 'General Settings',
				restPath: entityMetaData.versaTag.restPath + '/' + $stateParams.versaTagId,
				conversionFromServerFunction: generalSettingsFromServerConversion,
				conversionToServerFunction: generalSettingsToServerConversion,
				validationRestPath: '',
				saveKey: 'generalSettings',
				singleEntity: true,
				readOnlyColumns: [
					'fieldName',
					'value',
					'comments'
				]
				//autoCompleteColumns: [
				//	{
				//		columnName: 'value',
				//		restPath: 'tags/groups/suggest/1/'
				//	}
				//]
			},
			{
				name: 'Firing Conditions',
				restPath: entityMetaData.firingConditions.restPath,
				restParameters: { versaTagId: $stateParams.versaTagId },
				conversionFromServerFunction: firingConditionsFromServerConversion,
				// TODO: Have Angad change this to firingConditions
				//saveKey: 'mappingRuleDetails',
				//conversionToServerFunction: undefined,
				readOnlyColumns: [ 'Mapping Rule ID' ],
				optionsForColumns: [
					{
						columnName: 'Status',
						options: [
							'New',
							'Edited',
							'Delete',
							'Archive'
						]
					}
				],
				defaultDataObject: {
					id: '',
					name: '',
					urlList: '',
					type: '',
					trackingProtocol: '',
					trackAnySubdomain: '',
					trackStandardIndexIgnoreSlashes: ''
				}

			},
			{
				name: 'Conversion Tags',
				restPath: 'tags/conversion/versaTagId/' + $stateParams.versaTagId,
				conversionFromServerFunction: conversionTagsFromServerConversion,
				conversionToServerFunction: conversionTagsToServerConversion,
				saveKey: 'conversionTags',
				//readOnlyColumns: [ 'Conversion Tag ID', '# of Attached Third-Party Tags', 'VersaTag Firing Condition ID' ],
				readOnlyColumns: [ 'Conversion Tag ID', '# of Attached Third-Party Tags', 'VersaTag Firing Condition ID', 'Advertiser ID' ],
				// in order of importance
				serverFieldsToSearchOnError: [ 'id', 'reportingName' ],
				fieldMap: {
					advertiserId: 'Advertiser ID'
				},
				optionsForColumns: [
					{
						columnName: 'Status',
						options: [
							'New',
							'Edited',
							'Delete',
							'Archive'
						]
					},
					{
						columnName: 'Server Protocol',
						options: [
							'Http',
							'Https',
							'Http & Https',
							'Exactly as Entered',
							'Invalid URLs'
						]
					},
					{
						columnName: 'Conversion Status',
						options: [
							'TRUE',
							'FALSE'
						]
					}
				]
			},
			{
				name: 'Third-Party Tags',
				restPath: entityMetaData.thirdPartyTags.restPath,
				conversionFromServerFunction: conversionPlaceholder,
				conversionToServerFunction: undefined
			},
			{
				name: 'Retargeting Tags',
				restPath: undefined,
				conversionFromServerFunction: undefined,
				conversionToServerFunction: undefined
			},
			{
				name: 'Quick Tags',
				restPath: undefined,
				conversionFromServerFunction: undefined,
				conversionToServerFunction: undefined
			},
			{
				name: 'Legend',
				data: versaTagConstants.excel.legend,
				conversionFromServerFunction: undefined,
				conversionToServerFunction: undefined
			},
			{
				name: 'Retargeting Possible Values',
				restPath: undefined,
				conversionFromServerFunction: undefined,
				conversionToServerFunction: undefined
			}
		];


		/**
		 *
		 * Object that will get passed to directive where sheet data gets loaded
		 * TODO: figure a better implementation to pass in
		 *
		 * @type {{}}
		 */
		$scope.saveObject = {
			type: "VersaTagExcel",
			generalSettings: {

			}
		};

		$scope.saveRestPath = 'versaTag/excel';


		/**
		 * CONVERSION FUNCTIONS
		 * TODO: probably want to put these into a factory
		 * these will convert data either after getting it from the server
		 * or when you are sending to the server
		 */

		function conversionPlaceholder( data ) {
			return data;
		};

		/**
		 * General settings sheet conversion
		 * Takes a flat object and turns it into an array (each object in the array is a row in excel)
		 * @param data
		 * @returns {*[]}
		 */
		function generalSettingsFromServerConversion( data ) {

			// convert the parameters to show as [ name, sector, comments ],[ name, sector, comments ]
			var parameters = '';
			angular.forEach( data.parameters, function( parameter, i ) {
				parameters += parameter.name + ', ' + parameter.sector + ', ' + parameter.comments;
				i < data.parameters.length - 1 ? parameters += '; ' : null;
			});

			var convertedData = [
				{ fieldName: 'VersaTag ID', value: data.id, comments: '' },
				{ fieldName: 'VersaTag Name', value: data.name, comments: '' },
				{ fieldName: 'Website Main URL', value: data.pageURL, comments: '' },
				{ fieldName: 'Connected Advertisers', value: data.advertiserIds.join(';'), comments: '' },
				{ fieldName: 'Code Settings - Protocol', value: data.forceHTTPS ? 'HTTPS' : 'HTTP', comments: '' },
				{ fieldName: 'Code Settings - Parameters', value: parameters, comments: '' }
			];

			return convertedData;

		};

		/**
		 * Conversion to take general settings and convert to a format the server will accept
		 * @param data
		 * @returns {*}
		 */
		function generalSettingsToServerConversion( data ) {

			var convertedData = {
				versaTag: {
					type: 'VersaTag'
				}
			};

			angular.forEach( data, function( dataRow ) {

				if ( dataRow.fieldName == 'VersaTag ID' ) {
					convertedData.versaTag.id = dataRow.value;
				}
				else if ( dataRow.fieldName == 'VersaTag Name' ) {
					convertedData.versaTag.name = dataRow.value;
				}
				else if ( dataRow.fieldName == 'Website Main URL' ) {
					convertedData.versaTag.pageURL = dataRow.value;
				}
				else if ( dataRow.fieldName == 'Connected Advertisers' ) {
					convertedData.versaTag.advertiserIds = dataRow.value.split(';');
				}
				else if ( dataRow.fieldName == 'Code Settings - Parameters' ) {
					convertedData.versaTag.parameters = [];
					var parameters = dataRow.value.split(';');
					angular.forEach( parameters, function( parameter ) {
						parameter = parameter.split(',');
						convertedData.versaTag.parameters.push(
							{
								name: parameter[0].trim(),
								sector: parameter[1].length ? parameter[1 ].trim() : null,
								comments: parameter[2].trim() }
						)
					});
				}

			});

			return convertedData;
		};

		/**
		 * Cconversion from the server
		 * Splits firing conditions into separate rows by the URLs in each condition
		 * @param data
		 * @returns {Array}
		 */
		function firingConditionsFromServerConversion( data ) {

			console.log('firing data', JSON.stringify( data[1] ) );

			var convertedData = [];

			angular.forEach( data, function( dataItem ) {

				var firingCondition = {
					"Status": null,
					"Firing Conditions ID": dataItem.id,
					"Firing Conditions Name": dataItem.name,
					"Landing URL Condition": null,
					"Referral URL Condition": null,
					"Tracking Protocol": null,
					"Track Any Subdomain": null,
					"Track also index paths": null
				};

				var landingUrlCondition,
					referralCondition,
					userTagExposure,
					parametersCondition;

				angular.forEach( dataItem.conditions, function( condition ) {

					if ( condition.ifUser == 'LandedOn' ) {
						firingCondition['Landing URL Condition'] = condition.urlList.join('/n');
						firingCondition['Tracking Protocol'] = condition.trackingProtocol;
						firingCondition['Track Any Subdomain'] = condition.trackAnySubdomain;
						firingCondition['Track also index paths'] = condition.trackStandardIndexIgnoreSlashes

						if ( condition.ifUser.or && condition.ifUser.or.length ) {

							angular.forEach( condition.ifUser.or, function( orCondition ) {

								if ( orCondition.ifUser == 'WasReferredFrom') {

								}

							});

						}

					}

				});

				convertedData.push( firingCondition );

				// if there are conditions ( which all firing conditions should have )
				//if ( dataItem.conditions ) {
				//
				//	angular.forEach( dataItem.conditions, function( condition ) {
				//
				//		convertedData.push({
				//			"Status": "",
				//			"Firing Conditions ID": dataItem.id,
				//			"Firing Conditions Name": dataItem.name,
				//			"Criteria/Action": condition.urlList ? condition.urlList.join(',') : null,
				//			"Tracking Protocol": condition.trackingProtocol,
				//			"Track Any Subdomain": condition.trackAnySubdomain,
				//			"Track also index paths": condition.trackStandardIndexIgnoreSlashes
				//		});
				//
				//	});
				//
				//}
				//
				//// probably only falling into this condition if no firing conditions were retrieved
				//else{
				//
				//	convertedData.push({
				//		"Status": "",
				//		"Firing Conditions ID": dataItem.id,
				//		"Firing Conditions Name": dataItem.name,
				//		"Criteria/Action": null,
				//		"Type": dataItem.type,
				//		"Tracking Protocol": null,
				//		"Track Any Subdomain": null,
				//		"Track also index paths": null
				//	});
				//
				//}


			});

			return convertedData;

		};


		function firingConditionsToServerConversion( data ) {

			var convertedData = [];

			//TODO: FINISH

			var tempObject = {};
			angular.forEach( data, function( dataItem ) {

				// first we need to combine any that have the same ID
				// so we will create an object with the NAME as the key

			});

			return convertedData;

		};


		function conversionTagsFromServerConversion( data ) {

			var convertedData = [];

			angular.forEach( data, function ( dataItem ) {

				convertedData.push({
					"Status": "",
					"Conversion Tag ID": dataItem.id,
					"Conversion Name" : dataItem.reportingName,
					"Conversion Status": dataItem.status.toString().toUpperCase(),
					"Advertiser ID": dataItem.advertiserId,
					"Conversion Tag Type": dataItem.conversionType,
					"Conversion Tag Value": dataItem.conversionValue,
					"Conversion Tag URL": dataItem.pageURL,
					"Currency": dataItem.conversionCurrency,
					"Server Protocol": dataItem.protocol,
					"# of Attached Third-Party Tags": dataItem.numberOfThirdPartyTags > 0 ? dataItem.numberOfThirdPartyTags: 0,
					"VersaTag Firing Condition ID": dataItem.firingConditionIds.join(',')
				});

			});

			return convertedData;

		};

		function conversionTagsToServerConversion( data ) {

			var convertedData = {
				conversionTagListToUpdate: [],
				conversionTagListToSave: [],
				conversionTagListToDelete: []
			};

			var map = {
				New: 'conversionTagListToSave',
				Edited: 'conversionTagListToUpdate',
				Delete: 'conversionTagListToDelete'
			};

			angular.forEach( data, function( dataItem ) {

				if ( dataItem['Status'] ) {

					convertedData[ map[ dataItem['Status'] ] ].push({
						"type": "ConversionTag",
						"reportingName": dataItem['Conversion Name'],
						"advertiserId": dataItem['Advertiser ID'],
						"pageURL": dataItem['Conversion Tag URL'],
						"status": dataItem['Conversion Status'].toLowerCase(),
						"id": dataItem['Conversion Tag ID'],
						"conversionType": dataItem['Conversion Tag Type'],
						"conversionValue": dataItem['Conversion Tag Value'],
						"conversionCurrency": dataItem['Currency'],
						"protocol": dataItem['Server Protocol']
					});

				}

			});

			return convertedData;

		};

	}
]);