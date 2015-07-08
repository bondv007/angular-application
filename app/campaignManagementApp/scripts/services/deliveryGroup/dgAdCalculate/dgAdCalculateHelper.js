/**
 * Created by ofir.fridman on 12/21/14.
 */
'use strict';

app.service('dgAdCalculateHelper', ['$filter', function ($filter) {
    function getArrOfWeights(subContainer) {
        subContainer = _.filter(subContainer, function (container) {
            return container.rotationSetting.enabled;
        });
        return _.pluck(_.pluck(subContainer, 'rotationSetting'), 'weight');
    }

    function formatNum(num, numOfDigitAfterDot) {
        if (numOfDigitAfterDot == undefined || numOfDigitAfterDot == null) {
            numOfDigitAfterDot = 2;
        }
        return num == 0 ? 0 : parseFloat($filter('number')(num, numOfDigitAfterDot));
    }

    function sumArray(array) {
        return array.reduce(function (a, b) {
            return parseFloat(a) + parseFloat(b);
        }, 0);
    }

    return {
        getArrOfWeights: getArrOfWeights,
        formatNum: formatNum,
        sumArray: sumArray
    };
}]);