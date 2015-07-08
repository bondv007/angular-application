// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        preprocessors: {
          '**/*.html': ['ng-html2js']
        },

        // list of files / patterns to load in the browser
        files: [
            //packages
            'app/bower_components/jquery/dist/jquery.js',
            'app/bower_components/jquery-ui/ui/jquery-ui.js',
            'app/bower_components/jquery-ui/ui/jquery.ui.datepicker.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-file-upload/angular-file-upload.min.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/bower_components/angular-http-auth/src/http-auth-interceptor.js',
            'app/bower_components/ng-grid/build/ng-grid.min.js',
            'app/bower_components/lodash/dist/lodash.js',
            'app/bower_components/restangular/dist/restangular.js',
            'app/bower_components/angular-webstorage/angular-webstorage.js',
            'app/bower_components/moment/moment.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'app/bower_components/angular-ui-tree/dist/angular-ui-tree.js',
            'app/bower_components/angular-loading-bar/build/loading-bar.js',
            'app/bower_components/ui-layout/ui-layout.js',
            'app/bower_components/angular-dragdrop/src/angular-dragdrop.js',
            'app/bower_components/angular-translate/angular-translate.js',
            'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            'app/bower_components/angular-translate-storage-local/angular-translate-storage-local.js',
            'app/bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
            'app/bower_components/angular-resource/angular-resource.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-sanitize/angular-sanitize.js',
            'app/bower_components/angular-animate/angular-animate.js',
            'app/bower_components/angular-spinkit/build/angular-spinkit.min.js',
            'app/bower_components/angular-treeview/angular.treeview.js',
            'app/bower_components/zeroclipboard/ZeroClipboard.js',
            'app/bower_components/ng-clip/dest/ng-clip.js',
            'app/infra/scroller/scripts/scroller.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/FileSaver/FileSaver.js',
            'app/bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
            'app/infra/directives/script/base/angucomplete-alt.js',
            //'app/infra/directives/script/mmSelect.js',
            'app/bower_components/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.js',
            'app/bower_components/textAngular/src/textAngular.js',
            'app/bower_components/textAngular/src/textAngularSetup.js',
            'app/bower_components/textAngular/src/textAngular-sanitize.js',
            'app/bower_components/textAngular/src/textAngular-sanitize.js',
            'app/bower_components/wijmo-spread-js/index.js',
            'app/media/scripts/wijmo-spread-angular-js/index.js',
            'app/bower_components/x2js/xml2json.js',
            'app/bower_components/angular-x2js/src/x2js.js',
            'app/bower_components/papa-parse/papaparse.js',
            'app/bower_components/js-xlsx/jszip.js',
            'app/bower_components/js-xlsx/xlsx.js',
			      'app/bower_components/mustache/mustache.min.js',
            'app/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',

						// common module
						'app/common/**/*.js',

            //infra directives and services
            'app/scripts/app.js',
            'app/scripts/constants/*.js',
            'app/scripts/services/*.js',
            'app/infra/**/*.js',
            'app/scripts/constants/enums.js',
            'app/scripts/constants/infraEnums.js',
            'app/scripts/prototype.js',
            'app/csbApp/app/csb.js',
            'app/csbApp/app/constants/mdx2.js',
            'app/campaignManagementApp/directives/dg/dgs/services/dgsService.js',
						'app/infra/directives/event.js',
						'app/infra/filters/moment.js',
						'app/infra/filters/t.js',
						'app/infra/services/mmSession.js',
						'app/infra/services/recentItems.js',
						'app/infra/services/ec2Restangular.js',
						'app/infra/services/mmModal.js',
						'app/infra/services/mmAlert.js',
						'app/infra/services/mmRest.js',
						'app/infra/services/mmPermissions.js',
						'app/infra/services/mmUtils.js',
						'app/infra/services/mmContext.js',
						'app/infra/services/ec2AMSRestangular.js',
						'app/infra/services/mmMediaTypeIcon.js',
						'app/infra/services/mmFeatureFlag.js',
						'app/infra/directives/services/wizardHelper.js',
					
            //controllers
            'app/adManagementApp/scripts/**/*.js',
            'app/campaignManagementApp/scripts/**/*.js',
            'app/campaignManagementApp/scripts/**/**/*.js',
            'app/campaignManagementApp/directives/dg/**/**/*.js',
            'app/csbApp/app/**/*.js',
            'app/configurationManagementApp/scripts/**/*.js',

            //tests
            'app/bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'test/spec/controllers/*.js',
            'test/spec/services/*.js',
            'test/spec/services/**/*.js',
            'test/spec/directiveServices/*.js',
            'app/**/*.spec.js',

            // templates
            '**/*.html',

            // Fixtures
            {pattern: 'test/fixtures/*.json', watched: true, served: true, included: false}
        ],

        // list of files / patterns to exclude
        exclude: [
          'app/infra/central/scripts/serverCentral.js'
        ],

        reporters: ['progress'],

        // web server port
        port: 8080,

        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        browserNoActivityTimeout: 30000,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        // ng-html2js settings
        ngHtml2JsPreprocessor: {
          // strip this from the file path
          stripPrefix: 'app/'
        }
    });
};
