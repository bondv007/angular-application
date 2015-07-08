/**
 * Created by eran.nachum on 4/9/14.
 */
app.directive('clickthroughItem',['enums', function (enums) {
  return {
    restrict: 'AE',
    require: 'ngModel',
    scope: {
      ngModel: "=",
      targetWindowTypes : "=",
			urlTypes : "=",
			urlType : "@"

    },
    transclude: true,
    templateUrl: 'adManagementApp/views/clickthroughItem.html',
    link: function(scope, element, attrs) {
			scope.getClickthroughUrlType = function(id){
				return _.findWhere(enums.clickthroughURLsTypes, {'id': id});
			};
    }
  }
}]);