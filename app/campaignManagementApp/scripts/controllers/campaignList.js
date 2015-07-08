'use strict';

app.controller('campaignListCtrl', ['$scope', '$state', function ($scope, $state) {
    $scope.alerts = [];
    $scope.master = {};

		var centralCampaignsActions = [
			{ name: 'Add', func: addCampaign },
			{ name: 'Delete', func: deleteCampaign },
			{ name: 'Copy', func: copyCampaign },
			{ name: 'Archive', func: archiveCampaign }
		];
		$scope.centralDataObject = [{ type: 'campaign', centralActions: centralCampaignsActions }];

    function addCampaign() {
        changeView('spa.campaign.campaignEdit');
    }

    function changeView(view) {
        $state.go(view);
    }

    function deleteCampaign(list, selectedItems) {
      var f=[];
      for (var i = 0; i < selectedItems.length; i++) {
        f[i] = function(k){
          var camp = selectedItems[i];
          camp.remove().then(function () {
            var index = _.indexOf(list, camp);
            list.splice(index, 1);
          }, function (response) {
            console.log(response);
          });
        }(i);
      }
    }

    function copyCampaign(list, selectedItems) {
        alert('todo copyCampaign');
    }

    function archiveCampaign() {
        alert('todo archive');
    }
}]);


