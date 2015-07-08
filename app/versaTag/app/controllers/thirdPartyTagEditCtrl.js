/**
 * Created by Rick.Jones on 1/20/15.
 */
app.controller('thirdPartyTagEditCtrl', ['$scope', '$rootScope','$stateParams', 'mmRest', 'entityMetaData', 'mmAlertService', '$state', 'thirdPartyTagService', 'vtAdvertiserService',
    function($scope, $rootScope, $stateParams, mmRest, entityMetaData, mmAlertService, $state, thirdPartyTagService, advertiserService){

        $rootScope.mmIsPageDirty = false;

        $scope.isEditMode = !!$scope.isEntral;
        $scope.labelWidth = 180;
        $scope.validation = {};
        $scope.isRequired = true;
        $scope.pageReady = false;
        $scope.showSPinner = true;
        $scope.preSaveStatus = true;
        $scope.sites = [];
        $scope.firingConditionsLabelWidth = 273;
        $scope.accounts = [];

        $scope.conversionAttributionOptions = [
            {id:'LastEvent', name:'Last Event (Impressions or Clicks)'},
            {id:'ClickOverImpression', name:'Clicks Before Impression'},
            {id:'LastClick', name:'Last Click'}
        ];

        $scope.statusOptions = [
            {id:true, name:'Enabled'},
            {id:false, name:'Disabled'}
        ];

        $scope.deduplicationOptions = [
            {id:'None', name:'None'},
            {id:'SitesAffiliates', name:'Sites/Affiliates'},
            {id:'SearchDisplay', name:'Search/Display'}
        ];
        $scope.fireTagOptions = [
            {id:'WithFireCondition', name:'According to the firing condition below'},
            {id:'WhenConversion', name:'Only when the following conversion tag fires'}
        ];

        $scope.firingConditions = {
            items:[],
            selected:[],
            columns:[
                {field:'id', displayName: 'VersaTag Id'},
                {field:'name', displayName: 'Condition Name'},
                {field:'id', displayName: 'Conditions'},
            ]
        };

        $scope.miniSectionTitle = "Conversion Attribution Settings";
        $scope.start = {open:false};

        $scope.tagCode = "";


        $scope.onAccountSelect = function(){
            //$scope.editObject.account =
        };

        if(!_.isUndefined($scope.entityLayoutInfraButtons)){
            $scope.entityLayoutInfraButtons.discardButton = {name : 'discard', func : rollback, ref : null, nodes : []};
            $scope.entityLayoutInfraButtons.saveButton = {name : 'save', func : save, ref : null, nodes : [], isPrimary : true};
        }

        var watcher = $scope.$watch('$parent.mainEntity', function (newValue, oldValue) {
            if (newValue !== oldValue || oldValue === null || !!$scope.isEntral) {
                updateState();
            }
        });

        function getMetaData(property){
            return entityMetaData['thirdPartyTags'][property];
        }

        function updateState(){
            $rootScope.mmIsPageDirty = false;

            console.log($scope.$parent.mainEntity);

            if($scope.$parent.mainEntity != null){
                $scope.isEditMode = true;
                $scope.preSaveStatus = false;
                $scope.editObject = mmRest.EC2Restangular.copy($scope.$parent.mainEntity);
                $scope.editObject.enabled = $scope.editObject.enabled == null ? false : $scope.editObject.enabled;
                $scope.pageReady = $scope.editObject != null;

            } else {
                $scope.isEditMode = false;
                $scope.preSaveStatus = true;
                $scope.editObject = $scope.editObject || mmRest.EC2Restangular.copy(getMetaData("defaultJson"));
                $scope.pageReady = true;
            }

            // save the original object (for rollback)
            if($scope.editObject != null)
                $scope.originalCopy = mmRest.EC2Restangular.copy($scope.editObject);
        }

        function rollback(){
            $scope.editObject = mmRest.EC2Restangular.copy($scope.originalCopy);
        }

        function save(skipValidation){
            var isValid = true;
            if(!skipValidation){
                isValid = saveValidation();
            }

            if(isValid){
                if($scope.isEditMode){

                    return thirdPartyTagService.update($scope.editObject, $stateParams.advertiserVtag).then(function (data) {

                        //console.log('response:', data);

                        $scope.preSaveStatus = false;
                        $rootScope.mmIsPageDirty = false;
                        $scope.showSPinner = false;
                        mmAlertService.addSuccess('Third Party Tag ' + data.tagName + ' was successfully updated.');

                    }, function(error){
                        //TODO
                        processError(error);
                    });

                } else {

                    return thirdPartyTagService.create($scope.editObject, $stateParams.advertiserVtag).then(function(data){

                        $scope.preSaveStatus = false;
                        $rootScope.mmIsPageDirty = false;
                        $scope.showSPinner = false;
                        mmAlertService.addSuccess('Third Party Tag ' + data.tagName + ' was successfully created');

                        if(!!$scope.isModal){
                            //$modalInstance.close(data);
                        }
                        else if (!!$scope.isEntral) {
                            $scope.$parent.mainEntity = data;
                        } else {
                            $state.go(getMetaData('editPageURL'), {thirdPartyTagId: data.id}, {location : "replace"});
                        }
                    });
                }
            }

        }

        function saveValidation(){
            var isValid = true;
            $scope.validation = {};

            if(!isDefined($scope.editObject.reportingName) || $scope.editObject.reportingName.length <= 2){
                $scope.validation.tagName = 'Please enter a name longer than 2 characters';
                isValid = false;
            }

            if(isDefined($scope.editObject.reportingName) && $scope.editObject.reportingName.length > 56){
                $scope.validation.tagName = 'Please enter a name that is no longer than 56 characters';
                isValid = false;
            }

            if(isDefined($scope.editObject.reportingName) && $scope.editObject.reportingName.length == 0){
                $scope.validation.tagCode = 'Please enter the code you received from the affiliate network or third party';
                isValid = false;
            }

            var cookieWindowImpressions = Number($scope.editObject.cookieWindowImpressions);
            var cookieWindowClicks = Number($scope.editObject.cookieWindowClicks);

            if(_.isNaN(cookieWindowImpressions)){
                $scope.validation.cookieWindowImpressions = 'Please enter a valid number';
                isValid = false;
            }

            if(_.isNaN(cookieWindowClicks)){
                $scope.validation.cookieWindowClicks = 'Please enter a valid number';
                isValid = false;
            }

            if(isValid) $scope.validation = {};
            return isValid;
        }

        function isDefined(value){
            return !_.isUndefined(value) && !_.isNull(value);
        }

        function processError(error) {
            console.log('ohh no!');
            console.log(error);
            if (_.isUndefined(error.data.error)){
                mmAlertService.addError("Server error. Please try again later.");
            } else {
                mmAlertService.addError(error.data.error);
            }
        }

        function initialize(){

            thirdPartyTagService.getAllSites().then(function(sites){
                $scope.sites = sites;
            });

            mmRest.accounts.getList().then(function(accounts){
                $scope.accounts = accounts;
            })



            //mmRest.sites.getList().then(function(sites){
            //
            //    console.log(sites);
            //
            //});

            updateState();
        }

        initialize();

    }
]);