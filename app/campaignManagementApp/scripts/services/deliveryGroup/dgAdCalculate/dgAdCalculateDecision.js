/**
 * Created by Ofir.Fridman on 12/2/14.
 */
'use strict';

app.service('dgAdCalculateDecision', ['dgAdCalculate', 'mm2DgAdCalculate', '$rootScope', function (dgAdCalculate, mm2DgAdCalculate, $rootScope) {

    function isMMNext (){
        return $rootScope.isMMNext == undefined;
    }
    function calculate(container, actionType, arrLengthBeforeChange) {
        if (isMMNext()) {
            dgAdCalculate.calculate(container, actionType, arrLengthBeforeChange);
        } else {
            mm2DgAdCalculate.calculate(container, actionType, arrLengthBeforeChange);
        }
    }

    function actionOptions() {
        if (isMMNext()) {
            return dgAdCalculate.actionOptions;
        } else {
            return mm2DgAdCalculate.actionOptions;
        }
    }

    function setSonsRotationOptions(container, parentRotationType) {
        if (isMMNext()) {
            return dgAdCalculate.setSonsRotationOptions(container, parentRotationType);
        } else {
            return mm2DgAdCalculate.setSonsRotationOptions(container, parentRotationType);
        }
    }

    return {
        calculate: calculate,
        actionOptions: actionOptions,
        setSonsRotationOptions: setSonsRotationOptions
    };
}]);