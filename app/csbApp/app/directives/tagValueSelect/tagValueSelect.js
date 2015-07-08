//TODO: probably deprecated. will be deleted upon next push




///**
// * Created by Rick.Jones on 9/30/14.
// */
//app.directive('tagValueSelect', [
//    function(){
//
//        return {
//            restrict: 'A',
//            scope: {
//                onChange: '&',
//                rule: '=',
//                tags: '='
//            },
//            //template: '<select class="form-control" ng-model="rule.details" ng-options="tag.Name for tag in tags track by tag.ID"><option value="">Choose..</option></select>',
//            template: '<mm-drop-down '
//				+ 'mm-layout-type="custom" '
//				+ 'mm-custom-control-width="132" '
//				+ 'mm-hide-label="{{true}}" '
//				+ 'mm-data-model="tags" '
//				+ 'mm-model="rule.details" '
//				+ 'mm-select-change-func="onChange"'
//				+ '></mm-drop-down>',
//            link: function(scope, element, attrs){
//
//                element.change(function(){
//                    if(scope.onChange) {
//                        scope.onChange();
//                    }
//					console.log( 'changed'  );
//                });
//
//                scope.$watch('rule', function(newRuleValue){
//                    element.change();
//                });
//
//                element.change();
//
//            }
//        };
//
//    }
//]);
