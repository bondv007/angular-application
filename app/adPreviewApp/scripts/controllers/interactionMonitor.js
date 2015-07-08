'use strict';
app.controller('interactionCtrl', ['$scope', '$stateParams', '$state', 'monitorService', 'enums', '$filter', function ($scope, $stateParams, $state, monitorService, enums, $filter) {
  $scope.adId = 0;
  $scope.assetId = 0;
  var key = null;
  if ($stateParams.isAdPreview) {
    $scope.adId = $stateParams.id;
    key = "ad-events" + $scope.adId;
  }
  else {
    $scope.assetId = $stateParams.id;
    key = "asset-events" + $scope.assetId;
  }
  $scope.data = [];
  $scope.searchFilters = [
    {name: "All", isSelected: true},
    {name: "InteractionName", isSelected: false},
    {name: "AdPart", isSelected: false},
    {name: "Parameters", isSelected: false}
  ];

  $scope.searchCriteria = {searchText: ''};

  $scope.selectedFilter = "All";

  $scope.isMultipleFilter = false;

  $scope.filteredData = [];

  $scope.multipleFilter = [
    {isSelected: false, name: "Custom", id: 1, attribute: "q"},
    {isSelected: false, name: "Video", id: 2, attribute: "w"},
    {isSelected: false, name: "System", id:3, attribute: "e"}
  ];

  $scope.multipleFilterOpt = [];

  var getFilteredProperty = function () {
    switch ($scope.selectedFilter) {
      case "All":
        return "undefined";
      case "InteractionName":
        return "action";
      case "AdPart":
        return "part";
      case "Parameters":
        return "args";
    }
  };

  /*$scope.$watch("multipleFilterOpt", function (newVal, oldVal) {
    console.log("right filters",  $scope.multipleFilter,$scope.multipleFilterOpt );
    if ( $scope.multipleFilterOpt.length > 0 ) {
      for(var i = 0; i < $scope.multipleFilter.length; i++ ) {
        $scope.multipleFilter[i].isSelected = false;
        for ( var j = 0; j < $scope.multipleFilterOpt.length; j++ ) {
          if ( $scope.multipleFilter[i].id == $scope.multipleFilterOpt[j] ) {
            $scope.multipleFilter[i].isSelected = true;
          }
        }
      }
      applyFilters();
    }
  }, true);*/

  function applyFilters() {
//		var data = $filter("customSearch")($scope.data, getFilteredProperty(), $scope.searchCriteria.searchText);
    $scope.filteredData = $scope.data;
    var predicate = {};
    var prop = getFilteredProperty();
    predicate[prop] = $scope.searchCriteria.searchText;
    /*var arr = [];
    var isMultiple = _.some($scope.multipleFilter, function (m) {
      return m.isSelected;
    });
    angular.forEach($scope.multipleFilter, function (obj, key) {
      if (obj.isSelected == true) {
        arr.push(obj['name']);
      }
    });
    if (isMultiple)
      predicate['part'] = arr;*/
    var data = $filter("genericSearchFilter")($scope.data, predicate, false);
    $scope.filteredData = angular.copy(data);
  };
  $scope.$on("syncMonitorData", function () {
    syncData();
  });

  $scope.setSearchFilter = function (filter) {
    clearAllActions(filter);
    filter.isSelected = !filter.isSelected;
    $scope.selectedFilter = filter.name;
    applyFilters();
  };

  $scope.setFilterType = function (type) {
    $scope.isMultipleFilter = type.toLowerCase() == "multiple";
//		applyFilters();
  };

  $scope.$watch("searchCriteria.searchText", function (newVal, oldVal) {
    applyFilters();
  }, true);

  function clearAllActions(filter) {
    var actions = [];
    var isNull = _.isNull(filter);
    if (!isNull) {
      actions = _.where($scope.searchFilters, function (act) {
        return act.name != filter.name;
      })
    }
    else {
      actions = $scope.searchFilters;
    }
    for( var k = 0; k < actions.length; k++ ) {
      actions[k].isSelected = false;
    }

    if (isNull) {
      var act = _.find(actions, function (ac) {
        return ac.name.toLowerCase() == "all";
      });
      if (act) {
        act.isSelected = true;
      }
    }
  };

  $scope.columnDefs = [
    {field: 'action', displayName: 'Name'},
    {field: 'command', displayName: 'Command'},
    {field: 'part', displayName: 'Ad Part'},
    {field: 'args', displayName: 'Parameters'},
    {field: 'adName', displayName: 'Ad Name'},
    {field: 'time', displayName: 'Time'}
  ];

  function syncData() {
    var sharedData = monitorService.getData(key);
    if (typeof sharedData == "undefined")return false;
    $scope.data = [];
    for( var k = 0; k < sharedData.length; k++ ) {
      sharedData[k].uniqueId = _.uniqueId();
      $scope.data.push(sharedData[k]);
    }

    if (!$scope.$$phase)
      $scope.$apply();
    $scope.filteredData = angular.copy($scope.data);
  };

  $scope.clearInteractions = function () {
    $scope.filteredData = [];
    monitorService.deleteByKey(key);
  };

  //try to sync data on opening of new window.
  syncData();

}]);