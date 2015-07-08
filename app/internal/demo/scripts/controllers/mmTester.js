/**
 * Created by rotem.perets on 5/4/14.
 */
app.controller('mmTesterCtrl', ['$scope', '$rootScope', 'EC2Restangular', 'enums', '$document', '$timeout', '$filter',
  function ($scope, $rootScope, EC2Restangular, enums, $document, $timeout, $filter) {
    $scope.error = {name: ""}
    $scope.entityObj = {}
    $scope.entityLayoutInfraButtons.discardButton = {name: 'discard', func: updateState, ref: null, nodes: []};
    $scope.entityLayoutInfraButtons.saveButton = {name: 'save', func: updateState, ref: null, nodes: []};
    $scope.verticals = enums.verticals;

    $rootScope.mmIsPageDirty = 0;

    $scope.dirtyFlags = {
      tab1: 0,
      tab2: 0
    }

    $scope.textRequired = true;

    $scope.impressionsPerUserDD = [];
    for (var i = 0; i < 2; i++) {
      $scope.impressionsPerUserDD.push({id: i, name: i});
    }

    $scope.$watch('demoModel.name', function () {
      $timeout(function () {
        $scope.clicked();
      }, 50);

    });

    $scope.val = 3;
    $scope.clicked = function () {
      console.log($scope.demoModel.name);
    };

    function save() {
      console.log('save called');
    }

    $scope.demoModel =
    {
      assets: [],
      name: "mitzi",
      description: null,
      link: "linnkkkkk",
      displayName: "Some name",
      url: "http://google.com",
      optionSingle: 6,
      optionSingle2: 9,
      optionMulti: [6, 9],
      optionMulti2: [20, 89, 6],
      noOption: null,
      accountId: null,
      accountIds: [],
      account: null,
      vertical: [],
      newVerticals: []
    };
    $scope.demoModel.listOfOptions = [
      {id: 0, name: 'onegfdsgdfgfdgdfgdfgdfgfdgdfhdsfhdshfsdfhdsfhsdfhdfhsdfhsdfhsdfhsdfh', attribute: 'q'},
      {id: 6, name: 'onegfdsgdfgfdgdfgdfgdfgfdgdfhdsfhdshfsdfhdsfhsdfhdfhsdfhsdfhsdfhsdfh', attribute: 'w'},
      {id: 9, name: 'onegfdsgdfgfdgdfgdfgdfgfdgdfhdsfhdshfsdfhdsfhsdfhdfhsdfhsdfhsdfhsdfh', attribute: 'e'},
      {id: 20, name: 'onegfdsgdfgfdgdfgdfgdfgfdgdfhdsfhdshfsdfhdsfhsdfhdfhsdfhsdfhsdfhsdfh', attribute: 'r'},
      {id: 89, name: 'onegfdsgdfgfdgdfgdfgdfgfdgdfhdsfhdshfsdfhdsfhsdfhdfhsdfhsdfhsdfhsdfh', attribute: 't'}
    ];

    $scope.getEvidenceInfos = function (event) {
      console.log(event);
    }

    $scope.demoModel.listOfOptions2 = [
      {id: 0, name: 'Item 1', attribute: 'q'},
      {id: 6, name: 'Item 2', attribute: 'w'},
      {id: 9, name: 'Item 3', attribute: 'e'},
      {id: 20, name: 'Item 4', attribute: 'r'},
      {id: 89, name: 'Item 5', attribute: 't'},
      {id: 16, name: 'Item 6', attribute: 'w'},
      {id: 19, name: 'Item 7', attribute: 'e'},
      {id: 120, name: 'Item 8', attribute: 'r'},
      {id: 189, name: 'Item 9', attribute: 't'},
      {id: 205, name: 'onegfdsgdfgfdgdfgdfgdfgfdgdfhdsfhdshfsdfhdsfhsdfhdfhsdfhsdfhsdfhsdfh', attribute: 'z'}
    ];

    $scope.selection = 9;
    $scope.selection2 = {Obj: $scope.demoModel.listOfOptions[2]};
    $scope.selection3 = [$scope.demoModel.listOfOptions[2]];
    $scope.selection4 = [0, 6, 9];
    $scope.selection10 = 9;
    $scope.selection11 = [0, 6, 9];
    $scope.selection12 = $scope.demoModel.optionId;
    $scope.selection13 = [0, 9];
    $scope.show = false;
    $scope.disable = true;
    $scope.showToggle = true;

    $scope.advertiser = $scope.demoModel;
    $scope.someText = "My Text";

    $scope.url = {val: "http://google.com"}

    function updateState() {

      console.log($scope.demoModel);
    }

    EC2Restangular.all('accounts').all('global').getList().then(function (data) {
      $scope.accounts = data;
      $scope.accountsOrig = data;
      $scope.accountIndex = {};
      indexAccounts();
    }, processError);

    $scope.filterDataModel = function(){
      $scope.accounts = $filter('filter')($scope.accountsOrig, $scope.demoModel.accountId);
    }

    function indexAccounts(){
      console.log('indexing accounts');
        $scope.accounts.forEach(function (account) {
        $scope.accountIndex[account.id] = account.name;
      });
    }
    function processError(error) {
      console.log('ohh no!');
      console.log(error);
    }

    $scope.$watch('demoModel.vertical', function (newVal, oldVal) {
//      if(newVal.originalObject){
//        $scope.demoModel.newVerticals.push(newVal.originalObject.id);
//      }

      if (newVal.length > 0) {
        $scope.demoModel.newVerticals.push(newVal);
        $scope.demoModel.vertical = null;
      }
    });

    EC2Restangular.all('accounts').all('global').getList().then(function (data) {
      $scope.mmModel.columns[0].listDataArray = data;
    }, processError);

    $scope.mmModel = {};
    $scope.mmModel.accounts = []
    $scope.mmModel.selectedAccounts = []
    $scope.mmModel.columns = [
      {
        field: 'name',
        displayName: 'Name',
        isRequired: true,
        gridControlType: enums.gridControlType.getName("Label"),
        functionOnCellEdit: onCellChanged
      }
    ];
    $scope.mmModel.numberFilteredItems = {}
    $scope.mmModel.contactsGridButtonActions = [
      {
        name: "Delete",
        func: deleteContacts,
        isDisable: false
      }
    ];

    function deleteContacts() {
      var newArray = $scope.mmModel.accounts
        .filter(function (el) {
          return el.id !== $scope.mmModel.selectedAccounts[0].id;
        });

      $scope.mmModel.accounts.length = 0;
      $scope.mmModel.accounts = newArray;
    }

    function onCellChanged(col, valueId, colIndex, fieldName, row, selectedItem) {
      row.entity.contactId = selectedItem.id;
      row.entity.contactName = selectedItem.name;
      return valueId;
    }

    $scope.addAccount = function () {
      if(!$scope.accountIndex[$scope.demoModel.accountIds]) indexAccounts();
      $scope.mmModel.accounts[$scope.mmModel.accounts.length] = {id: $scope.demoModel.accountIds, name: $scope.accountIndex[$scope.demoModel.accountIds]};
      $scope.demoModel.accountIds = [];
    }


      $scope.generateGeoTitle = function(data){
          if(data.type == 'country'){
              return data.name
          } else if (data.type == 'region'){
              return data.name + ", " + data.countryName;
          } else {
              return data.name + ", " + data.regionName+ ", " + data.countryName;
          }
      }
  }]);
