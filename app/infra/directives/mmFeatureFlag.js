(function() {

  /**
   * Created by matan.werbner on 2/17/15.
   */

  var name = 'mmFeature';
  app.directive(name, ['mmFeatureFlagService', 'ngIfDirective', function(mmFeatureFlagService, ngIfDirective) {
    var ngIf = ngIfDirective[0];
    return {
      transclude: ngIf.transclude,
      priority: ngIf.priority,
      terminal: ngIf.terminal,
      restrict: ngIf.restrict,
      link: function(scope, tElem, $attr) {

        var value = $attr[name];
        var featureOn = false;

        scope.$watchCollection(mmFeatureFlagService.GetFlags, function(newVal) {
          featureOn = mmFeatureFlagService.IsFeatureOn($attr[name]);
        }, true);

        $attr.ngIf = function() {
          return featureOn;
        };
        ngIf.link.apply(ngIf, arguments);
      }
    }
  }]);

})(angular);
