/**
 * Created by yoav.karpeles on 24/3/2014.
 */
app.controller('brandEditCtrl1', ['$scope', '$rootScope', 'mmMessages', 'EC2Restangular', 'configuration', 'enums',
  function ($scope, $rootScope, mmMessages, EC2Restangular, conf, enums) {
  $scope.error = {name: ""};
  $scope.pageReady = false;
  $scope.debug = false;//conf.debug;
  $scope.verticalOptions = enums.verticals;
  $scope.$watch('$parent.mainEntity', updateState); // Check if new or edit mode in the callback
  $scope.$watch('brandId', updateState);
  $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []}
  $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: save, ref: null, nodes: []}

  $rootScope.mmIsPageDirty = 0;

  $scope.dirty = {
    general: 0
  };

  var serverAdvertiser = EC2Restangular.all('advertisers');
  serverAdvertiser.getList().then(getAdvertiser, processError);

  function getAdvertiser(data) {
    $scope.advertisers = data;
    $scope.pageReady = $scope.brandModel != null && $scope.advertisers != null;
  }

  function processError(error) {
    console.log('ohh no!');
    console.log(error);
    if (error.data.error === undefined) {
      mmMessages.addError("Message", "Server error. Please try again later.", false);
    } else {
      mmMessages.addError("Message", error.data.error, false);
    }
  }

  function save(){
    console.log('save called');
    $scope.brandEdit.put().then(updateData, processError);
  }

  // we can't use the result from the put (server bug) we get the main entity again
  function updateData(data) {
    $scope.$parent.mainEntity.get().then(refreshMainEntity, processError);
  }

  function refreshMainEntity(data) {
    $scope.$parent.mainEntity = data;
  }

  function updateState() {
    if ($scope.$parent.mainEntity != null) {
      if ($scope.$parent.mainEntity._name !== undefined) {
        $scope.$parent.mainEntity.name = $scope.$parent.mainEntity._name;
        delete $scope.$parent.mainEntity._name;
      }
      $scope.brand = $scope.$parent.mainEntity;
      $scope.brandEdit = EC2Restangular.copy($scope.$parent.mainEntity);
      if($scope.brandId === undefined){
        $scope.brandId = $scope.brandEdit.id;
      }
      $scope.brandRoot = $scope.brandId == $scope.brand.id || $scope.brandId == null;
      if ($scope.brandRoot) {
        $scope.brandModel = $scope.brandEdit;
        if($scope.brandModel.vertical != null){
          $scope.selection = $scope.brandModel.vertical;
        }
      } else {
        if ($scope.brandEdit != null) {
          $scope.brandModel = $scope.brandEdit.brandAdvertiserAccounts.getByProperty('id', $scope.brandId);
          $scope.$parent.mainEntity._name = $scope.$parent.mainEntity.name;
          $scope.$parent.mainEntity.name = $scope.brandModel.name;
        } else {
          $scope.brandModel = null;
        }
      }
    } else {
      $scope.brand = null;
      $scope.brandModel = null;
    }
    $scope.pageReady = $scope.brandModel != null && $scope.advertisers != null;
  }
}]);


