/**
 * Created by roi.levy on 12/15/14.
 */
app.directive('mmInfoLabel', [function() {
    return {
        restrict: 'E',
        scope: {
            mmClass: "@",
            mmCaption: "@",
            mmModel: "=",
            mmLabelWidth: "@",
            //mmDescriptionWidth: "@",
            mmAdditionalText: "@"
        },
        template: '<div class="mm-info-label-container"><span class="mm-info-box-label mmClass" style="display:inline-block;" ng-style="{width : mmLabelWidth}">{{mmCaption | T}}</span><span class="mm-info-box-text" ng-style="{width : mmTextWidth}">{{mmModel}} {{mmAdditionalText | T}}</span></div>',
        controller: ['$scope',
            function ($scope) {
                $scope.mmLabelWidth = $scope.mmLabelWidth || 100;
                //if($scope.mmDescriptionWidth){
                    $scope.mmTextWidth = 270 - $scope.mmLabelWidth - 43;//24;
                    $scope.mmTextWidth += 'px';
                //}
                $scope.mmLabelWidth += 'px';
            }]
    }
}]
);