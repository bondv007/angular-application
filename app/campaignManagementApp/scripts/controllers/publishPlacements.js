/**
 * Created by reut.sar-Israel on 1/7/2015.
 */

'use strict';

app.controller('publishPlacementsCtrl', ['$scope', 'tagGenerationService', '$filter', 'infraEnums',
  function($scope, tagGenerationService, $filter, infraEnums){

    var centralPublishPlacementsActions = [
      { name: 'Publish', func: openTagSettings,relationType: infraEnums.buttonRelationToRowType.any}
    ];

    $scope.centralDataObject = [
      { type: 'placement', centralActions: centralPublishPlacementsActions, hideAddButton: true, isEditable: false }
    ];

    function openTagSettings() {
      tagGenerationService.generateTags($scope, $filter('filter')($scope.centralDataObject[0].centralList, {isSelected: true}));
    }
  }]);


