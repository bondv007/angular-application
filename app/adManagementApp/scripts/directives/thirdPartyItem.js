/**
 * Created by alon.shemesh 05/19/14
 */
app.directive('thirdPartyItem', function () {
  return {
    restrict: 'AE',
    require: 'ngModel',
    scope: {
      ngModel: "=",
			urlTypes : "="
    },
    transclude: true,
    templateUrl: 'adManagementApp/views/thirdPartyItem.html',
    link: function(scope, element, attrs) {

			scope.enableOptions= [{id:true,name:'Yes'},{id: false ,name:'No'}];

    }
  }
});