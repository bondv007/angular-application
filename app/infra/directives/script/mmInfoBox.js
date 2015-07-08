/**
 * Created by roi.levy on 12/8/14.
 */
'use strict'
app.directive('mmInfoBox', ['$compile', function($compile){

    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'infra/directives/views/mmInfoBox.html',
        link : function(scope, element, attrs, model){

            if(attrs.numOfInfoLines){
                var height = 27 * attrs.numOfInfoLines;
                if(height > 148){
                    scope.heightText = height + 'px';
                }
            }

            scope.isImageExist = attrs.imageSource ? true : false;
            scope.inforceImageBox = attrs.inforceImageBox || false;

            scope.$watch(attrs.mmImageSrc, function(newValue){
                   scope.imageSource = newValue;

            });
        }
    }
}]);