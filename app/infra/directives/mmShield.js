(function() {

  /**
   * Created by matan.werbner on 2/23/15.
   */

  app.directive('mmShield', ['$rootScope', 'mmUtils', '$timeout', '$window', function($rootScope, mmUtils, $timeout, $window) {
    $rootScope.showShield = false;
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        enableShield: '=',
        onTouch: '&',
        flipOffset: '@'
      },
      template: '<div class="shield">  \
            <div class="shieldInner" ng-transclude ng-click="transcludeClicked($event)"></div></div>',
      link: function(scope, tElem) {
        init();

        function init() {
          if (scope.enableShield) {
            var ElementOffset = mmUtils.utilities.GetElementOffset(tElem);
            var shield = tElem.find(".shield");
            var shieldInner = tElem.find(".shieldInner");
            shield.addClass("enabled");

            setTimeout(function() {
              var childOffset = mmUtils.utilities.GetElementOffset(shieldInner.children());
              var topPos;
              shieldInner.css("left", ElementOffset.left);

              if (ElementOffset.top + childOffset.height >= $window.innerHeight) {
                topPos = ElementOffset.top - childOffset.height - scope.flipOffset;
              } else {
                topPos = ElementOffset.top;
              }
              shieldInner.css("top", topPos);
              shield.addClass("loaded");
            })

            tElem.bind("mousewheel", function(e) {
              e.stopPropagation();
              hideShield(e);
            });
            tElem.bind("click", function(e) {
              e.stopPropagation();
              hideShield(e);
            });

            function hideShield(e) {
              $timeout(function() {
                shield.removeClass("loaded");
                shield.removeClass("enabled");
                scope.onTouch({
                  event: e
                });
              });
            }

            scope.$on("$destroy", function() {
              tElem.off("click");
              tElem.off("mousewheel");
            });
          }
        }

        scope.transcludeClicked = function(e) {
          if (scope.enableShield) {
            e.stopPropagation();
          }

        }
      }
    }
  }]);

})(angular);
