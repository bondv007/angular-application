/**
 * Created by Ofir.Fridman on 10/25/14.
 */
app.constant('dgConstants', {
    maxTreeDepth: 1,
    maxTreeDepth_MM2: 1,
    strDeliveryGroup: "DeliveryGroup",
    strRootContainer: "RootContainer",
    strAdContainer: "AdContainer",
    strDeliveryGroupAd: "DeliveryGroupAd",
    strFromDefault: "default",
    strFrom: "from",
    strFromRotation: "rotation",
    strFromCentral: "central",
    strMasterAd_Rest_API_Filter: "MasterAd",
    strSubGroup: "Sub Group",
    strAPIServingSetting: "APIServingSetting",
    strEvenDistribution: "EvenDistribution",
    strWeighted: "Weighted",
    strTimeBased: "TimeBased",
    strScheduledSwap: "ScheduledSwap",
    strMasterAdId: "masterAdId",
    strDgNameConvention:"_DG_",
    disableEnableButtonOptions: {
        disableEnable: "Disable/Enable",
        enable: "Enable",
        disable: "Disable"
    },
    disableEnableButtonAction: {remove: "remove"},
    assignAdsAction: "assignAdsAction",
    dgTreeBroadcastAction: {
        preview: "dgTree_Preview",
        newSubGroup: "dgTree_New_SubGroup",
        disableEnable: "dgTree_DisableEnable",
        disableEnableResolve: "disableEnableResolve",
        remove: "dgTree_Remove"
    },
    dgBroadcastAction: {
        dgSelected: "dgSelected",
        openDg:"openDg",
        assignAdsToDgs:"assignAdsToDgs",
        replaceAdsInDgs:"replaceAdsInDgs"
    },
    dgsBroadcastAction: {
        targetAudienceSelected: "targetAudienceSelected",
        dgsDirectiveLoaded:"dgsDirectiveLoaded"
    },
    typeForMM2: {
        deliveryGroupAd: "DeliveryGroupAd:#MediaMind.InternalAPI.DataContract.CSB.DeliveryGroup",
        adContainer: "DeliveryGroupAdContainer:#MediaMind.InternalAPI.DataContract.CSB.DeliveryGroup"
    },
    mm2RotationSettingType: {
        EvenDistribution: 'EvenDistributionRotationSettings:#MediaMind.InternalAPI.DataContract.CSB.DeliveryGroup',
        Weighted: 'WeightedRotationSettings:#MediaMind.InternalAPI.DataContract.CSB.DeliveryGroup',
        TimeBased: 'TimeBasedRotationSettings:#MediaMind.InternalAPI.DataContract.CSB.DeliveryGroup'
    },
    supportedRotation:{
        "EvenDistribution":"EvenDistribution",
        "Weighted":"Weighted"
    }
});
