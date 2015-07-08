app.factory('csbInit', ['configuration', 'csb', 'appService', 'csbPermissions', '$q', '$http', 'mmSession',
  'mdx2Api', 'EC2Restangular', 'previewApi', '$rootScope', 'strategies','mm2PreviewServers', '$window',
  function (configuration, csb, appService, csbPermissions, $q, $http, mmSession, mdx2Api,
            EC2Restangular, previewApi, $rootScope, strategies,mm2PreviewServers, $window) {
    var pub = {};

    /**
     * Init is ran when accessing each route. It is initted in the resolve of each route.
     * @param $stateParams is passed in so we can get access to the current states parameters (accountID is the only param for now)
     * @returns {*}
     */
    pub.init = function ($stateParams) {

      var deferred = $q.defer();
      csb.clear();
      csb.config.panelHeight = {'height':$window.innerHeight - 134 + 'px'};

      // check if there is a parent window
      // mdx2 is triggered with a parent window so we will use this to determine if it is mdx2
      // ------------ MDX2 --------------
      if (window.self !== window.top) {

        $rootScope.isMMNext = false;
        csb.config.env = 'mdx2';
        csb.config.envID = $stateParams.EnvID ? $stateParams.EnvID : csb.config.envID;
        csb.config.baseApiUrl = mdx2Api['env' + $stateParams.EnvID];
        csb.config.basePreviewUrl = previewApi['env' + $stateParams.EnvID] + "?sid=" + $stateParams.SessionID;
        csb.params.sessionID = csb.params.sessionID || $stateParams.SessionID;
        csb.params.diagramID = csb.params.diagramID || ($stateParams.DecisionDiagramID != 'null' && $stateParams.DecisionDiagramID != '-1') ? $stateParams.DecisionDiagramID : null;
        csb.params.userID = csb.params.userID || $stateParams.UserID;
        csb.params.accountID = csb.params.accountID || $stateParams.AccountID;
        csb.params.campaignID = csb.params.campaignID || $stateParams.CampaignID;
        // set the common session ID to the headers
        $http.defaults.headers.common['SessionID'] = csb.params.sessionID;

        // set sessionID with EC2Restangular service
        EC2Restangular.setDefaultHeaders({'sessionID': csb.params.sessionID});

        EC2Restangular.setBaseUrl(csb.config.baseApiUrl + 'rest/csb/');
        EC2Restangular.one("LogIn/Server").get();

        // now are going to get the user permissions.. only if we are using mdx2
        csbPermissions.getPermissions()
          .then(function (permissions) {

            csb.params.permissions = {
              edit: permissions.userPermissions[0].isPermitted,
              read: permissions.userPermissions[1].isPermitted
            };

            deferred.resolve(true);

          }, function () {
            deferred.reject();
          }
        );
      }
      // else we are getting it from MDX3.. how we are getting some of the vars TBD....
      // ------------- MDX3 -----------------
      else {

        // get the user information from angular web storage
        var user = mmSession.get('user');
        csb.config.env = 'mdx3';
        csb.params.userID = user.id;
        csb.params.accountID = user.accountId;
        if($stateParams && $stateParams.campaignId){
          csb.params.campaignID =  $stateParams.campaignId;
        }

        // TODO: figure out where permissions are stored
        csb.params.permissions = {
          edit: true,
          read: true
        };

        if ($stateParams.campaignId) {
          strategies.getStrategyIdByCampaignId($stateParams.campaignId).then(function (strategyId) {
            csb.params.diagramID = strategyId;
            deferred.resolve();
          });
        } else {
          csb.params.diagramID = ($stateParams.strategyId) ? $stateParams.strategyId : null;
          deferred.resolve();
        }
      }

      return deferred.promise;
    };

    pub.initShare = function ($stateParams) {

      // mm2
      if ($stateParams.DecisionDiagramID) {
        csb.params.diagramID = $stateParams.DecisionDiagramID;
        csb.config.baseApiUrl = mdx2Api['env' + $stateParams.EnvID];
        EC2Restangular.setBaseUrl(csb.config.baseApiUrl + 'rest/');
        EC2Restangular.setDefaultHeaders({'Authorization': undefined});
      }

      // mm3
      else if ($stateParams.diagramID) {
        csb.params.diagramID = $stateParams.diagramID;
        csb.config.baseApiUrl = configuration.ec2;
      }

    };

    return pub;

  }
]);
