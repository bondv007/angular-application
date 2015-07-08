/**
 * Created by Liron.Tagger on 9/28/14.
 */
app.controller('strategiesCtrl', ['$scope', function ($scope) {
  var centralActions = [{ name: 'Delete', func: null, disable: true}];
  $scope.centralDataObject = [
    { type: 'strategy', centralActions: centralActions, dataManipulator: null, isEditable: true, editButtons: [] },
    { type: 'targetAudience', centralActions: centralActions, dataManipulator: targetAudienceManipulator, isEditable: true, editButtons: [] }
  ];

  function targetAudienceManipulator(targetAudienceList) {
    targetAudienceList.forEach(function(targetAudience){
      targetAudience.campaignIds = [];
      if(targetAudience.campaignId){
        targetAudience.campaignIds.push(targetAudience.campaignId);
      }
    });
  }
}]);