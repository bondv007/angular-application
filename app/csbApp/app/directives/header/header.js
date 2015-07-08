app.directive( 'goToServingStrategy' , [ 'csb', '$state', 'modalFactory', 'decisionTreeService', 'appService',
    function( csb, $state, modalFactory, decisionTreeService, appService ) {

        return {
            restrict: 'A',
            scope: {},
            link: function( scope, element, attrs ) {

                element.bind( 'click', function() {

                    if ( !angular.equals( angular.copy(decisionTreeService.original), angular.copy(decisionTreeService.decisions) ) ) {
                        modalFactory.showPrompt( 'Warning', 'You need to save your campaign before switching to the Serving Strategy page.', { showCancelButton: false });
                        return false;
                    }

                    else if ( !appService.csbData.targetAudienceIDs.length ) {
                        modalFactory.showPrompt( 'Warning', 'You need to save your template to a campaign before switching to the Serving Strategy page.', { showCancelButton: false });
                        return false;
                    }

                    if ( csb.config.env == 'mdx2' ) {
                        var stateParamsObject = {
                            DecisionDiagramID: csb.params.diagramID,
                            SessionID: csb.params.sessionID,
                            AccountID: csb.params.accountID,
                            UserID: csb.params.userID,
                            EnvID: csb.config.envID
                        }
                    }
                    else{
                        var stateParamsObject = {
                            diagramID: csb.params.diagramID
                        }
                    }

                    $state.go('csb-trafficking', stateParamsObject );

                });
            }
        };

    }
]);

app.directive('goToAudienceStrategy', [ 'csb', 'appService', '$state', 'unSavedChangesService',
    function (csb, appService, $state, unSavedChangesService) {

        return{
            restrict: 'A',
            scope: {},
            link: function (scope, element, attrs) {

                element.bind('click', function () {

                    if (!appService.csbData.targetAudienceIDs.length) {
                        return false;
                    }

                    unSavedChangesService.checkForUnSavedChanges().then(function (move) {
                        if (move) {
                            if (csb.config.env == 'mdx2') {
                                var stateParamsObject = {
                                    DecisionDiagramID: csb.params.diagramID,
                                    SessionID: csb.params.sessionID,
                                    AccountID: csb.params.accountID,
                                    UserID: csb.params.userID,
                                    EnvID: csb.config.envID
                                }
                            }
                            else {
                                var stateParamsObject = {
                                    diagramID: csb.params.diagramID
                                }
                            }

                            $state.go('csb-diagram', stateParamsObject);
                        }
                    });
                });

            }
        }
    }
]);
