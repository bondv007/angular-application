app.directive( 'treeView', [ 'deliveryGroupsService', 'segmentsFactory', '$modal', 'csb', 'adsService', '$timeout', '$rootScope', 'appService', '$q', 'modalFactory',
    function(deliveryGroupsService, segmentsFactory, $modal, csb, adsService, $timeout, $rootScope, appService, $q, modalFactory) {

        return {
            restrict: 'A',

            scope: {

            },
            templateUrl: 'csbApp/app/directives/trafficking/views/treeView.html',

            controller : [ '$scope', function ( $scope ){
                /*
                 * You can put inside of this init function all the variable initialization.
                 */
                (init = function() {
                    // will set to false after 'initializing'.
                    $scope.initializing = true;

                    $scope.model = {};
                    $scope.model.modifiedDGs = [];

                    /**
                     * Allows the ads to be shown once the DG group is clicked
                     * @type {Boolean}
                     */
                    $scope.showAds = true;

                    /**
                     * Allows the filter controls to be displayed once a TA is clicked
                     * @type {Boolean}
                     */
                    $scope.showFilterControls = false;

                    $scope.showExistingButton = false;

                    /**
                     * Holds the value for the size that will be shown in the tree.
                     * @type {String}
                     */
                    $scope.filterToSize = "";

                    /**
                     * Holds all the different statuses fo the ads in the delivery group
                     * @type {Array}
                     */
                    $scope.allStatuses = ['Enabled', 'Disabled'];

                    /**
                     * Holds the value for the status that will be shown in the tree.
                     * @type {String}
                     */
                    $scope.filterToStatus = "";

                    // Return the list of ALL of the delivery groups. Not just the ones that are assigned to a TA
                    $scope.listOfDeliveryGroups = [];
                    $scope.$watch("currentSegment", function(newVal){

                        if(newVal){
                            $scope.listOfDeliveryGroups = deliveryGroupsService.listOfAllDeliveryGroups;
                        }
                    });

                    // represents the selected Target Audience from the funnel (once it is clicked)
                    $scope.currentSegment = null;

                    $timeout(function() {
                        // fetching delivery groups for campaing
                        var trafficked = true;
                        $scope.fetchDeliveryGroups(trafficked).then(function(groups) {
                            appService.csbData.deliveryGroups = groups;
                            $scope.initializing = false;
                        });

                        // DOES THIS GO HERE? <---- Yup, but must retorn a promise of promises & set to false $scope.initializing after it ran
                        $scope.getAssignedDeliveryGroups();

                    });

                    $scope.appService = appService;

                    // Events
                    $rootScope.$on('treeView.segmentSelectedInFunnelView', displayDGforTA);
                }());

                /*
                    This method queries the server to get all the DGs that have been assigned to the TAs in
                    the Funnel view.
                 */
                $scope.getAssignedDeliveryGroups = function () {
                    //console.log('before > appService.csbData.targetAudienceIDs', appService.csbData.targetAudienceIDs);
                    appService.csbData.targetAudienceIDs.forEach(function(ta) {
                        deliveryGroupsService
                                .getDeliveryGroupsByCampaignIDAndTargetAudienceID(csb.params.campaignID, ta.TargetAudienceID)
                                .then(function (response) {
                                  //  console.log('response', response);
                                    var i = appService.csbData.targetAudienceIDs.indexOfObjectByKey('TargetAudienceID', ta.TargetAudienceID);
                                    appService.csbData.targetAudienceIDs[i].deliveryGroups = response;
                                }, function(error) {

                                });
                    });
                   // console.log('after > appService.csbData.targetAudienceIDs', appService.csbData.targetAudienceIDs);

                };

                // obtaining all the Delivery Groups available
                $scope.fetchDeliveryGroups = function(onlyNonTrafficked) {

                    var q = $q.defer();

                    $scope.showLoading = true;

                    deliveryGroupsService.GetDeliveryGroupsByCampaignID(csb.params.campaignID, onlyNonTrafficked ).then(function(groups) {
                        // hide spinner
                        $scope.showLoading = false;
                        $rootScope.$broadcast('funnelView.hideLoading');

                        if (groups) {
                            q.resolve(groups);
                        } else {
                            q.resolve([]);
                        }

                    });

                    return q.promise;
                };

                /*
                 * Whenever a new DG is created over the DOM, this function must be executed in order for jQuery
                 * to attach whatever it needs to work to over the UI.
                 */
                $scope.makeDroppableUIitems = function() {
                    // Using $timeout with 0 time to send execution at the end (letting the view to load first).
                    $timeout(function() {

                        $("#tree.treeview-content ul.droppableItem")
                        .droppable({
                            // handling UI visual effects
                            activate: function( event, ui ) {
                                $(event.target).addClass('active');
                            },
                            over: function( event, ui ) {
                                $(event.target).addClass('over');
                                $(event.target).removeClass('active');
                            },
                            out: function( event, ui ) {
                                $(event.target).removeClass('over');
                                $(event.target).addClass('active');
                            },
                            deactivate: function( event, ui) {
                                $(event.target).removeClass('over');
                                $(event.target).removeClass('active');
                            },

                            // handling drop
                            drop: function (event, ui) {
                                // event.target -> the <ul class="droppable" ...> who holds the data for dg.DeliveryGroupID
                                var dg = $(event.target).data('dg');

                                // looking for the DG based on the DeliveryGroupID grabbed from the UI when dropped
                                var deliveryGroup = $scope.groups[$scope.groups.indexOfObjectByKey('DeliveryGroupID', dg.DeliveryGroupID)];

                                // if deliveryGroup is new, it doesn't have ads.
                                if (typeof deliveryGroup.ads == "undefined") {
                                    deliveryGroup.ads = [];
                                }

                                // iterating over every single ad that was dropped over the deliveryGroup
                                for (ads = $(ui.helper.children()[1]).children(), t = ads.length, c = 0; c < t; c++) {
                                    var ad = $(ads[c]).data('ad');

                                    // using scope.$apply() since this is happening out of the angulars's scope.
                                    $scope.$apply(function() {
                                        // Validating that the Ad isn't already in the DG...
                                        if (deliveryGroup.ads.indexOfObjectByKey('AdID', ad.AdID) == -1) {
                                            // Adding every single Ad to the DOM and rendering changes in angular View
                                            deliveryGroup.ads.push({
                                                AdFormatType: null,
                                                AdID: ad.AdID,
                                                AdName: ad.AdName,
                                                AdSize: ad.Dimension,
                                                Dimension: null
                                            });

                                            // Incrementing the total of ads inside of Obj deliveryGroup
                                            deliveryGroup.NumberOfAds++;

                                            // $scope.allSizes = deliveryGroupsService.getAllSizesForDGs(); //change this to getAllSizesForSelectedDGs when adding ads is needed
                                            deliveryGroupsService.calculateAdsRotationValueForDG($scope.currentSegment.deliveryGroup);

                                        } else {
                                            // TO DO: Handle error messages.
                                            // console.log('Ad already exist in this DG');
                                        }

                                        // firing an event to let know to rightSidebar.js that it can reset the scope.previewAds info.
                                        $rootScope.$broadcast('resetPreviewAds');
                                    });

                                    // console.log(' -> adID ', ad);
                                }

                                // console.log('deliveryGroup', deliveryGroup);

                                // Removing the 'selected' class from the currently dragged items (in the rigth sidebar).
                                $('.DraggableThings tr.selected').removeClass('selected');

                                // unchecking the checkboxes that were already dropped.
                                var checkboxes = $('.DraggableThings tr').find('input[type=checkbox]');
                                for(i in checkboxes) {
                                    checkboxes[i].checked = false;
                                }

                                // Validating if this deliveryGroup was modified before
                                if (i = $scope.model.modifiedDGs.indexOfObjectByKey('DeliveryGroupID', deliveryGroup.DeliveryGroupID) == -1) {
                                    // Creating dg model to get organized
                                    $scope.model.modifiedDGs.push(deliveryGroup);
                                } else {
                                    // Replacing dg in model with new data
                                    $scope.model.modifiedDGs[i] = deliveryGroup;
                                }

                                // Handling UI visual effects
                                $(event.target).removeClass('over');
                                $(event.target).removeClass('active');

                                /***************************************************************/
                                // TO DO: Make a call to the API to persist new ads for DG...
                                // $scope.model.modifiedGroups;
                                // ...
                                /***************************************************************/
                            }
                        });

                        // console.log('triggering drop.');
                    });
                };

                function displayDGforTA() {

                    /*
                     * Steps to show Delivery Groups:
                     * 1. get current selected target audience. (or audience segment)
                     * 2. show filters.
                     * 3. tell filterToGroup which DG will show.
                     *   4. get all sizes to fill filters.
                     *   5. calculate ads rotation.
                     */

                    // holding the current TA that is displayed as expanded in the audience list
                   $scope.currentSegment = segmentsFactory.getSelectedAudienceSegment();


                    if ($scope.currentSegment.TargetAudienceID) {

                         // if there is one TA expanded and has delivery group(s) attached to it
                        if($scope.currentSegment.deliveryGroups) {

                            if ($scope.currentSegment.deliveryGroups.length > 0) {
                                // console.log('This TA has DGs', $scope.currentSegment.deliveryGroups.length);

                                $scope.showExistingButton = true;


                                // ...
                                // the sizes will be filtered to those available in the current delivery group
                                $scope.makeDroppableUIitems();
                                $scope.allSizes = deliveryGroupsService.getAllSizesForSelectedDGs($scope.currentSegment.deliveryGroups);
                                deliveryGroupsService.calculateAdsRotationValueForDGs($scope.currentSegment.deliveryGroups);

                            } else {
                                $scope.showExistingButton = true;
                            }

                        } else {
                            $scope.showExistingButton = true;

                        }
                        /*
                            This is to change the height of the treeview
                            so that a scrollbar shows up when necessary
                                  */
                        var dgsMessageAreaHeight  = $('div#dgs-message-area').height() - 114; // 114 is header and topBar
                        var topOffset  = 204; // hardcoded for now, it is header + topBar + toolbar in trafficking view
                        var treeviewHeight = $('div#treeview .content').height();
                        $('#tree.treeview-content').css('height', dgsMessageAreaHeight - (topOffset + treeviewHeight));
                    }

                };

                // When called this function enables or disables the buttons (remove, preview) in the center panel
                function enableDisableButtons() {
                    // Enabling disabling buttons

                    // If there are DG or Ads selected
                    if (appService.previewAds.selectedDeliveryGroups.length > 0 || appService.previewAds.selectedAds.length > 0) {
                        appService.previewAds.buttonDisabled = false; // Preview button

                        if (appService.previewAds.selectedDeliveryGroups.length > 0) {
                            appService.previewAds.removeButtonDisabled = false;
                        } else {
                            appService.previewAds.removeButtonDisabled = true;
                        }
                    } else {
                        appService.previewAds.buttonDisabled = true;// 'preview' button
                        appService.previewAds.removeButtonDisabled = true;
                    }
                }

                /**
                 * Updates the size to which the ads should be filtered to.
                 * @param  {[string]} size The new value for the filter.
                 */
                $scope.changeSize = function (size) {
                    $scope.filterToSize = size;
                };

                /**
                 * Updates the status to which the ads should be filtered to.
                 * @param  {[string]} size The new value for the filter.
                 */
                $scope.changeStatus = function (status) {
                    $scope.filterToStatus = status;
                };

                /*
                 * This function receives an ad from a delivery group and adds it to the array that holds the
                 * selected ads to be shown when the preview button is pressed.
                 */
                $scope.selectAd = function(ad, e) {
                    e.stopPropagation();

                    if (e.target.checked) {
                        // selecting ad
                        appService.previewAds.selectedAds.push(ad);

                        // unchecking delivery group
                        $("input:first", $(e.target, "ul").parent().parent().parent())[0].checked = false;
                        appService.previewAds.selectedDeliveryGroups = [];
                    } else {
                        // unchecking ad
                        var i = appService.previewAds.selectedAds.indexOf(ad);
                        appService.previewAds.selectedAds.splice(i, 1);
                    }

                    enableDisableButtons();
                }

                /*
                 * This function receives a dg and adds it to an array that holds the selected delivery groups
                 * to be previewed or remove the reference that holds to a target audience.
                 */
                $scope.selectDg = function(dg, e) {
                    e.stopPropagation();

                    if (e.target.checked) {
                        // selecting delivery group
                        appService.previewAds.selectedDeliveryGroups.push(dg);

                        // unselect checkboxes from ads...
                        var inputs = $(e.target).parent().parent().children(".ads").find("input");
                        // AND unchecking ads's checkboxes inside of group:
                        inputs.each(function(i) {
                            inputs[i].checked = false;
                        });

                        appService.previewAds.selectedAds = [];

                    } else {
                        // unchecking delivery group
                        var i = appService.previewAds.selectedDeliveryGroups.indexOf(dg);
                        appService.previewAds.selectedDeliveryGroups.splice(i, 1);

                        // unselect checkboxes from ads...
                        var inputs = $(e.target).parent().parent().children(".ads").find("input");
                    }

                    enableDisableButtons();
                }

                /*
                 * This functions opens a modal window that shows the ads
                 * this function gets activated when the 'Preview' buttons is clicked.
                 */
                openPreviewDg = function(DeliveryGroupID) {

                    if (typeof DeliveryGroupID == "undefined") {
                        ids = [];

                        for (t = appService.previewAds.selectedDeliveryGroups.length, i=0; i<t; i++ ) {
                            ids.push(appService.previewAds.selectedDeliveryGroups[i]['DeliveryGroupID']);
                        }
                    } else {
                        ids = [DeliveryGroupID];
                    }

                    window.open(sizmek.previewUrl + "?sid=" + csb.params.sessionID + "&dgids=" + ids.join("|"), "_blank");
                }

                openPreviewAds = function() {
                    ids = [];

                    for (t = appService.previewAds.selectedAds.length, i=0; i<t; i++ ) {
                        ids.push(appService.previewAds.selectedAds[i]['AdID']);
                    }

                    window.open(sizmek.previewUrl + "?sid=" + csb.params.sessionID + "&adids=" + ids.join("|"), "_blank");
                }

                // This is binded to the 'Preview' button, and will dice if show whole group or just some ads
                $scope.openPreview = function() {
                    if (appService.previewAds.selectedDeliveryGroups.length > 0) {
                        openPreviewDg();
                    } else {
                        openPreviewAds();
                    }
                }

                $scope.removeDeliveryGroups = function() {
                    $scope.showLoading = true;
                    appService.previewAds.removeButtonDisabled = true;
                    appService.previewAds.buttonDisabled = true;

                    $scope.removeDg().then(function(response) {

                        $scope.showLoading = false;
                        enableDisableButtons();

                        // unselect all delivery groups in the modal
                        $('#tree').find('input[type=checkbox]').each(function(i, item){
                            item.checked = false;
                        });

                    }, function(error) {
                    });
                }

                /*
                 * this function removes the selectedAds from the selected deliveryGroup.
                 */
                $scope.removeDg = function() {

                    var promises = [];

                    // iterate over the items marked to be removed.
                    appService.previewAds.selectedDeliveryGroups.forEach(function(dg){
                        // look for it on the current segment...

                        promises.push(deliveryGroupsService.removeTargetAudience(dg.DeliveryGroupID).then(function( response ) {
                            if ( response.ResponseStatus == 1 ) {
                                var i = $scope.currentSegment.deliveryGroups.indexOfObjectByKey('DeliveryGroupID', dg['DeliveryGroupID']);
                                $scope.currentSegment.deliveryGroups.splice(i, 1);

                            }
                        }));

                    });

                    appService.previewAds.selectedDeliveryGroups = [];

                    return $q.all(promises);
                }

                /**
                 * Adds the delivery group to a TA
                 */
                $scope.attachDGtoTA = function(){

                    var audienceSegment = $scope.currentSegment;
                    var targetAudienceID = audienceSegment.TargetAudienceID;

                    if (typeof $scope.currentSegment.deliveryGroups == "undefined") {
                        $scope.currentSegment.deliveryGroups = [];
                    }

                    appService.previewAds.selectedDeliveryGroups.forEach(function(dg) {
                        //

                        // Call the API to save the Delivery Group to the Target Audience to the platform
                        deliveryGroupsService.AssignDeliveryGroupToTargetAudience(dg.DeliveryGroupID, targetAudienceID)
                            .then(function(response){

                                // TODO handle response
                                // TODO handle multiple requests in a single promise $q.all(...)


                                //console.log('delivery group id: ', dg.DeliveryGroupID);

                                if(response.ResponseStatus == 1) {

                                    $scope.currentSegment.deliveryGroups.push(dg);

                                    deliveryGroupsService.getDeliveryGroupsByCampaignIDAndTargetAudienceID(csb.params.campaignID, targetAudienceID).then(function (response) {
                                        //console.log('TA has: ', response);
                                        // Display the Delivery Group for the Target Audience in the message area
                                        displayDGforTA();


                                        /// need to call set priorities method
                                        appService.buildPrioritiesAndSend().then(function(response){

                                            var data = response.data;

                                            if(data.ResponseStatus == 1){

                                                appService.updateDecisionDiagram( true, false ).then(function (response) {
                                                });
                                            }

                                        });

                                    });

                                }

                            });
                    });

                    // Close modal
                    $scope.closeExistingDgsModal();


                    // console.log($scope.groups);
                }

                $scope.closeExistingDgsModal = function() {
                    appService.previewAds.selectedDeliveryGroups = [];
                    $scope.modal.dismiss();
                }

                /**
                 * This method opens up a modal dialog where the user
                 * can select a DG for the current TA.
                 */
                $scope.openExistingDGsModal = function() {
                    // opening the 'Exising Delivery Groups' modal
                    appService.previewAds.selectedDeliveryGroups = [];
                    enableDisableButtons();

                    $scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-existing-delivery-groups.html',
                        scope: $scope,
                        size: 'lg',
                        // To just add some jQuery behaviour (functionalities even of this modal or the app must be outside)...
                        controller: [ function() {

                            // setting 'true' to show loading spinner for delivery groups...
                            $scope.loadingGroups = true;

                            $scope.fetchDeliveryGroups(true /*trafficked*/).then(function(groups) {
                                // once delivery groups get loaded...

                                /*
                                 * reviewing wich delivery groups were already selected for the current TA selected.
                                 * groups got stored into $scope.groups... (the are not coming back from promise response)
                                 */

                                 if (groups) {
                                    for(t=groups.length, i=0; i<t; i++) {
                                        var group = groups[i];

                                        // finding the name of the current selected target audience...
                                        if (group.TargetAudienceID) {
                                            j = appService.csbData.targetAudienceIDs.indexOfObjectByKey('TargetAudienceID', group.TargetAudienceID);

                                            if (j > -1) {
                                                var ta = appService.csbData.targetAudienceIDs[j];
                                                group.TargetAudienceName = ta.TargetAudienceName;
                                            } else {
                                                group.TargetAudienceName = null;
                                            }
                                        }

                                        // IF this "Delivery Group" is assigned to a TA. Let's mark it as 'checked'.
                                        if ($scope.currentSegment.deliveryGroups && $scope.currentSegment.deliveryGroups.indexOfObjectByKey('DeliveryGroupID', group['DeliveryGroupID']) > -1) {
                                            // if it was already selected...
                                            groups[i]['checked'] = true;

                                        } else {
                                            /*
                                             * To disable the rows that are not elegible for this target audience ($scope.currentSegment).
                                             */

                                            // We need to know if a TA of the funnel list has this assigned.
                                            var TAs = angular.copy(appService.csbData.targetAudienceIDs);

                                            // removing from the list current segment. ###### this might no be neccesary but by now I'll let this code here :)
                                            index = TAs.indexOfObjectByKey('TargetAudienceID', $scope.currentSegment.TargetAudienceID);
                                            TAs.splice(index, 1);

                                            // for each target audience (except the current one selected on the UI)
                                            for (index in TAs) {
                                                if (TAs.hasOwnProperty(index)) {
                                                    var assignedGroups = TAs[index].deliveryGroups;

                                                    // if it has assigned delivery groups
                                                    if (assignedGroups.length > 0) {

                                                        // getting groups assigned to the current iteration of TA's
                                                        if (assignedGroups.indexOfObjectByKey('DeliveryGroupID', group['DeliveryGroupID']) > -1) {
                                                            groups[i]['disabled'] = true;
                                                        }
                                                    }
                                                }
                                            }

                                            TAs = null;
                                            assignedGroups = null;

                                        }
                                    }
                                 }

                                appService.csbData.deliveryGroups = groups;
                                $scope.listOfDeliveryGroups = appService.csbData.deliveryGroups;
                                 /*
                                 * binding the rows (delivery groups) and checkbox of the Table into the floater.
                                 */

                                // timing out in order to first load DOM then apply jquery scripts...
                                $timeout(function() {
                                    // making row clickable
                                    $('table#DeliveryGroups tr:not(.disabled)')
                                    .on('click', function(e) {
                                        // console.log('row');

                                        var tr = $(this),
                                            deliveryGroup = tr.data("dg"),
                                            checkbox = tr.find('input')[0];

                                        // since the row and not the 'checkbox' was clicked... we emulate the click over the checkbox
                                        checkbox.checked = !checkbox.checked;

                                        tr.addClass("selected");

                                        if (checkbox.checked) {
                                            appService.previewAds.selectedDeliveryGroups.push(deliveryGroup);
                                        } else {
                                            i = appService.previewAds.selectedDeliveryGroups.indexOf(deliveryGroup);
                                            appService.previewAds.selectedDeliveryGroups.splice(i, 1);
                                        }

                                        $timeout(function() {});
                                        // console.log('1---> $scope.previewAds.selectedDeliveryGroups', $scope.previewAds.selectedDeliveryGroups.length);
                                    });

                                    // binding checkbox
                                    $('table#DeliveryGroups tr:not(.disabled)')
                                    .on('click', ':checkbox', function (e) {
                                        // console.log('checkbox');

                                        // stop propagation of events since below the checkbox is a td with a binded click event...
                                        e.stopPropagation();

                                        var tr = $(this).parents("tr"),
                                            deliveryGroup = tr.data("dg"),
                                            checkbox = tr.find('input')[0];

                                        tr.addClass("selected");

                                        if (checkbox.checked) {
                                            appService.previewAds.selectedDeliveryGroups.push(deliveryGroup);
                                        } else {
                                            i = appService.previewAds.selectedDeliveryGroups.indexOf(deliveryGroup);
                                            appService.previewAds.selectedDeliveryGroups.splice(i, 1);
                                        }

                                        $timeout(function() {});
                                        // console.log('1---> $scope.previewAds.selectedDeliveryGroups', $scope.previewAds.selectedDeliveryGroups.length);
                                    });

                                    $('table#DeliveryGroups tr td button').bind('click', function(e) {
                                        e.stopPropagation();

                                        var DeliveryGroupID = $(this).parents("tr").data("dg").DeliveryGroupID;
                                        openPreviewDg(DeliveryGroupID);
                                    })
                                });
                            },function() {
                                $scope.listOfDeliveryGroups = [];
                            });

                            // setting 'false' to show loading spinner for delivery groups...
                            $scope.loadingGroups = false;

                        }]
                    });

                    $scope.modal.result.then(function() {

                    }, function() {
                        appService.previewAds.selectedDeliveryGroups = [];
                        appService.previewAds.selectedAds = [];

                        // Unselecting all checkboxes
                        $('#tree').find('input[type=checkbox]').each(function(i, item){
                            item.checked = false;
                        });
                    });
                }

                /**
                 * This method opens up a modal dialog where the user
                 * can type in a name for her new DG
                 */
                $scope.openNewDGsModal = function() {
                    $scope.modal = $modal.open({
                        templateUrl: 'csbApp/app/views/ui/modal-new-delivery-groups.html',
                        scope: $scope
                    });
                }

                /**
                 * This method will save the NEW delivery group that the user is
                 * creating. Firstly it will show the DG in the UI and then it will call
                 * the corresponding API method and persist the DG.
                 * @param  {Object} dg The DG to be saved.
                 */
                $scope.saveNewDG = function(dg) {

                    // this will most likely be returned from the API Call.
                    // Date.now() is to generate different id's in case the
                    // user is attempting to create more than 1 DG
                    var dgID = Date.now();


                    // creating a new object with the DG structure.
                    // deliveryGroupsService.addDeliveryGroup returns the list
                    // of updated delivery groups
                    $scope.groups = deliveryGroupsService.addDeliveryGroup({
                        DeliveryGroupID : dgID,
                        Name : dg.name,
                        NumberOfAds : 0,
                        RotationType : "Even Distribution",
                        Dimension : "No dimension yet"
                    });

                    // telling the UI that the selected TA will have this as it's DG
                    // $scope.currentSegment.deliveryGroup = dgID;

                    // refreshing the view
                    displayDGforTA();

//                    console.log('Call to the API to save \"' + dg.name + '\"" as a new Deliver Group goes here...');

                    // remove the modal that prompts for a new name only if "add another DG" is not checked
                    if (dg.anotherDg) {
                        dg.name = "";
                    } else {
                        $scope.modal.dismiss();
                    }

                }

            }]
        }
    }
]);