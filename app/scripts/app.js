/*** Created by liron.tagger on 10/31/13.*/
'use strict';


// CSB: TODO figure out how to handle preview URLS
// check which preview URL to use based on the rootUrl
//if ( sizmek.rootUrl == 'https://dev4.eyeblaster.com/' ) {
//    sizmek.previewUrl = 'http://dev4.sizmdx.com/#/preview';
//}
//else{
//    sizmek.previewUrl = 'http://csbprod.sizmdx.com/#/preview';
//}


var app = angular.module('MediaMindApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.event',
    'ui.router',
    'ui.bootstrap',
    'restangular',
    'ngGrid',
    'http-auth-interceptor',
    'services.config',
    'ngLocale',
    'chieffancypants.loadingBar',
    'ngAnimate',
    'angularSpinkit',
    'webStorageModule',
    'angularFileUpload',
    'ui.layout',
    'ngDragDrop',
    'pascalprecht.translate',
    'scroller',
    'angularTreeview',
    'ngClipboard',
    'ui.tree',
    'colorpicker.module',
    'angucomplete-alt',
    'angularSpectrumColorpicker',
    'textAngular',
    'cb.x2js',
    'wijspread',
    'infinite-scroll',
		'mm.common'
  ])
  .config(['$translateProvider', 'ngClipProvider', function ($translateProvider, ngClipProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: './languages/',
      suffix: '.json'
    });
    $translateProvider.fallbackLanguage('english');
    $translateProvider.useLocalStorage();

    ngClipProvider.setPath("../bower_components/zeroclipboard/ZeroClipboard.swf");

  }])
  .run(['$rootScope', '$state', 'mmPermissions', function ($rootScope, $state, mmPermissions) {
    $rootScope.$on('$stateChangeSuccess', function (event, to, toParams, from, fromParams) {
      $rootScope.title = to.title || ' MDx';
    });

    $rootScope.$on('$stateChangeStart', function (event, current) {
      if ($rootScope.mmIsPageDirty > 0) {
        var answer = confirm('You have unsaved changes. \r\nAre you sure you want to leave this page ?');
        if (!answer) {
          event.preventDefault();
        }
      }

      var permissions = current.permissions;
      if (!_.isUndefined(permissions) && !mmPermissions.hasPermissionBySession(permissions)) {
          event.preventDefault();
          $state.go('spa.main');//Home Page
      }
    });
  }]);
