/**
 * Created by Axel.Martínez on 9/2/14.
 */

app.controller( 'geoDataController', ['$scope', 'geoDataService',
    function ($scope, geoDataService){
        //geoDataService.getCountries({}).then(function(countries){
        //    console.log('countries', countries);
        //    $scope.countries = countries;
        // });

        // geoDataService.getStatesByCountry({
        //     RequestID: '7875717c-0d7c-4352-942b-ce4d46a28d7c',
        //     GeoItemId: 840
        // }).$promise.then(function(states){
        //     $scope.statesByCountry = states;
        // });

        // geoDataService.getCitiesByState({
        //     RequestID: '7875717c-0d7c-4352-942b-ce4d46a28d7c',
        //     GeoItemId: 44
        //     GeoItemId: 44
        // }).$promise.then(function(cities) {
        //     $scope.citiesByState = cities;
        // });

   }
]);