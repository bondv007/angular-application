'use strict';

app.service('tagGenerationService', ['mmModal', function (mmModal) {

  function generateTags(scope, placements) {
    var title = "Publish Placement Tag | ";
    if (placements.length == 1) {
      title += placements[0].name;
    }
    else {
      title += 'Multiple Placements';
    }
    var modalInstance = mmModal.open({
      templateUrl: '/campaignManagementApp/views/tagGenerationSettings.html',
      controller: 'tagGenerationSettingsCtrl',
      title: title,
      modalWidth: 800,
      confirmButton: {name: "Generate Tag", funcName: "generateTag", hide: false, isPrimary: true},
      discardButton: {name: "Close", funcName: "cancel"},
      additionalLinks: [
        {name: "Copy to clipboard", funcName: "", additionalAttribute: "clip-copy=\"copyToClipboard()\""},
        {name: "Export text file", funcName: "exportToTextFile"}
      ],
      resolve: {
        tagGenerationPlacements: function () {
          return placements;
        }
      }
    });

    modalInstance.result.then(function () {
      scope.centralDataObject[0].refreshCentral();
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  }

  return {
    generateTags: generateTags
  };
}]);
