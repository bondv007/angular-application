app.directive( 'rightSideBar', [ 'segmentsFactory', '$timeout', '$rootScope', 'csb', 'adsService',
    function(segmentsFactory, $timeout, $rootScope, csb, adsService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'csbApp/app/directives/trafficking/views/right-side-bar.html',
            link: function( scope, element, attrs ) {

                (init = function(){

                    // adsService.MasterAdsByCampaign(csb.params.campaignID).then(function(masterAds) {
                    //  these campaignIDs contain master Ads:
                    // 225143
                    // 91939
                    adsService.MasterAdsByCampaign(225143).then(function(masterAds) {
                        scope.masterAds = masterAds;
                        scope.makeDraggableUIitems();
                        // console.log('masterAds: ', scope.masterAds);
                    }, function(error) {
                    });

                  /*  scope.masterAds = [
                        {AdID: 20176541, AdName: 'MV_GEO_3G/4G_300X250', Dimension: '300X250'},
                        {AdID: 20176472, AdName: 'SV_Branding_300X250', Dimension: '300X250'},
                        {AdID: 20176473, AdName: 'SV_Branding_300X250', Dimension: '300X250'},
                        {AdID: 20176474, AdName: 'SV_Branding_300X250', Dimension: '300X250'},
                        {AdID: 20176475, AdName: 'MV_Best_Sellers_300X250', Dimension: '300X250'}
                    ];
                   */
                    scope.selectedMasterAds = [];

                    /*
                     * This object holds all the neccesary values to work with the selected ads
                     * when the preview button is pressed down.
                     */
                    scope.previewAds = {};
                    scope.previewAds.selectedAds = [];
                    scope.previewAds.buttonDisabled = true;

                    // if true the toolbar will be showed up by default (if not, will appear a button to show it).
                    scope.showMasterAdsView = true;

                    // This watch is too keep the size of the sidebar to fullfill the height of the window.
                    scope.$watch(function() {
                        return scope.showMasterAdsView;
                    }, function() {
                        if (scope.showMasterAdsView) {
                            var rightSideBarTable = $(".adsContainer");
                            var height = $(window).height() - rightSideBarTable.offset().top;
                            rightSideBarTable.css('height', height-37);

                        }
                    });

                }());

                scope.openPreviewAds = function() {
                    ids = [];

                    for (i in scope.previewAds.selectedAds) {
                        ids.push(scope.previewAds.selectedAds[i]['AdID']);
                    }

                    window.open(sizmek.previewUrl + "?sid=" + csb.params.sessionID + "&adids=" + ids.join("|"), "_blank");
                }

                /*
                 * Whenever a list of ads is added to the DOM, this function must be executed in order for jQuery
                 * to attach whatever it needs to work to over the UI.
                 */
                scope.makeDraggableUIitems = function() {
                     // Giving some extra time for getting DOM ready...
                    $timeout(function() {
                        $('.adsContainer table tr[draggable=true]').on('click', function(e) {
                             //getting neccesary data to add ads to scope.previewAds (tr, ad info, and checkbox)
                            var tr = $(this),
                                ad = tr.data("ad"),
                                checkbox = tr.find('input')[0];

                            // since the row and not the 'checkbox' was clicked... we emulate the click over the checkbox
                            checkbox.checked = !checkbox.checked;

                            // do determine: are we adding or removing?
                            if (checkbox.checked) {
                                action = "add";
                            } else {
                                action = "delete";
                            }

                            // console.log('clicked on row', 'action', action, 'ad', ad);
                            handleSelectAd(tr, ad, action);
                        });

                        /*
                         * binding the usage of the checkbox.
                         */
                        $('.adsContainer table tr[draggable=true]').on('click', ':checkbox', function (e) {
                            // stop propagation of events since below the checkbox is a td with a binded click event...
                            e.stopPropagation();

                            //getting neccesary data to add ads to scope.previewAds (tr, ad info, and checkbox)
                            var tr = $(this).parents("tr"),
                                ad = tr.data("ad"),
                                checkbox = this;

                            // do determine: are we adding or removing?
                            if (checkbox.checked) {
                                action = "add";
                            } else {
                                action = "delete";
                            }

                            // console.log('clicked on checkbox', 'action', action, 'ad', ad);
                            handleSelectAd(tr, ad, action);
                        });

                        /*
                         * This function will handle the add/delete of ads into the scope.previewAds (in order to let them preview)
                         */
                        function handleSelectAd(tr, ad, action) {
                            if (typeof ad !== "undefined") {
                                tr.toggleClass("selected");

                                // using scope.$apply() since this is happening out of the angulars's scope.
                                scope.$apply(function() {
                                    switch (action) {
                                        case 'add':
                                            scope.previewAds.selectedAds.push(ad);
                                            scope.previewAds.buttonDisabled = false;
                                            break;
                                        case 'delete':
                                            i = scope.previewAds.selectedAds.indexOfObjectByKey('id', ad.id);
                                            scope.previewAds.selectedAds.splice(i, 1);

                                            if (scope.previewAds.selectedAds.length == 0) {
                                                scope.previewAds.buttonDisabled = true;
                                            }

                                            break;
                                    }
                                });
                            }
                        }

                        // wainting for the event fired on treeView.js since it is handling the dropping...
                        $rootScope.$on('resetPreviewAds', function() {
                            scope.previewAds.selectedAds = [];
                            scope.previewAds.buttonDisabled = true;
                        });

                        // making draggables the rows that contains ads...
                        $(".adsContainer table tr[draggable=true]").draggable({
                            helper: function(){
                                // looking for the 'selected rows only'
                                var selected = $('.adsContainer table tr[draggable=true].selected');

                                // if dragging but nothing selected
                                if (selected.length === 0) {
                                    $(this).find('input')[0].checked = true;
                                    selected = $(this).addClass('selected');

                                    var ad = $(selected).data("ad");
                                    scope.$apply(function() {
                                        scope.previewAds.selectedAds.push(ad);
                                        scope.previewAds.buttonDisabled = false;
                                    });
                                }

                                // the generated html that will go with the pointer...
                                var container = $('<table/>')
                                    .attr('id', 'draggingContainer')
                                    .addClass("table table-hover table-condensed table-striped")
                                    .append(['<colgroup>',
                                        '<col width="5%"></col>',
                                        '<col width="20%"></col>',
                                        '<col width="25%"></col>',
                                        '<col width="25%"></col>',
                                    '</colgroup>',].join(''));


// window.selected = selected;
// window.container = container;
// debugger;

                                container.append(selected.clone().removeClass("selected"));

                                return container;
                            }
                        });
                    });
                };

            }
        }
    }
]);