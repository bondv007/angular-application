/**
 * Created by shuki.levy on 12/7/2014.
 */
app.directive('tierProducts', [function () {
        return {
            restrict: 'E',
            scope: {
                products: '=',
                gridCols: '=',
                gridItems: '=',
                width: '@',
                partOfIo:'='
            },
            templateUrl: 'billingApp/insertionOrder/views/tierProducts.html'
        }
    }]
);


