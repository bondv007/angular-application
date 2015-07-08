/**
 * Created by rotem.perets on 5/27/14.
 */
app.controller('campaignsCtrl', ['$scope', 'mmModal', 'EC2Restangular', 'mmAlertService',
  function ($scope, mmModal, EC2Restangular, mmAlertService) {

  var centralCampaignActions = [
    { name: 'Delete', func: null },
    { name: 'Attach', func: attachCreativeAccount }
  ];

  function attachCreativeAccount(all, selected) {
    if (selected.length !== 1) {
      return;
    }
    $scope.openAttachModal(selected[0]);
  };

  $scope.openAttachModal = function(campaign) {
    if ($scope.isModalOpen) {
      return;
    }
    $scope.isModalOpen = true;
    var modalInstance = mmModal.open({
      templateUrl: './admin/views/attachCreativeAccounts2campaign.html',
      controller: 'attachCreativeAccounts2campaign',
      title: campaign.name + ': Attach Creative Accounts',
      confirmButton: { name: "Attach", funcName: "attach", hide: false},
      discardButton: { name: "Cancel", funcName: "cancel" },
      resolve: {
        campaign: function() {
          return campaign;
        },
        accounts: function(){
          return $scope.accounts;
        },
        isCentralMode: function() {
          return true;
        },
        isEditMode: function(){
          return true;
        },
        accountsToAdd: function(){
          return null;
        }
      }
    });

    modalInstance.result.then(function () {
      console.log('save');
      $scope.isModalOpen = false;
    }, function () {
      console.log('cancel');
      $scope.isModalOpen = false;
    });
  };

  $scope.centralDataObject = [
    { type: 'campaign', centralActions: centralCampaignActions, dataManipulator: null, isEditable: true, editButtons: []  }
  ];

  EC2Restangular.all('accounts').getList().then(function(data){
    $scope.accounts = data;
  }, processError);

  function processError(error) {
    console.log('ohh no!');
    console.log(error);
    $scope.showSPinner = false;
    if (error.data.error === undefined) {
      mmAlertService.addError("Message", "Server error. Please try again later.", false);
    } else {
      mmAlertService.addError("Message", error.data.error, false);
    }
  }
}]);