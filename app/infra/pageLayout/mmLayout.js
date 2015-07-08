/**
 * Created by rotem.perets on 5/1/14.
 */

app.directive('mmRow', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="mm-row" ng-transclude></div>'
  };
});

app.directive('mmRowContainer', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="col-lg-12 col-md-12 col-xs-12" ng-transclude></div>'
  };
});

app.directive('mmLabelContainer', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="col-md-2 col-xs-4" ng-transclude></div>'
  };
});

app.directive('mmControlContainer', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div class="col-md-4 col-xs-8" ng-transclude></div>'
  };
})

app.directive('mmOneColumn', function() {
	return {
		restrict: 'E',
		transclude: true,
		template: '<div class="col-md-12 col-xs-12" ng-transclude></div>'
	};
})

app.directive('mmTwoColumns', function() {
	return {
		restrict: 'E',
		transclude: true,
		template: '<div class="col-md-6 col-xs-8" ng-transclude></div>'
	};
})

app.directive('mmThreeColumns', function() {
	return {
		restrict: 'E',
		transclude: true,
		template: '<div class="col-md-4 col-xs-8" ng-transclude></div>'
	};
})

app.directive('mmFourColumns', function() {
	return {
		restrict: 'E',
		transclude: true,
		template: '<div class="col-md-3 col-xs-8" ng-transclude></div>'
	};
})