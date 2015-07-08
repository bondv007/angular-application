/**
 * Created by Ofir.Fridman on 3/15/2015.
 */
'use strict';
app.directive('mvFunnelTa', [
  function () {
    return {
      restrict: 'EA',
      scope: {
        targetAudience:"=?",
        totalOptions:"@"
      },
      templateUrl: 'campaignManagementApp/directives/funnel/mv/views/mvFunnelTa.html',
      controller: ['$scope', 'enums','mvFunnelTaService', function ($scope, enums,mvFunnelTaService) {
        //TODO support drop down with long text
        function onLoad(){
          $scope.mvFlatOrDropDownView = {options: enums.mvFlatOrDropDownView, selected: true};
          $scope.dropDowns = mvFunnelTaService.getListView($scope.targetAudience.id);
          mvFunnelTaService.disableEnableDropDownDecision($scope.dropDowns);
        }
        $scope.clearSelection = function(){
          if(mvFunnelTaService.isListView($scope.mvFlatOrDropDownView)){
            $scope.dropDowns.forEach(function(dropDown){
              dropDown.selected = null;
            });
            mvFunnelTaService.disableEnableDropDownDecision($scope.dropDowns);
          }
          else{
            $scope.flatDropDown.selected = null;
          }

        };
        $scope.onChangeDropDownView = function(){
          if(mvFunnelTaService.isListView($scope.mvFlatOrDropDownView)){
            $scope.dropDowns = mvFunnelTaService.getListView($scope.targetAudience.id);
          }
          else{
            $scope.flatDropDown = mvFunnelTaService.getFlatView($scope.targetAudience.id);
          }
          $scope.clearSelection();
        };
        $scope.onDropDownItemSelect = function(dd){
          mvFunnelTaService.disableEnableDropDownDecision($scope.dropDowns);
        };
        $scope.customLabel = function(dropDownLabel){
          mvFunnelTaService.updateDropDownLabel(dropDownLabel);
        };
        onLoad();
      }]
    }
  }
]);
