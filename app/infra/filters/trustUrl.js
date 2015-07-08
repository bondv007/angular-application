/**
 * Created by matan.werbner on 3/30/15.
 */
app.filter('trustUrl',['$sce',function($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
