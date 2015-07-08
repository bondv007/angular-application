/**
 * Created by Axel.Martínez on 9/12/14.
 */

app.controller( 'treeviewCtrl', [ '$scope', 'segmentsFactory',
    function($scope, segmentsFactory) {

        // a message will be displayed in case there is no target audience selected
        $scope.$watch(function(){
            // console.log(segmentsFactory.getSelectedAudienceSegmentId());
            $scope.selectTaMessage = segmentsFactory.getSelectedAudienceSegmentId() === '';
        });

    }
]);

/**
 * Filter to show only the ads that match a specific size in the delivery group.
 * @return {[array]} The ads that meet the desired size.
 */
app.filter('adSizes', function() {
    return function(ads, filterToSize) {

        if(!ads) {
            return [];
        }

        /*
            Holds the ads that meet the desired size.
         */
        var filtered = [];

        /*
            Adding the matching ads to the array to be returned.
         */
        ads.forEach(function(currentAd){
            if (currentAd.AdSize === filterToSize || filterToSize  === "") {
                filtered.push(currentAd);
            }
        });
        return filtered;
    };
});

/**
 * Filter to show only the ads that match a specific status in the delivery group.
 * @return {[array]} The ads that meet the desired status.
 */
app.filter('adStatuses', function() {
    return function(ads, filterToStatus) {

        if(!ads) {
            return [];
        }

        /*
            Holds the ads that meet the desired status.
         */
        var filtered = [];

        /*
            Adding the matching ads to the array to be returned.
         */
        ads.forEach(function(currentAd){
            if (currentAd.status.toLowerCase() === filterToStatus.toLowerCase() || filterToStatus  === "") {
                filtered.push(currentAd);
            }
        });
        return filtered;
    };
});

/**
 * This filter will take a value in Bytes
 * and converted to a string representation of
 * KiloBytes adding the "KB" suffix
 * @return {byteValue} The value to convert to KBs
 */
app.filter('convertToKB', function() {
    return function(byteValue) {
        if ( byteValue === '' )
            return "";

        var out = '';

        out = Math.floor((byteValue/1024)) + 'KB';

        return out;
    };
});


//works if there is only one group to be filtered in the array
app.filter('deliveryGroupsByTargetAudience', function() {
    return function(groups, filterToGroup) {
        /*
            Holds the groups that meet the desired id.
         */
        var filtered = [];

        /*
            Adding the matching groups to the array to be returned.
         */
        angular.forEach(groups, function(currentGroup){
            if (filterToGroup.indexOfObjectByKey('DeliveryGroupID', currentGroup.DeliveryGroupID) > -1) {
                filtered.push(currentGroup);
            }
        });

        return filtered;
    };
});
