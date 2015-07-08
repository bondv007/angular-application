/**
 * Created by Rick.Jones on 2/27/15.
 */
app.directive('mmUrlList', [ '$timeout',
    function($timeout){
        return {
            restrict: 'E',
            scope: {
                mmModel: '=',
                mmCaption: '@',
                mmPlaceholder: '@',
                mmChange: '&',
                mmDisable: '=?',
                mmLandingUrlModal: '&',
                mmClickToMessage: '@'
            },
            templateUrl: 'versaTag/app/directives/views/mmUrlList.html',
            controller: ['$scope', '$timeout', function($scope, $timeout){

                $scope.toggleTextArea = {show: false};
                $scope.list = {data:$scope.mmModel}



                var timeOut;
                $scope.mmModelChange = function(){
                    timeOut = $timeout(function(){$scope.mmChange();},100);
                    if(!$scope.mmDisable){
                        $scope.$root.isDirtyEntity = true;
                    }

                    $scope.mmModel = $scope.list.data;
                };

                $scope.listAction = function(){
                    console.log('called list action');
                    $scope.mmLandingUrlModal();
                };

                $scope.$on('$destroy', function() {
                    $timeout.cancel(timeOut);
                });
            }],
            link: function(scope, element, attrs){

                scope.$watch('toggleTextArea', function(value){

                    if(value.show == true){
                        $timeout(function(){
                           $(element).find('textarea').focus();
                        })

                    }

                }, true);

            }
        }
    }
]);