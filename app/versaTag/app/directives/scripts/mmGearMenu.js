/**
 * Created by Rick.Jones on 3/5/15.
 */
app.directive('mmGearMenu', [
    function(){
        return {
            restrict: 'E',
            scope:{
                mmModel: '='
            },
            templateUrl: 'versaTag/app/directives/views/mmGearMenu.html',
            link: function(scope, element, attrs){

                scope.labelWidth = 130;

                scope.protocols = [
                    {id:'HttpAndHttps', name: 'HTTP and HTTPS'},
                    {id:'HttpOnly', name: 'HTTP Only'},
                    {id:'HttpsOnly', name: 'HTTPS Only'},
                    {id:'ExactlyAsEntered', name: 'Exactly as entered'},
                    {id:'InvalidUrls', name: 'Invalid URLs'},
                ];

                if(scope.mmModel.trackingProtocol == null){
                    scope.mmModel.trackingProtocol = scope.protocols[0].id;
                }

                scope.showLandingProperties = false;

                scope.openLandingURLProperties = function(){

                    scope.showLandingProperties = !scope.showLandingProperties;

                };

                scope.landingPropertyChange = function(){

                    if(!scope.mmDisable){
                        scope.$root.isDirtyEntity = true;
                    }

                };
            }
        };
    }
]);