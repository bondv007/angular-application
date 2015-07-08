(function() {

  /**
   * Created by matan.werbner on 3/15/15.
   */

  app.directive('mmSplitter', ['mmUtils', '$timeout', '$window', '$document', function(mmUtils, $timeout, $window, $document) {
    return {
      restrict: 'E',
      template: '<div ng-if="!isShowTree" ng-cloak class="splitterClosedContainer"></div><div class="mmSplitter"></div><button ng-click="toggleTree()" class="arrow-btn"><i ng-class="{\'fa assets-icon-Tree_view\':!isShowTree,\'fa fa-angle-left\':isShowTree}" class="fa fa-angle-left"></i></button>',
      scope: {
        leftElement: "@",
        rightElement: "@",
        containerElement: "@",
        minRight: "@",
        minLeft: "@"
      },
      link: function(scope, tElem, attrs) {
        scope.isShowTree = true;
        var leftElement = $document.find(scope.leftElement);
        var rightElement = $document.find(scope.rightElement);
        var container = $document.find(scope.containerElement);
        var grid = container.find('.ngGrid');
        var leftWidth = leftElement.css("width"),
          rightWidth = rightElement.css("width");

        tElem.find(".mmSplitter").on('mousedown', function(event) {
          event.preventDefault();
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function resizeGrid() {
          if (grid.length > 0) {
            grid.trigger('resize')
          };
        }

        scope.toggleTree = function() {
          scope.isShowTree = !scope.isShowTree;
          if (!scope.isShowTree) {
            tElem.parent().width("35px");
              leftElement.css("width", "0%");
            rightElement.css("width", "767px");
          } else {
             tElem.parent().width("0.5%");
            leftElement.css("width", leftWidth + "%");
            rightElement.css("width", rightWidth + "%");
          }
          resizeGrid();
        }


        function mousemove(event) {
          var containerOffset = mmUtils.utilities.GetElementOffset(container);
          var x = event.pageX;

          leftWidth = Math.max(scope.minLeft, ((x - containerOffset.left) / containerOffset.width) * 100);
          rightWidth = 99 - leftWidth;
          refreshWidth(container, leftWidth, rightWidth);
        }

        function refreshWidth(container, leftWidth, rightWidth) {

          if (scope.isShowTree) {
            if (rightWidth > scope.minRight) {
              leftElement.css("width", leftWidth + "%");
              rightElement.css("width", rightWidth + "%");
            }
          }
          var grid = container.find('.ngGrid');
          if (grid.length > 0) {
            grid.trigger('resize')
          };
        }


        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }
      }
    }
  }]);

})(angular);
