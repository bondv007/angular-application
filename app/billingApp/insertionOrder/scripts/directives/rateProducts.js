/**
 * Created by shuki.levy on 12/7/2014.
 */
app.directive('rateProducts', [function () {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                width: '=',
                columns: '=',
                items: '='
            },
             replace : true,
             templateUrl: 'billingApp/insertionOrder/views/rateProducts.html'
        }
    }]
);
