'use strict';

app.controller('navBarCtrl', ['$rootScope', '$scope', '$modal', 'mmSession', 'configuration', 'mmUserService', '$translate', 'mmRest', 'mmContextService', '$state', 'mmPermissions', 'entityMetaData', 'adminUtils', '$stateParams',
  function ($rootScope, $scope, $modal, session, config, mmUserService, $translate, mmRest, mmContextService, $state, mmPermissions, entityMetaData, adminUtils, $stateParams) {

    $scope.redirectToLogIn = function () {
      $rootScope.$previousState = $state.current;
      $rootScope.$previousStateParams = $state.params;
      $state.go('login');
    };

    if(session.get('Authorization') == 'logout'){
      $scope.redirectToLogIn();
    }

    $scope.appTitle = 'MediaMind 3.0';
    $scope.isModalOpen = false;
    $scope.env = config.env;
    $scope.userName = session.get('user').name;
    $scope.leftMenuButtons = [];

    checkAdminPermissions();
    checkMediaPermissions();

    $scope.leftMenuButtons.push(
      {name: 'Creative', uiRef: '.creativeCentralMain.adList', uiUrl: '/spa/creativeCentralMain/adList'},
      {name: 'Analytics', uiRef: 'spa.main', uiUrl: '/spa/main'},
      {name: 'Configuration', uiRef: '.configuration.inStreamTemplates', uiUrl: '/spa/configuration/inStreamTemplates'});

    $scope.activeButton = {};
    $scope.leftMenuButtons.forEach(function(button){
      $scope.activeButton[button.name] = false;
    });
    $scope.activeButton['Media'] = true;

    $scope.mmSubscribe('user', function (scope, newUser, oldUser) {
      $scope.userName = newUser.name;
      $scope.$root.loggedInUserId = newUser.id;
      $scope.$root.loggedInUserName = newUser.name;
      $scope.$root.loggedInUserAccountId = newUser.accountId;
    });

    var sessionUser = session.get('user');
    if (sessionUser) {
      $scope.$root.loggedInUserId = sessionUser.id;
      $scope.$root.loggedInUserName = sessionUser.name;
      $scope.$root.loggedInUserAccountId = sessionUser.accountId;
    }

    var disableAuthEvent = $scope.$on('event:auth-loginRequired', function () {
      $scope.redirectToLogIn();
    });
    /*
     $scope.showAlert=function(){
     return alert("hi");
     };*/

    function checkAdminPermissions(){
      var hasAccountsPermission = entityMetaData['account'].permissions.entity;
      var hasUsersPermission = entityMetaData['user'].permissions.entity;
      var hasSitesPermission = entityMetaData['site'].permissions.entity;

      if(mmPermissions.hasPermissionBySession(hasAccountsPermission))
        $scope.leftMenuButtons.push({name: 'Admin', uiRef: '.admin.accounts', uiUrl: '/spa/admin/accounts'});
      else if(mmPermissions.hasPermissionBySession(hasUsersPermission))
        $scope.leftMenuButtons.push({name: 'Admin', uiRef: '.admin.users', uiUrl: '/spa/admin/users'});
      else if (mmPermissions.hasPermissionBySession(hasSitesPermission))
        $scope.leftMenuButtons.push({name: 'Admin', uiRef: '.admin.sites', uiUrl: '/spa/admin/sites'});
    }

    function checkMediaPermissions(){
      var hasCampaignsPermission = entityMetaData['campaign'].permissions.entity;
      var hasAdvertisersPermission = entityMetaData['advertiser'].permissions.entity;
      var hasBillingIoViewPermission = entityMetaData['mediaIo'].permissions.entity.view;
	  var hasVersaTagPermission = entityMetaData['versaTag'].permissions.entity;
	  // var hasAdvertiserTagsPermission = mmPermissions.hasPermissionBySession(entityMetaData['advertiserVtag'].permissions.entity );
	  // TODO: change this back when there are advertiser tag permissions
	  var hasAdvertiserTagsPermission = true;

      if(mmPermissions.hasPermissionBySession(hasCampaignsPermission))
        $scope.leftMenuButtons.push({name: 'Media', uiRef: '.media.campaigns', uiUrl: '/spa/media/campaigns'});
      else if(mmPermissions.hasPermissionBySession(hasAdvertisersPermission))
        $scope.leftMenuButtons.push({name: 'Media', uiRef: '.media.advertisers', uiUrl: '/spa/media/advertisers'});
      else if(mmPermissions.hasPermissionBySession(hasBillingIoViewPermission))
          $scope.leftMenuButtons.push({name: 'Media', uiRef: '.media.ioList.ioEdit', uiUrl: '/spa/media/ioList.ioEdit'});
	  else if( mmPermissions.hasPermissionBySession( hasVersaTagPermission))
		  $scope.leftMenuButtons.push({name: 'Media', uiRef: '.media.versaTag', uiUrl: '/spa/media/versatags'});
	  else if( mmPermissions.hasPermissionBySession( hasAdvertiserTagsPermission))
		  $scope.leftMenuButtons.push({name: 'Media', uiRef: '.media.advertiserTags', uiUrl: '/spa/media/advertisertags'});

    }

    $scope.logOut = function () {
      $scope.redirectToLogIn();
      mmUserService.logout();
    };

    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey).then(function () {
        $scope.currentLanguage = $translate.use();
      });

    };

    $scope.OpenUserSettings = function(){
      var userId = session.get('user').id;
      $state.go('spa.user.userEdit', {userId: userId});
    }

    $scope.OpenAccountSettings = function(){
      var userAccountId = session.get('user').accountId;
      $state.go('spa.account.accountEdit', {accountId: userAccountId});
    }

//		$scope.currentLanguage = $translate.use();
    $translate.use('english').then(function () {
      $scope.currentLanguage = $translate.use();
    });

    $scope.$on("minimizePopup", function (event, data) {
      $('.modal,.modal-backdrop').hide();
      $scope.showFlyoutProgress = true;
      console.log("flyout");
      /*$scope.$apply();*/
    });
    $scope.$on("uploaderProgress", function (event, data) {
      $scope.uploader = data;
      $scope.$apply();
    });
    $scope.showAssetPopup = function () {
      $('.modal,.modal-backdrop').show();
    };

    $scope.$on("hideFlyoutProgress", function (event, data) {
      $scope.showFlyoutProgress = false;
      /*$scope.$apply();*/
    });

    $scope.uploader = null;
    $scope.showFlyoutProgress = false;

    $rootScope.safeApply = function (fn, scope) {
      var phase = $scope.$root.$$phase;
      if (phase == '$apply' || phase == '$digest') {
        if (fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        scope.$apply(fn);
      }
    };
    $scope.isActive = function (activeButton) {
      $scope.leftMenuButtons.forEach(function(button){
        $scope.activeButton[button.name] = false;
      });
      $scope.activeButton[activeButton] = true;
    };

    $scope.clearContext = function(){
      mmContextService.clearContext();
    }

    // Pre load main entities to cache
//    mmRest.accountsGlobal.getList();
    // TODO: waiting for server support
    //mmRest.advertisersGlobal.getList();
//    mmRest.sitesGlobal.getList();

    $scope.$on('$destroy', function(){
      if (disableAuthEvent) {
        disableAuthEvent();
      }
//        if (disableMinimizeEvent) {
//          disableMinimizeEvent();
//        }
//        if (disableUploaderEvent) {
//          disableUploaderEvent();
//        }
//        if (disableHideEvent) {
//          disableHideEvent();
//        }
    });
  }]);

