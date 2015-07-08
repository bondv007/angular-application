/**
 * Created by rotem.perets on 3/8/2015.
 */
'use strict';

app.controller('geoAdvancedSearchCtrl', ['$scope', 'geo', '$modalInstance', 'csb', '$filter',
  function (scope, geo, $modalInstance, csb, $filter) {
    scope.filter = {text: ''}
    scope.csb = csb;
    scope.tabHandler = {
      country: true,
      region: false,
      city: false,
      nielsen: false,
      areaCode: false,
      postalCode: false,
      isp: false
    };
    scope.geoObj = {selectedGeoType: 'country', selectedCountry: '', selectedState: '', selectedPostalCodes: ''};
    scope.geoDataSource = {
      country: {dataSource: [] },
      region: {dataSource: [], geoFilter: 'states' },
      city: {dataSource: [], geoFilter: 'cities', geoRestPath: 'cities' },
      nielsen: {dataSource: [], geoFilter: 'dma', geoRestPath: 'dmas' },
      areaCode: {dataSource: [], geoFilter: 'areaCode', geoRestPath: 'areaCodes' },
      postalCode: {dataSource: [], geoFilter: 'postalCode', geoRestPath: 'postalCodes' },
      isp: {dataSource: [], geoFilter: 'isp', geoRestPath: 'isps' }
    }
    scope.geoSelectedValues = {
      country: [],
      region: [],
      city: [],
      nielsen: [],
      areaCode: [],
      postalCode: [],
      isp: []
    }

    scope.setSelectedGeo = function(type){
      scope.geoObj.selectedCountry = '';
      scope.geoObj.selectedState = '';
      scope.geoObj.selectedPostalCodes = '';
      scope.geoObj.selectedGeoType = type;
      scope.getCountriesByGeoType();
    }
    scope.getCountriesByGeoType = function () {
      if (scope.geoObj.selectedGeoType == 'country') {
        scope.geoDataSource.country.dataSource = scope.originalCountries;
        scope.geoDataSource.country.originalDataSource = scope.originalCountries;
      } else {
        var filterObj = { type: scope.geoDataSource[scope.geoObj.selectedGeoType].geoFilter };
        geo.getGeo('countries', filterObj).then(function (entities) {
          if(csb.config.env == 'mdx2'){
            entities = convertToMdx3(entities);
          }
          scope.geoDataSource.country.dataSource = entities;
          scope.geoDataSource.country.originalDataSource = entities;
        });
      }
    }
    scope.pickStateByCountry = function () {
      switch (scope.geoObj.selectedGeoType) {
        case 'region':
        case 'city':
        case 'nielsen':
        case 'areaCode':
          var filterObj = { countryId: scope.geoObj.selectedCountry };
          if (scope.geoObj.selectedGeoType != 'region') {
            filterObj.type = scope.geoDataSource[scope.geoObj.selectedGeoType].geoFilter;
          }

          geo.getGeo('states', filterObj).then(function (states) {
            if(csb.config.env == 'mdx2'){
              states = convertToMdx3(states);
            }
            scope.geoDataSource.region.dataSource = states;
            scope.geoDataSource.region.originalDataSource = states;
          });
          break;
        case 'isp':
        case 'postalCode':
          scope.pickEntitySelectedGeo(true);
          break;
      }
    }
    scope.pickEntitySelectedGeo = function (useCountryFilter) {
      var filter = {};
      if (useCountryFilter) {
        filter['countryId'] = scope.geoObj.selectedCountry;
      } else {
        filter['stateId'] = scope.geoObj.selectedState;
      }

      geo.getGeo(scope.geoDataSource[scope.geoObj.selectedGeoType].geoRestPath, filter).then(function (entities) {
        if(csb.config.env == 'mdx2'){
          entities = convertToMdx3(entities);
        }
        if(scope.geoObj.selectedGeoType == 'nielsen' || scope.geoObj.selectedGeoType == 'areaCode'){
          entities.forEach(function(entity){
            entity.countryId = scope.geoObj.selectedCountry;
            entity.regionId = scope.geoObj.selectedState;
          });
        }
        scope.geoDataSource[scope.geoObj.selectedGeoType].dataSource = entities;
        scope.geoDataSource[scope.geoObj.selectedGeoType].originalDataSource = entities;
      });
    }
    scope.addSelectedGeos = function(){
      if(scope.geoObj.selectedPostalCodes != '') {
        var postalCodes = scope.geoObj.selectedPostalCodes.replace(/\s/g, '').split(',');
        postalCodes.forEach(function (item) {
          var postalCodeObj = {
            id: scope.geoObj.selectedCountry,
            title: item,
            name: item,
            type: 'postalCode',
            typeName: 'postalCode'
          }
          scope.geoSelectedValues[postalCodeObj.type].push(postalCodeObj);
        });
      }
      $modalInstance.close(scope.geoSelectedValues);
    }
    scope.close = function(){
      $modalInstance.dismiss();
    }

    scope.filterSource = function(){
      scope.geoDataSource[scope.geoObj.selectedGeoType].dataSource = $filter('filter')(scope.geoDataSource[scope.geoObj.selectedGeoType].originalDataSource, scope.filter.text);
    }

    geo.getGeo('countries').then(function (entities) {
      if(csb.config.env == 'mdx2'){
        entities = convertToMdx3(entities);
      }
      scope.geoDataSource.country.dataSource = entities;
      scope.geoDataSource.country.originalDataSource = entities;
      scope.originalCountries = entities;
    });

    function convertToMdx3(data){
      data.forEach(function(item){
        item.id = item.geoItemID;
        item.name = item.geoItemName;
        item.title = item.geoItemName;
      });

      return data;
    }
  }
]);

