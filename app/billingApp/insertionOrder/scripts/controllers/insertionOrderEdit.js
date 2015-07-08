/**
 * Created by Shuki.Levy on 9/8/2014.
 */
'use strict';
app.controller('insertionOrderEditCtrl', ['$scope', '$filter', '$state', '$stateParams', 'mmUtils', 'mmRest', 'enums', 'mmAlertService', 'entityMetaData', 'mmModal', 'mmPermissions','$q', '$http', 'configuration',
    function ($scope, $filter, $state, $stateParams, mmUtils, mmRest, enums, mmAlertService, entityMetaData, mmModal, mmPermissions, $q, $http, conf) {

        $scope.initialize = false;
        $scope.ioNumber = $stateParams.ioId || $scope.$parent.entityId;
        $scope.userName = mmUtils.session.getLoggedInUser().username;

        var watcher = $scope.$watch('$parent.entityId', function (newValue, oldValue) {
            if (newValue != oldValue || oldValue == null || !!$scope.isEntral) {
                $scope.ioNumber = $stateParams.ioId || $scope.$parent.entityId;
                $scope.initialize = false;
                loadData();
            }
        });

        $scope.ioSignPermission = entityMetaData['campaignIo'].permissions.entity.sign;
        $scope.ioEditPermission = entityMetaData['campaignIo'].permissions.entity.edit;
        $scope.ioEnableDisablePermission = entityMetaData['campaignIo'].permissions.entity.enableDisable;

        $scope.hasBillingIoEditPermission = mmPermissions.hasPermissionBySession($scope.ioEditPermission);

        loadData();

        // <editor-fold desc="Initialize">
        $scope.whoIsPayingSectionCollapse = false;
        $scope.otherProductsSectionCollapse = false;
        $scope.paymentTermsSectionCollapse = false;
        $scope.termsAndConditionsSectionCollapse = false;
        $scope.attachmentsSectionCollapse = false;

        //TODO: Change to actual count
        $scope.attachmentsCount = 'ATTACHMENTS (' + 3 + ')';

        $scope.disclaimer = {
            checked: false,
            userName: null,
            password: null
        };

        $scope.notes = [
            { title: "1. Sizmek charges according to the actual number of impressions served."},
            { title: "2. For tracking placements only: If the actual number of clicks is more than the actual number of impressions, then MediaMind charges according to the CPM cost model (the rate * [total served impressions/1000])."},
            { title: "3. The actual CPM can be lower due to monthly volume discounts. If you are eligible for a discount, it appears in your invoice."},
            { title: "4. It is your responsibility to define agency and site purchase order (PO) numbers for placements before a campaign begins."}
        ];

        var radioButtons = [
            {Id: true }
        ];

        var actions = {
            accept : 'SignIO',
            decline: 'DeclineIO',
            disable: 'DisableIO',
            enable: 'EnableIO',
            updateSite: 'WhoIsPaying',
            updatePayerPO: 'PayerPO',
            exportToPDF: 'ExportToPDF'
        };

        $scope.gridColumns = {
            rateProductColumns: [
                {field: 'featureItem', displayName: 'Feature/ Item'},
                {field: 'rate', displayName: 'Rate', width: 100}
            ],

            recurringChargeColumns: [
                {field: 'feature', width: 300, displayName: 'Feature (Type)', isColumnEdit: false},
                {field: 'amount', width: 70, displayName: 'Amount', isColumnEdit: false},
                {field: 'effectiveDates', width: 130, displayName: 'Effective Dates', isColumnEdit: false},
                {field: 'recurrence', width: 90, displayName: 'Recurrence', isColumnEdit: false}
            ],

            sitesColumns: [ //modified later dynamically in setSites()
                {field: 'siteName', width: 350, displayName: 'Site Name', isColumnEdit: false},
                {field: 'payingAccount', width: 150, displayName: 'Current Paying Account', radioButtons: radioButtons, gridControlType: enums.gridControlType.getName("RadioButton")},
                {field: 'site', width: 50, displayName: 'Site', radioButtons: radioButtons, gridControlType: enums.gridControlType.getName("RadioButton")},
                {field: 'siteOnlyPaysForRichMedia', width: 100, displayName: 'Site only pays for rich media', radioButtons: radioButtons, gridControlType: enums.gridControlType.getName("RadioButton")}
            ]
        };

        $scope.radioButtonHandler = function (row, selectedRadio, col) {
            _.each($scope.gridItems.siteItems[row.rowIndex], function (value, key, obj) {
                if (key != col.field && obj[key] == true) {
                    obj[key] = false;
                }
            });
            $scope.$root.isDirtyEntity = true;
        };

        $scope.gridItems = {};

        $scope.gridSize = {
//            adSizeProduct: [], //set later dynamically in setAdSizeProducts()
//            volumeAdSizeProduct: [], //set later dynamically in setVolumeAdSizeProducts()
//            revenueAdSizeProduct: [], //set later dynamically in setRevenueAdSizeProducts()
            recurringChargeProducts: {}
        };

        $scope.stopServingDetailsRate = null;

        // </editor-fold>

        // <editor-fold desc="Set Io Details">

        function setIoDetails(data) {
            if (data.length > 0) {
                $scope.ioDetails = data[0];

                setSites();
                if(!$scope.initialize) //set only at first time
                {
                    setStopServingDetails();
                    setProducts();
                }
                $scope.initialize = true;
                //    $scope.pageReady = true;
            }
        }

        function setSites() {
            //Set column name to be the payer name
            $scope.gridItems.siteItems = [];

            $scope.gridColumns.sitesColumns[1].displayName = $scope.ioDetails.payerInfo.name;
            _.each($scope.ioDetails.sites, function (site) {
                $scope.gridItems.siteItems.push(
                    {
                        siteId: site.id,
                        siteName: site.name,
                        payingAccount: true,
                        site: false,
                        siteOnlyPaysForRichMedia: false
                    }
                )
            })
        }

        function setProducts() {
            setRateProductItems();
            setAdSizeProducts();
            setVolumeAdSizeProducts();
            setVolumeProducts();
            setRevenueAdSizeProducts();
            setRevenueProducts();
            setRecurringCharges();
        }

        function setRateProductItems() {
            $scope.gridItems.rateProductItems = {
                partOfIO: [],
                notPartOfIO: []
            };
            _.each($scope.ioDetails.rateProduct, function (product) {
                if (product.isPartOfIo) {
                    $scope.gridItems.rateProductItems.partOfIO.push(
                        {featureItem: product.name,
                            rate: product.rate + ' (' + product.currencySymbol + ')'
                        }
                    )
                }
                else {
                    $scope.gridItems.rateProductItems.notPartOfIO.push(
                        {featureItem: product.name,
                            rate: product.rate + ' (' + product.currencySymbol + ')'
                        }
                    )
                }
            })
        }

        function setAdSizeProducts() {
            $scope.gridColumns.adSizeProductColumns = [];
            $scope.gridItems.adSizeProductItems = [];

            _.each($scope.ioDetails.adSizeProducts, function (adSizeProduct) {
                var tiers = [];
                //set columns
                $scope.gridColumns.adSizeProductColumns[adSizeProduct.id] = [
                    {field: 'adSize', width: 200, displayName: 'Ad Size'},
                    {field: 'rate', width: 100, displayName: 'Rate (' + adSizeProduct.currencySymbol + ')'}
                ];

                //set items
                _.each(adSizeProduct.tiers, function (tier) {
                    tiers.push(
                        {adSize: (tier.fromAdSize != null && tier.toAdSize != null) ?
                            bytesToSize(tier.fromAdSize) + ' to ' + bytesToSize(tier.toAdSize) : null,
                            rate: tier.rate }
                    )
                });
                $scope.gridItems.adSizeProductItems[adSizeProduct.id] = tiers;
            })
        }

        function setVolumeAdSizeProducts() {
            $scope.gridColumns.volumeAdSizeProductColumns = [];
            $scope.gridItems.volumeAdSizeProductItems = [];

            _.each($scope.ioDetails.volumeAdSizeProducts, function (volumeAdSizeProduct) {
                //sort the tier list
                var volumeTiers = $filter('orderBy')(volumeAdSizeProduct.volumeTiers, ['fromAdSize', 'fromVolume']);

                //get columns
                var columns = volumeTiersToString(volumeTiers);

                //set the first column name
                $scope.gridColumns.volumeAdSizeProductColumns[volumeAdSizeProduct.id] = [
                    {field: 'adSize', width: 200, displayName: 'Ad Size/ Volume impressions'}
                ];

                //set the next columns
                _.each(columns, function (col, idx) {
                    $scope.gridColumns.volumeAdSizeProductColumns[volumeAdSizeProduct.id].push(
                        {field: idx.toString(), displayName: col}
                    )
                });

                //set items
                var rows = [];
                while (volumeTiers.length > 0) {
                    var currentRow = volumeTiers.splice(0, columns.length);
                    var item = {};

                    //set first column item
                    item.adSize = (currentRow[0].fromAdSize != null && currentRow[0].toAdSize != null) ?
                        bytesToSize(currentRow[0].fromAdSize) + ' to ' + bytesToSize(currentRow[0].toAdSize) : null;
                    //set  each row
                    _.each(currentRow, function (tier, idx) {
                        item[idx] = tier.rate + '(' + volumeAdSizeProduct.currencySymbol + ')';
                    });
                    rows.push(item);
                }
                $scope.gridItems.volumeAdSizeProductItems[volumeAdSizeProduct.id] = rows;

                //set size
             //   $scope.gridSize.volumeAdSizeProduct[volumeAdSizeProduct.id] = {width: 400, height: 40 + 30 * rows.length };
            })
        }

        function setVolumeProducts() {
            $scope.gridColumns.volumeProductColumns = [];
            $scope.gridItems.volumeProductItems= [];

            _.each($scope.ioDetails.volumeProducts, function (volumeProduct) {
                var volumeTiers = [];
                //set columns
                $scope.gridColumns.volumeProductColumns[volumeProduct.id] = [
                    {field: 'volume', width: 200, displayName: 'Volume Impressions'},
                    {field: 'rate', width: 100, displayName: 'Rate (' + volumeProduct.currencySymbol + ')'}
                ];

                //set items
                _.each(volumeProduct.volumeTiers, function (volumeTier) {
                    volumeTiers.push(
                        {volume: (volumeTier.fromVolume != null && volumeTier.toVolume != null) ?
                            volumeTierToString(volumeTier) : null,
                            rate: volumeTier.rate }
                    )
                });
                $scope.gridItems.volumeProductItems[volumeProduct.id] = volumeTiers;
            })
        }

        function setRevenueAdSizeProducts() {
            $scope.gridColumns.revenueAdSizeProductColumns = [];
            $scope.gridItems.revenueAdSizeProductItems = [];

            _.each($scope.ioDetails.revenueAdSizeProducts, function (revenueAdSizeProduct) {
                //sort the tier list
                var revenueTiers = $filter('orderBy')(revenueAdSizeProduct.revenueTiers, ['fromAdSize', 'fromRevenue']);

                //get columns
                var columns = revenueTiersToString(revenueTiers);

                //set the first column name
                $scope.gridColumns.revenueAdSizeProductColumns[revenueAdSizeProduct.id] = [
                    {field: 'adSize', width: 200, displayName: 'Ad Size/ Revenue'}
                ];

                //set the next columns
                _.each(columns, function (col, idx) {
                    $scope.gridColumns.revenueAdSizeProductColumns[revenueAdSizeProduct.id].push(
                        {field: idx.toString(), displayName: col}
                    )
                });

                //set items
                var rows = [];
                while (revenueTiers.length > 0) {
                    var currentRow = revenueTiers.splice(0, columns.length);
                    var item = {};

                    //set first column item
                    item.adSize = (currentRow[0].fromAdSize != null && currentRow[0].toAdSize != null) ?
                        bytesToSize(currentRow[0].fromAdSize) + ' to ' + bytesToSize(currentRow[0].toAdSize) : null;
                    //set  each row
                    _.each(currentRow, function (tier, idx) {
                        item[idx] = tier.rate + '(' + revenueAdSizeProduct.currencySymbol + ')';
                    });
                    rows.push(item);
                }
                $scope.gridItems.revenueAdSizeProductItems[revenueAdSizeProduct.id] = rows;

                //set size
            //    $scope.gridSize.revenueAdSizeProduct[revenueAdSizeProduct.id] = {width: 400, height: 40 + 30 * rows.length };
            })
        }

        function setRevenueProducts() {
            $scope.gridColumns.revenueProductColumns = [];
            $scope.gridItems.revenueProductItems = [];

            _.each($scope.ioDetails.revenueProducts, function (revenueProduct) {
                var revenueTiers = [];
                //set columns
                $scope.gridColumns.revenueProductColumns[revenueProduct.id] = [
                    {field: 'revenue', width: 200, displayName: 'Revenue'},
                    {field: 'rate', width: 100, displayName: 'Rate (' + revenueProduct.currencySymbol + ')'}
                ];

                //set items
                _.each(revenueProduct.revenueTiers, function (revenueTier) {
                    revenueTiers.push(
                        {revenue: (revenueTier.fromRevenue != null && revenueTier.toRevenue != null) ?
                            revenueTierToString(revenueTier) : null,
                            rate: revenueTier.rate }
                    )
                });
                $scope.gridItems.revenueProductItems[revenueProduct.id] = revenueTiers;
            })
        }

        function setRecurringCharges() {
            $scope.gridItems.recurringChargeItems= [];

            var minLength = 110;
            var maxNameLength = 0;
            _.each($scope.ioDetails.recurringCharges, function (rc) {
                maxNameLength = rc.typeName.length > maxNameLength ? rc.typeName.length : maxNameLength;
                $scope.gridItems.recurringChargeItems.push(
                    {feature: rc.typeName,
                        amount: rc.rate + ' (' + rc.currencySymbol + ')',
                        effectiveDates: rc.startDate + '- ' + rc.endDate,
                        recurrence: rc.recurrence
                    }
                )
            });
            //set col width
            maxNameLength = maxNameLength * 10;
            $scope.gridColumns.recurringChargeColumns[0].width = maxNameLength > minLength ? maxNameLength : minLength;

            //set grid width
            var gridwidth = 0;
            _.each($scope.gridColumns.recurringChargeColumns, function (col) {
                gridwidth += col.width;
            });
            $scope.gridSize.recurringChargeProducts.width = gridwidth + 10;
        }

        function setStopServingDetails() {
            //remove default banner product from array so we won't have to filter it later
            // and use it for stop servicing details
            var stopServingDetailsProduct = _.remove($scope.ioDetails.rateProduct, {'id': 32});
            if (stopServingDetailsProduct.length > 0) {
                $scope.stopServingDetailsRate = stopServingDetailsProduct[0].rate + ' (' + stopServingDetailsProduct[0].currencySymbol + ')';
            }
        }

        // </editor-fold>

        // <editor-fold desc="Actions">
        $scope.acceptButtonClick = function () {
            disclaimerValidation()
                .then(function(){
                    //valid
                    var changes = {};
                    changes.entities = [{
                        "ioNumber": $scope.ioNumber,
                        "action": actions.accept,
                        "loginUser": $scope.userName,
                        "userName": $scope.disclaimer.userName,
                        "password": $scope.disclaimer.password
                    }];
                    saveData(changes, true);
                },
                function()
                {   //invalid
                });
        };

        $scope.declineButtonClick = function () {
            disclaimerValidation()
            .then(function(){
                //valid
                openModal(actions.decline);
            },
            function()
            {   //invalid
            });
        };

        $scope.saveButtonClick = function () {
            if (!saveValidation()) {
            } else {
                var changes = {};
                changes.entities = [];

                GetPoNumberChanges(changes);
                GetWhoIsPayingChanges(changes);

                saveData(changes, false);
                goBackToIOList();
            }
        };

        $scope.closeButtonClick = function () {
            goBackToIOList();
        };

        $scope.disableButtonClick = function () {
            openModal(actions.disable);
        };

        $scope.enableButtonClick = function () {
            openModal(actions.enable);
        };

        $scope.exportToPDFButtonClick = function () {
        };

        function openModal(action){

           var title;
           var actionDesc;

           if(action == actions.disable){
               title = 'Disable IO';
               actionDesc = 'Disabling';

           }
            else if(action == actions.enable){
               title = 'Enable IO';
               actionDesc = 'Enabling';
           }
           else if(action == actions.decline){
               title = 'Decline IO';
               actionDesc = 'Declining';
           }

            var modalInstance = mmModal.open({
                templateUrl: './billingApp/insertionOrder/views/commentModal.html',
                controller: 'ioCommentModalCtrl',
                title: title,
                modalWidth: 600,
                bodyHeight: 250,
                confirmButton: { name: "Save", funcName: "save", isPrimary:true},
                discardButton: { name: "Cancel", funcName: "cancel" },
                resolve: {
                    params: function () {
                        return {
                            action : action,
                            actions: actions,
                            actionDesc: actionDesc
                        };
                    }
                }
            });

            modalInstance.result.then(function (result) {
                //Modal saved
                modalSave(action, result);
            }, function () {
                 //Modal dismissed
            });
        }

        function modalSave(action, result) {
            var changes = {};
            changes.entities = [
                {
                    "ioNumber": $scope.ioNumber,
                    "action": action,
                    "loginUser": $scope.userName,
                    "comment": result,
                    "userName": $scope.disclaimer.userName,
                    "password": $scope.disclaimer.password
                }
            ];
            saveData(changes, true);
        }

        function goBackToIOList() {

            if ($scope.isEntral) {
                $scope.entralEntity.openEntral(false);
            }

            if($scope.$parent.entityType === 'campaign' || $scope.$parent.entityType === 'campaignIo') {
                $state.go('spa.campaign.ioList.ioEdit');
            }
            else {//go back to io management
                $state.go('spa.media.ioList.ioEdit');
            }
        }

        function GetPoNumberChanges(changes) {

            changes.entities.push({
                "ioNumber": $scope.ioNumber,
                "action": "PayerPO",
                "loginUser": $scope.userName,
                "payerPoNumber": $scope.ioDetails.poNumber
            });
        }

        function GetWhoIsPayingChanges(changes) {
            var sites = [];
            _.each($scope.gridItems.siteItems, function (item) {
                if (item.payingAccount == false) {
                    //get who is paying for that account
                    var key = item.site ? 'site' : (item.siteOnlyPaysForRichMedia ? 'siteOnlyPaysForRichMedia' : null);

                    if (key != null) {
                        sites.push({
                            "id": item.siteId,
                            "name": item.siteName,
                            "whoIsPaying": enums.ioSites.getName(key)
                        });
                    }
                }
            });
            if (sites.length > 0) {
                changes.entities.push({
                    "ioNumber": $scope.ioNumber,
                    "action": "WhoIsPaying",
                    "loginUser": $scope.userName,
                    "sites": sites
                })
            }
        }

        // </editor-fold>

        // <editor-fold desc="Validation">
        function saveValidation() {
            return $scope.$root.isDirtyEntity;
        }

        function disclaimerValidation() {
            var deferred = $q.defer();
            if ($scope.disclaimer.checked) {
                if ($scope.disclaimer.userName && $scope.disclaimer.password) {
                    //check if identical to current login user
                    if($scope.userName == $scope.disclaimer.userName) {
                        //check authentication
                        authenticateUser($scope.disclaimer.userName, $scope.disclaimer.password).
                            then(function () {
                                deferred.resolve();
                            }, function () {
                                mmAlertService.addWarning("Username / Password invalid");
                                deferred.reject();
                            });
                    }
                    else{
                        mmAlertService.addWarning("Invalid username");
                        deferred.reject();
                    }
                }
                else {
                    mmAlertService.addWarning("Please enter user name and password");
                    deferred.reject();
                }
            }
            else {
                mmAlertService.addWarning("Please accept the terms and conditions");
                deferred.reject();
            }
            return deferred.promise;
        }

        function isWhoIsPayingChanged() {
            return _.some($scope.gridItems.siteItems, function(site){return !site.payingAccount; } )
        }

        // </editor-fold>

        // <editor-fold desc="General">

        function loadData() {
                mmRest.io($scope.ioNumber,$scope.userName).then(function (data) {
                setIoDetails(data);
                $scope.$root.isDirtyEntity = false;
            }, function (error) {
                processError(error);
            });
        }

        function saveData(changes, needToRefresh){
            $scope.$root.isDirtyEntity = false;
            if (changes.entities.length > 0) {
                return mmRest.io().customPUT(changes).then(function (data) {
                    processData(data);
                    if(needToRefresh){
                        loadData();
                    }
                }, function (error) {
                    processError(error);
                });
            }
        }

        $scope.$on('$destroy', function() {
            if (watcher) watcher();
        });

        function processData(data) {
            _.each(data, function (result) {
                if (result.Status) {
                    mmAlertService.addSuccess(result.AdditionalData);
                }
                else {
                    var errorMessage = result.ErrorMessage == null ? "There was a problem performing this action" : result.ErrorMessage;
                    mmAlertService.addError(errorMessage);
                }
            })
        }

        function processError(error) {
            console.log("ERROR: " + JSON.stringify(error));
            mmAlertService.addError("There was a problem performing this action");
        }

        function bytesToSize(bytes) {
            if (bytes == 0) return '0 Byte';
            if (bytes == -1) return 'Unlimited';
            var k = 1024;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        }

        function intToString(num) {
            if (num == -1) return 'Unlimited';
            return $filter('number')(num, 0);
        }

        function volumeTiersToString(tiers) {
            var result = [];
            _.each(tiers, function (tier) {
                result.push(volumeTierToString(tier))
            });
            return _.uniq(result);
        }

        function volumeTierToString(tier) {
            return intToString(tier.fromVolume) + "-" + intToString(tier.toVolume);
        }

        function revenueTiersToString(tiers) {
            var result = [];
            _.each(tiers, function (tier) {
                result.push(revenueTierToString(tier))
            });
            return _.uniq(result);
        }

        function revenueTierToString(tier) {
            return intToString(tier.fromRevenue) + "-" + intToString(tier.toRevenue);
        }

        function authenticateUser(userName, password)
        {
            var deferred = $q.defer();
            $http(
                {
                    ignoreAuthModule: true,
                    method: "POST",
                    url: conf.loginPath + "Login/",
                    data:{
                        'username': userName,
                        'password': password
                    }
                })
                .success(function(data, status, headers){
                    deferred.resolve(status);
                })
                .error(function(data, status, headers) {
                    deferred.reject(status);
                });
            return deferred.promise;
        }
            // </editor-fold>
    }]);

