/**
 * Created by Asaf David on 11/30/14.
 */
'use strict';

/**
 * This directives dynamically binds a view based on a config object,
 * currently the configuration object supports:
 * templateUrl - The url of the wanted template
 * controller - The wanted controller
 */
app.directive('elView', ['$http', '$compile', '$controller', '$templateCache', function ($http, $compile, $controller, $templateCache) {
  return {
    restrict: 'ECA',
    compile: function(tElement) {
      var initialTemplate = tElement.html();
      return function (scope, elm, attrs) {
        var newScope;

        // Checks the configuration
        var config = scope.$eval(attrs.config);
        if (config) {
//          scope.elView = true;
          buildView(config);
        }

        // Gets the template (from cache if possible) and then $compile and update the view accordingly
        function buildView(pageConfig) {
          $http.get(pageConfig.templateUrl, {
            cache: $templateCache
          }).then(function(page) {
              elm.html(page.data);
              newScope = scope.$new();
              var link = $compile(elm.contents());

              if (pageConfig.controller) {
                var controllerParams = pageConfig.resolve || {};
                controllerParams.$scope = newScope;
                $controller(pageConfig.controller, controllerParams);
              }

              link(newScope);
            });
        }

        scope.$watch(attrs.config, function(newConfig, oldConfig) {
          clearView();
          if (newConfig && newConfig !== oldConfig) {
//            scope.elView = true;
            buildView(newConfig);
          }
        });

        // Returns the view to it's initial state
        function clearView() {
          // Empty the element
          elm.empty();

          // Clean the old scope
          if (newScope) {
            newScope.$destroy();
            newScope = null;
          }

          // Back to the initial tempalte
          elm.html(initialTemplate);
        }

        scope.$on('$destroy', function() {
          clearView();
          initialTemplate = null;
        })
      }
    }
  }
}]);