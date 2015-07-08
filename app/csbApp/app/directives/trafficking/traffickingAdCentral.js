/**
 * Created by ofir.fridman on 2/25/2015.
 */
/**
 * This directive wraps the central directive and waits for campaign ID to be defined before injecting the central directive
 */
'use strict';
app.directive('traffickingRightSidebar', ['csb', '$compile',
  function (csb, $compile) {

    return {
      restrict: 'EA',
      scope: {
        adDataObject: '=',
        entityType: '=',
        entityId: '='
      },
      link: function (scope, element) {
        var watcher = scope.$watch('entityId', function (entityId) {
          if (entityId) {
            element.append($compile('<central central-data-object="adDataObject" entity-type="entityType" entity-id="entityId" disable-edit="true"></central>')(scope));
          }
        });

        scope.$on('$destroy', function () {
          if (watcher) {
            watcher();
          }
        });

      }
    }
  }
]);
