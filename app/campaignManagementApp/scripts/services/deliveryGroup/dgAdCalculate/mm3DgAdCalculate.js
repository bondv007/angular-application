'use strict';

app.service('mm3DgAdCalculate', ['dgAdCalculate' , function (dgAdCalculate) {
    var extendedDgAdCalculate = Object.create(dgAdCalculate);

    return {
        extendedDgAdCalculate: extendedDgAdCalculate
    };
}]);

