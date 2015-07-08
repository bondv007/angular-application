'use strict';

app.service('deliveryGroupJsonObjects', ['dgConstants', 'enums', function (dgConstants, enums) {

    function _getDefaultServingSetting() {
        return  {
            type: dgConstants.strAPIServingSetting,
            impressionsPerUser: null,
            impressionsPerDay: null,
            timeBetweenAds: null,
            frequencyCappingLevel: true,
            serveDefaultImage: true
        }
    }

    function _getRootDefaultAdContainer() {
        return {
            type: dgConstants.strRootContainer,
            name: dgConstants.strSubGroup,
            childRotationType: dgConstants.strEvenDistribution,
            from: dgConstants.strFromRotation,
            rotations: enums.rotationSettingType,
            subContainers: []
        };
    }

    function _getDefaultAdContainer(parentRotationType) {
        var root ={};
        root.__type = dgConstants.typeForMM2.adContainer;
        var rootDefaultAdContainer = _getRootDefaultAdContainer();
        for (var k in rootDefaultAdContainer){
            root[k] = rootDefaultAdContainer[k];
        }
        root.type = dgConstants.strAdContainer;
        var _parentRotationType = (parentRotationType) ? parentRotationType : dgConstants.strEvenDistribution;
        root.rotationSetting = {__type:dgConstants.mm2RotationSettingType[_parentRotationType], type: _parentRotationType, enabled: true};
        return root;
    }

    function _getDefaultSubGroupContainer(parentRotationType, sgRotationType) {
        var _parentRotationType = (parentRotationType) ? parentRotationType : dgConstants.strEvenDistribution;
        return {
            __type: dgConstants.typeForMM2.adContainer,
            type: dgConstants.strAdContainer,
            name: dgConstants.strSubGroup,
            childRotationType: _parentRotationType,
            rotationSetting: _getRotationSetting(sgRotationType),
            subContainers: [],
            totalWeight: null,
            selected: false
        };
    }

    function _newDeliveryGroup(campaignId) {
        return {
            type: dgConstants.strDeliveryGroup,
            name: "",
            timeZone: 0,
            targetAudienceId: null,
            targetAudiencePriority: null,
            rootContainer: _getRootDefaultAdContainer(),
            servingSetting: _getDefaultServingSetting(),
            defaultAds: [],
            campaignId: campaignId,
            errors: {errorDgName: {text: ''}, errorMinimumTimeBetweenAds: {text: ''}},
            isSupportedDg: true
        };
    }

    function _getRotationSetting(rotationType) {
        var rotationSetting = {
            "__type": dgConstants.mm2RotationSettingType[rotationType],
            "type": rotationType,
            "rotationType": rotationType,
            "enabled": true
        };
        switch (rotationType) {
            case dgConstants.strEvenDistribution:
            case dgConstants.strWeighted:
                rotationSetting.weight = undefined;
                break;
            case dgConstants.strTimeBased:
                rotationSetting.datesAccordingToPlacements = true;
                rotationSetting.startDate = null;
                rotationSetting.endDate = null;
                break;
        }
        return rotationSetting;
    }

    function _getRotationSettingForDefaultServe() {
        return {
            "__type": dgConstants.mm2RotationSettingType[dgConstants.strEvenDistribution],
            "type": dgConstants.strEvenDistribution,
            "enabled": true
        };
    }

    function _getDgAd(rotationType) {
        return {
            __type: dgConstants.typeForMM2.deliveryGroupAd,
            type: dgConstants.strDeliveryGroupAd,
            masterAdId: null,
            rotationSetting: _getRotationSetting(rotationType)
        };
    }

    return {
        getDefaultServingSetting: _getDefaultServingSetting,
        getDefaultAdContainer: _getDefaultAdContainer,
        newDeliveryGroup: _newDeliveryGroup,
        getDefaultSubGroupContainer: _getDefaultSubGroupContainer,
        getDgAd: _getDgAd,
        getRotationSetting: _getRotationSetting,
        getRotationSettingForDefaultServe: _getRotationSettingForDefaultServe
    };
}]);