app.factory('strategies', ['csb', 'appService', 'decisionTreeService', 'EC2Restangular', '$q', 'mmAlertService', 'restPaths',
  function (csb, appService, decisionTreeService, EC2Restangular, $q, mmAlertService, restPaths) {

		var pub = {};

    	pub.data = {
			targetAudiencePriorities: []
		};

		// TODO: store data here (although diagram will still point to decisionTreeService.decisions)
		pub.strategyData = {
			diagram: decisionTreeService.decisions,
			notes: null,
			textBoxes: null,
			arrows: null,
			targetAudiences: null
		};

		/**
		 * Get the strategy by ID
		 * @param id
		 * @returns {*}
		 */
		pub.getStrategy = function( id ) {

			var deferred = $q.defer();

			EC2Restangular.one(restPaths[csb.config.env].strategies, id ).get().then(
				function( response ) {
					response = response.plain();
					response.diagram = JSON.parse( decodeURIComponent( response.diagram ) );
					angular.forEach( response, function( item, i ) {
						response[i] = item === '0' || item === '' ? null : item;
					});
					deferred.resolve( response );
				},
				function() {
					mmAlertService.addError( 'We cannot retrieve your strategy. Please try again later.' );
					deferred.reject();
				}
			);

			return deferred.promise;

		};


		/**
		 * Get the strategy preview(unsecured) by ID
		 * @param id
		 * @returns {*}
		 */
		pub.getStrategyPreview = function( id ) {

			var deferred = $q.defer();

			EC2Restangular.all(restPaths[csb.config.env].preview).one(restPaths.decisionDiagram, id ).get().then(
				function( response ) {
					response = response.plain();
					response.diagram = JSON.parse( decodeURIComponent( response.diagram ) );
					angular.forEach( response, function( item, i ) {
						response[i] = item === '0' || item === '' ? null : item;
					});
					deferred.resolve( response );
				},
				function() {
					deferred.reject( 'We cannot retrieve your strategy. Please try again later' );
				}
			);

			return deferred.promise;

		};


		/**
		 *
		 * @param id
		 * @returns {*}
		 */
		pub.saveStrategy = function( params ) {

			var deferred = $q.defer();

			// TODO: combine into one object ( strategies.strategyData or decisionTreeService.strategyData )
			var diagramData = {
				diagram: decisionTreeService.decisions,
				notes: appService.csbData.notes,
				textBoxes: appService.csbData.textBoxes,
				arrows: appService.csbData.arrows,
				targetAudiences: params.template ? null : appService.csbData.targetAudienceIDs
			};

			var saveObject = {
        type: "Strategy",
				decisionDiagramName: params.name,
				diagram: encodeURIComponent( JSON.stringify( diagramData ) ),
				accountId: csb.params.accountID,
				template: params.template,
				strategyType: params.template ? 'Template' : 'Campaign',
				campaignId: params.template ? null : params.campaignID || csb.params.campaignID || null,
				advertiserId: params.advertiserID || csb.params.advertiserID  || null
			};

			EC2Restangular.all(restPaths[csb.config.env].strategies).post( saveObject ).then(
				function( response ) {
					response = response.plain();
					response.diagram = JSON.parse( decodeURIComponent( response.diagram ) );
					angular.forEach( response, function( item, i ) {
						response[i] = item === '0' || item === '' ? null : item;
					});

					deferred.resolve( response );
				},
				function() {
					deferred.reject( 'We were unable to save your strategy. Please try again later.' );
				}
			);

			return deferred.promise;

		};


		/**
		 *
		 * @param id
		 * @returns {*}
		 */
		pub.updateStrategy = function() {

			var deferred = $q.defer();

			// TODO: combine into one object ( strategies.strategyData or decisionTreeService.strategyData )
			var diagramData = {
				diagram: decisionTreeService.decisions,
				notes: appService.csbData.notes,
				textBoxes: appService.csbData.textBoxes,
				arrows: appService.csbData.arrows,
				targetAudiences: appService.selectedStrategy.template ? null : appService.csbData.targetAudienceIDs
			};

			var updateObject = {
				type: 'Strategy',
				id: csb.params.diagramID,
				decisionDiagramName: appService.selectedStrategy.decisionDiagramName,
				diagram: encodeURIComponent( JSON.stringify( diagramData ) ),
				accountId: csb.params.accountID,
				template: appService.selectedStrategy.template,
				strategyType: appService.selectedStrategy.strategyType,
				campaignId: csb.params.campaignID,
				advertiserId: csb.params.advertiserID

			};

			EC2Restangular.all(restPaths[csb.config.env].strategies).customPUT( updateObject, csb.params.diagramID ).then(
				function( response ) {
					response = response.plain();
					response.diagram = JSON.parse( decodeURIComponent( response.diagram ) );
					angular.forEach( response, function( item, i ) {
						response[i] = item === '0' || item === '' ? null : item;
					});
					deferred.resolve( response );
				},
				function( error ) {
					deferred.reject('We were unable to update your strategy. Please try again.');
				}
			);

			return deferred.promise;

		};

		/**
		 *
		 * @param id
		 * @returns {*}
		 */
		pub.deleteStrategy = function( id ) {

			var deferred = $q.defer();

			EC2Restangular.one(restPaths[csb.config.env].strategies, id ).remove().then(
				function( response ) {
					deferred.resolve( response );
				}, function( error ) {
					deferred.reject( 'We were unable to delete your template. Please try again later.' );
				}
			);

			return deferred.promise;

		};

		/**
		 *
		 * @returns {*}
		 */
		pub.getStrategyTemplates = function( accountId ) {

			var deferred = $q.defer();

			EC2Restangular.all(restPaths[csb.config.env].strategies).one(restPaths.account, accountId ).get( { type: 'template' } ).then(
				function( response ) {
					response = response.plain();
					angular.forEach( response, function( template ) {
						template.diagram = JSON.parse( decodeURIComponent( template.diagram ));
						angular.forEach( template, function( item, i ) {
							template[i] = item === '0' || item === '' ? null : item;
						});
					});
					deferred.resolve( response );
				},
				function() {
					mmAlertService.addError('We were unable to fetch your templates');
					deferred.reject();
				}
			);

			return deferred.promise;

		};

    pub.getFunnelPriorities = function (campaignId) {
      campaignId = (csb.params.campaignID) ? csb.params.campaignID : campaignId;
      var deferred = $q.defer();
      EC2Restangular.one(restPaths[csb.config.env].strategies + "/" + restPaths.targetAudiencePriorities).withHttpConfig({cache: false}).get({"campaignId": campaignId}).then(function (targetAudiencePriorities) {
        pub.data.targetAudiencePriorities = targetAudiencePriorities;
        deferred.resolve(targetAudiencePriorities);
      }, function () {
        mmAlertService.addError("Server error. Please try again later");
        deferred.reject();
      });
      return deferred.promise;
    };

    pub.saveFunnelPriorities = function(){
      var deferred = $q.defer();
      EC2Restangular.one(restPaths[csb.config.env].strategies + "/" + restPaths.targetAudiencePriorities).customPUT(pub.data.targetAudiencePriorities,"?campaignId=" + csb.params.campaignID).then(function(){
        deferred.resolve();
      },function(){
        mmAlertService.addError("error_Save_New_Priorities");
        deferred.reject();
      });
      return deferred.promise;
    };

    pub.getStrategyIdByCampaignId = function (campaignId) {
      var deferred = $q.defer();
      EC2Restangular.one(restPaths[csb.config.env].strategies).withHttpConfig({cache: false}).get({campaignId: campaignId}).then(
        function (response) {
          var strategyId = (response && response.length > 0) ? response[0].id : null;
          deferred.resolve(strategyId);
        },
        function () {
          mmAlertService.addError('We cannot retrieve your strategy. Please try again later.');
          deferred.reject();
        }
      );
      return deferred.promise;
    };

    return pub;
  }
]);
