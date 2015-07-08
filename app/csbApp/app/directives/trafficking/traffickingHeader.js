/**
 * Created by Ofir.Fridman on 2/1/2015.
 */
'use strict';

app.directive('traffickingHeader',[function(){
  return {
    restrict : 'EA',
    scope: {
      mmFilter:"=",
      mmTitle:"@",
      mmButtons:"=?",
      mmCollapsibleState:"=?",
      mmFilterId:"@"
    },
    templateUrl: 'csbApp/app/directives/views/trafficking/traffickingHeader.html'
  }
}]);
