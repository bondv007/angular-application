/**
 * Created by Ofir.Fridman on 12/18/14.
 */
'use strict';

app.service('dgAdCalculate', ['enums', '$filter', 'deliveryGroupJsonObjects', 'dgConstants', 'dgHelper', 'dgAdCalculateHelper', function (enums, $filter, deliveryGroupJsonObjects, dgConstants, dgHelper, dgAdCalculateHelper) {
    var oneHundredPercent = 100;
    var actionOptions = {rotationChange: "rotationChange", add: "add", remove: "remove", adWeightChange: "adWeightChange", onDgLoadDoNothing: "onDgLoadDoNothing", setTotalWeightForAllContainer: "setTotalWeightForAllContainer", disable: "Disable", enable: "Enable"};

    function calculateNewWeighted(subContainer, relative, newAd) {
        var arrLength = subContainer.length;
        for (var i = 0; i < arrLength; i++) {
            var num = parseFloat(subContainer[i].rotationSetting.weight);
            subContainer[i].rotationSetting.weight = (isNaN(num)) ? 0 : dgAdCalculateHelper.formatNum(Math.round(relative * num));
        }
        var sumArr = dgAdCalculateHelper.sumArray(dgAdCalculateHelper.getArrOfWeights(subContainer));
        newAd.rotationSetting.weight = sumArr > 100 ? parseFloat(0) : dgAdCalculateHelper.formatNum(oneHundredPercent - sumArr);
        subContainer.push(newAd);
    }

    function calculateTotalWeighted(subContainer) {
        var arr = dgAdCalculateHelper.getArrOfWeights(subContainer);
        arr = _.compact(arr);
        return  parseFloat(arr.reduce(function (a, b) {
            return parseFloat(a) + parseFloat(b);
        }, 0).toFixed(2));
    }

    function setTotalWeightForAllContainer(subContainer, rootContainer) {
        if (!subContainer) {
            subContainer = rootContainer;
        }

        for (var i = 0; i < subContainer.subContainers.length; i++) {

            if (subContainer.subContainers[i].type == "AdContainer") {
                setTotalWeightForAllContainer(subContainer.subContainers[i], undefined);
            }
        }

        if (subContainer.childRotationType == "Weighted") {
            subContainer.totalWeight = calculateTotalWeighted(subContainer.subContainers);
        }
    }

    function isArrayEmptyNullUndefined(array) {
        return !array || array.length === 0;
    }

    function evenDistribution(container, isSecondGeneration) {
        var isSecondGeneration = isSecondGeneration || false;
        var enabledSubContainers = _.filter(container.subContainers, function (container) {
            return container.rotationSetting.enabled;
        });

        var res = enabledSubContainers.length !== 0 ? dgAdCalculateHelper.formatNum(oneHundredPercent / enabledSubContainers.length) : 0;
        var subContainers = container.subContainers;
        for (var i = 0; i < subContainers.length; i++) {
            if (subContainers[i].type === dgConstants.strAdContainer) {
                subContainers[i].rotations = _.filter(enums.rotationSettingType, function (item) {
                    return item.id !== dgConstants.strTimeBased;
                });
                evenDistribution(subContainers[i], true);
            }

            if (!subContainers[i].rotationSetting.enabled) {
                subContainers[i].rotationSetting.weight = 0;
            }
            else if (!isSecondGeneration || (isSecondGeneration && subContainers[i].rotationSetting.type === dgConstants.strTimeBased)) {
                subContainers[i].rotationSetting.weight = res;
            }
        }
        if (enabledSubContainers.length > 0) {
            setLastAdWeight(enabledSubContainers);
        }
        return container;
    }

    function calculateTimeBaseAfterAdd(container) {
        var subContainers = container.subContainers;
        for (var i = 0; i < subContainers.length; i++) {
            if (subContainers[i].rotationSetting.type !== dgConstants.strTimeBased || !subContainers[i].rotationSetting.startDate) {
                subContainers[i].rotationSetting = deliveryGroupJsonObjects.getRotationSetting(dgConstants.strTimeBased);
                subContainers[i].rotationSetting.type = dgConstants.strTimeBased;
                subContainers[i].rotationSetting.rotationType = dgConstants.rotationType;
            }
        }
    }

    function calculateTimeBaseAfterRotationChange(container) {
        container.rotations = enums.rotationSettingType;
        var subContainers = container.subContainers;
        for (var i = 0; i < subContainers.length; i++) {
            if (subContainers[i].type === dgConstants.strAdContainer) {
                subContainers[i].rotations = enums.rotationSettingType;
            }
            subContainers[i].rotationSetting.weight = deliveryGroupJsonObjects.getRotationSetting(dgConstants.strTimeBased).weight;
        }
    }

    function timeBased(container, actionType) {
        switch (actionType) {
            case actionOptions.rotationChange:
                calculateTimeBaseAfterRotationChange(container);
                break;
            case actionOptions.add:
                calculateTimeBaseAfterAdd(container);
                break;
            default:
                break;
        }
        return container;
    }

    function setLastAdWeight(subContainers) {
        var ad = subContainers.pop();
        var sumArr = dgAdCalculateHelper.sumArray(dgAdCalculateHelper.getArrOfWeights(subContainers));
        ad.rotationSetting.weight = dgAdCalculateHelper.formatNum(oneHundredPercent - sumArr);
        subContainers.push(ad);
    }

    function updateSubContainersRotationType(actionType, container) {
        if (actionType == 'rotationChange') {
            var stop = container.subContainers.length;
            for (var i = 0; i < stop; i++) {
                if (container.subContainers[i].type === dgConstants.strAdContainer && container.subContainers[i].childRotationType === dgConstants.strTimeBased
                    && container.childRotationType !== dgConstants.strTimeBased) {
                    container.subContainers[i].childRotationType = dgConstants.strEvenDistribution;
                    updateSubContainersRotationType(actionType, container.subContainers[i]);
                }
                container.subContainers[i].rotationSetting.type = container.childRotationType;
                container.subContainers[i].rotationSetting.rotationType = container.childRotationType;
            }
        }
    }

    function weightedForNewAds(container) {
        var subContainer = _.filter(container.subContainers, function (container) {
            return container.rotationSetting.enabled
        });
        var newArrLength = subContainer.length;
        var oldArr = [];
        var newItemsArr = [];
        for (var i = 0; i < newArrLength; i++) {
            if (subContainer[i].rotationSetting.weight === undefined) {
                newItemsArr.push(subContainer[i])
            } else {
                oldArr.push(subContainer[i])
            }
        }
        var oldArrLength = oldArr.length;
        var totalNew = newArrLength - oldArrLength;
        var relative = oldArrLength / newArrLength;

        // calc weight for old items
        for (var i = 0; i < oldArrLength; i++) {
            var num = parseFloat(oldArr[i].rotationSetting.weight);
            oldArr[i].rotationSetting.weight = (isNaN(num)) ? 0 : dgAdCalculateHelper.formatNum(num * relative);
        }

        var sum = calculateTotalWeighted(oldArr);
        var isWeightedExceedOneHundredPercent = sum >= oneHundredPercent;

        // calc weight for new item
        var res = (isWeightedExceedOneHundredPercent) ? 0 : dgAdCalculateHelper.formatNum((oneHundredPercent - sum) / totalNew);
        for (var i = 0; i < totalNew; i++) {
            newItemsArr[i].rotationSetting.weight = res;
        }

        // calc weight for the last item that way not exceed total weight of 100%
        if (!isWeightedExceedOneHundredPercent) {
            var newAd = subContainer.pop();
            var sumArr = dgAdCalculateHelper.sumArray(dgAdCalculateHelper.getArrOfWeights(subContainer));
            newAd.rotationSetting.weight = sumArr > 100 ? parseFloat(0) : dgAdCalculateHelper.formatNum(oneHundredPercent - sumArr);
            subContainer.push(newAd);
        }
    }

    function weightedForEnableAds(container) {
        var subContainer = _.filter(container.subContainers, function (container) {
            return container.rotationSetting.enabled
        });
        var newArrLength = subContainer.length;
        var oldArr = [];
        var newItemsArr = [];
        for (var i = 0; i < newArrLength; i++) {
            if (subContainer[i].selected) {
                newItemsArr.push(subContainer[i])
            } else {
                oldArr.push(subContainer[i])
            }
        }

        var oldArrLength = oldArr.length;
        var totalNew = newArrLength - oldArrLength;
        var relative = oldArrLength / newArrLength;

        // calc weight for old items
        for (var i = 0; i < oldArrLength; i++) {
            var num = parseFloat(oldArr[i].rotationSetting.weight);
            oldArr[i].rotationSetting.weight = (isNaN(num)) ? 0 : dgAdCalculateHelper.formatNum(num * relative);
        }

        var sum = calculateTotalWeighted(oldArr);
        var isWeightedExceedOneHundredPercent = sum >= oneHundredPercent;

        // calc weight for new item
        var res = (isWeightedExceedOneHundredPercent) ? 0 : dgAdCalculateHelper.formatNum((oneHundredPercent - sum) / totalNew);
        for (var i = 0; i < totalNew; i++) {
            newItemsArr[i].rotationSetting.weight = res;
        }

        // calc weight for the last item that way not exceed total weight of 100%
        if (!isWeightedExceedOneHundredPercent) {
            var newAd = subContainer.pop();
            var sumArr = dgAdCalculateHelper.sumArray(dgAdCalculateHelper.getArrOfWeights(subContainer));
            newAd.rotationSetting.weight = sumArr > 100 ? parseFloat(0) : dgAdCalculateHelper.formatNum(oneHundredPercent - sumArr);
            subContainer.push(newAd);
        }
    }

    function weightedForRemoveAd(container, arrLengthBeforeChange) {
        var subContainer = _.filter(container.subContainers, function (container) {
            return container.rotationSetting.enabled
        });
        if (!isArrayEmptyNullUndefined(subContainer)) {
            var arrLength = subContainer.length;
            var relative = arrLengthBeforeChange / arrLength;
            var newAd = subContainer.pop();
            calculateNewWeighted(subContainer, relative, newAd);
        }
        return container;
    }

    function weightedForDisableAd(container, enabledAdsCountBeforeChange) {

        if (isArrayEmptyNullUndefined(container.subContainers)) {
            return container;
        }

        var enabledSubContainers = _.filter(container.subContainers, function (container) {
            return container.rotationSetting.enabled
        });
        if (isArrayEmptyNullUndefined(enabledSubContainers)) {
            return container;
        }

        var relative = enabledAdsCountBeforeChange / enabledSubContainers.length;
        var lastEnabledAd = enabledSubContainers.pop();
        calculateNewWeighted(enabledSubContainers, relative, lastEnabledAd);
        return container;
    }

    function calculateWeightedByAction(actionType, container, arrLengthBeforeChange) {
        switch (actionType) {
            case actionOptions.rotationChange:
                evenDistribution(container, false);
                break;
            case actionOptions.add:
                weightedForNewAds(container);
                break;
            case actionOptions.enable:
                weightedForEnableAds(container);
                break;
            case actionOptions.remove:
                weightedForRemoveAd(container, arrLengthBeforeChange);
                break;
            case actionOptions.disable:
                weightedForDisableAd(container, arrLengthBeforeChange);
                break;
            case actionOptions.adWeightChange:
                //do nothing
                break;
            case actionOptions.setTotalWeightForAllContainer:
                setTotalWeightForAllContainer(undefined, container);
                return;
            default:
        }
        container.totalWeight = dgAdCalculateHelper.formatNum(calculateTotalWeighted(container.subContainers));
        return container;
    }

    function setSonsRotationOptions(container, parentRotationType) {
        if (dgHelper.isAdOrRootContainer(container)) {
            container.rotations = enums.rotationSettingType;
            if (parentRotationType && parentRotationType !== dgConstants.strTimeBased) {
                container.rotations = _.filter(container.rotations, function (item) {
                    return item.id !== dgConstants.strTimeBased;
                });
            }
            var subContainers = container.subContainers;
            for (var i = 0; i < subContainers.length; i++) {
                setSonsRotationOptions(subContainers[i], container.childRotationType);
            }
        }
    }

    return {
        calculate: function (container, actionType, arrLengthBeforeChange) {
            if (actionOptions.onDgLoadDoNothing == actionType)
                return;
            if (actionOptions.setTotalWeightForAllContainer == actionType) {
                calculateWeightedByAction(actionType, container, arrLengthBeforeChange);
                return;
            }
            switch (container.childRotationType) {
                case 'EvenDistribution':
                    evenDistribution(container, false);
                    break;
                case 'Weighted':
                    calculateWeightedByAction(actionType, container, arrLengthBeforeChange);
                    break;
                case 'TimeBased':
                    timeBased(container, actionType);
                    break;
                default:
                    evenDistribution(container, false);
            }
            updateSubContainersRotationType(actionType, container);
            calculateWeightedByAction(actionOptions.setTotalWeightForAllContainer, container, undefined);
        },
        actionOptions: actionOptions,
        setSonsRotationOptions: setSonsRotationOptions
    };
}]);

