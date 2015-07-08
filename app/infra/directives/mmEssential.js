/**
 * Created by eran.nachum on 3/5/14.
 */

/* Deprecated */
app.directive('mmEssential', ['$compile', '$rootScope', function ($compile, $rootScope) {
	return {
		restrict: 'EA',
		require: 'ngModel',
		scope: {
      ngModel: "=",
      mmType: "=",
      mmRequired: "@",
      mmPlaceholder: "@",
      mmMaxLength: "@",
      mmSize: "@",
      mmOptions: "@",
      mmDisabled: "@",
      mmLink: "@",
      mmSelectData: "=",
      mmTooltip: "@",
      mmOnchange: "&",
      mmOnfocus: "&",
      mmOnblur: "&"
    },
		templateUrl: 'infra/views/mmEssential.html',
      link: function(scope, element, attrs, ctrl) {
        // if the data is empty show the input control open
        scope.showInput = scope.ngModel == "" || attrs.mmDisabled;
        scope.isLinkElement = attrs.mmLink != undefined;
        scope.isDisabled = attrs.mmDisabled == "true";
        scope.cssClass = "plain";
        scope.showEdit = false;
        scope.mmLink = scope.mmLink != undefined ? scope.mmLink : "#";
        scope.controlType = attrs.mmType;

      var elem;
      switch(attrs.mmType)
      {
        case "text":
          elem = angular.element("<input type='text' ng-class='cssClass' " +
            (attrs.mmTooltip ? (" tooltip='" + attrs.mmTooltip + "' ") : "") +
            " ng-disabled='" + scope.isDisabled + "' " +
            (attrs.mmRequired ? " ng-required " : "") +
            (attrs.mmPlaceholder ? " placeholder='" + attrs.mmPlaceholder + "' " : "") +
            (attrs.mmMaxLength ? (" maxlength='" + attrs.mmMaxLength + "'") : "") +
            (attrs.mmSize ? (" style='width:" + attrs.mmSize + "px' ") : (" size=100%")) +
            " ng-show='showInput' ng-blur='onBlur()' ng-focus='onFocus()' ng-keyup='onKeyUp($event)' ng-model='$parent.ngModel' />");
          break;
        case "select":
          elem = angular.element("<select ng-class='cssClass' " +
            " ng-options='" + attrs.mmOptions + " in mmSelectData' " +
            (attrs.mmTooltip ? (" tooltip='" + attrs.mmTooltip + "' ") : "") +
            " ng-disabled='" + scope.isDisabled + "' " +
            (attrs.mmRequired ? " ng-required " : "") +
            (attrs.mmPlaceholder ? " placeholder='" + attrs.mmPlaceholder + "' " : "") +
            (attrs.mmSize ? (" style='width:" + attrs.mmSize + "px' ") : (" style='width:100%'")) +
            " ng-show='showInput' ng-blur='onBlur()' ng-change='onChange()' ng-focus='onFocus()' ng-keyup='onKeyUp($event)' ng-model='$parent.ngModel'></select>");
          break;
      }

      scope.onBlur = function(){
          if (attrs.mmRequired && scope.ngModel == '') {
            scope.cssClass = "error";
          }
          else {
            scope.cssClass = "plain";
            scope.showInput = false;
          }
        }

      scope.onFocus = function(){

      }

      scope.onKeyUp = function($event){
        if (attrs.mmRequired && scope.ngModel == '') {
          scope.cssClass = "error";
        }
        else {
          scope.cssClass = "plain";
        }

        // if enter has been clicked
        if ($event.keyCode == 13){
            scope.onBlur();
        }
      }

      var html = $compile(elem)(scope);
      element.find(".first").after(html);
    },
		controller: function() {

//      $scope.onChange = function(){
//        $scope.mmOnchange();
//      }
//
//      $scope.onBlur = function(){
//        $scope.mmOnblur();
//      }
//
//      $scope.onFocus = function(){
//        $scope.mmOnfocus();
//      }
		}
	}
}]);
/* Deprecated */