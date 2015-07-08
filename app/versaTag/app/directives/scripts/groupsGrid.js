/**
 * Created by Rick.Jones on 2/19/15.
 */
app.directive('groupsGrid',['tagGroupService', function(tagGroupService){
    return {
        restrict: 'E',
        templateUrl: 'versaTag/app/directives/views/groupsGrid.html',
        scope: {
            groups: '=',
            selectedGroups: '=?',
            removeGroup: '&onRemoveGroup'
        },
        controller: ['$scope', function($scope){
            $scope.columns = [
                {field:'name', displayName: 'Group', isColumnEdit: true}
            ];
        }],
        link: function(scope, element, attrs){

            scope.search = {groups:null};


            scope.addToGrid = function(){

                scope.$root.isDirtyEntity = true;
                var groupName = scope.search.groups;
                createGroup(groupName);

                // clear search input
                scope.search.groups = null;
            };

            scope.onSearchSelect = function(item, model, label){

                //console.log(item, model, label);
                createGroup(item);

                // clear search input
                scope.search.groups = null;

            };

            scope.searchGroups = function(val){

                return tagGroupService.suggestGroup(val).then(function(response){

                    var output = [];

                    //console.log(response.plain());

                    for(var i = 0; i < response.length; i++){
                        var group = response[i];

                        output.push(group.name);
                    }

                    //console.log(output);

                    return output;
                });

            };

            scope.removeFromGrid = function(){

                for(var i = 0; i < scope.selectedGroups.length; i++){

                    var selectedGroup = scope.selectedGroups[i];

                    if(searchForGroup(selectedGroup.name) != -1){
                        _.remove(scope.groups, function(n) {

                            if(n === selectedGroup){
                                //console.log(n);
                                scope.removeGroup({group: n});
                                scope.$root.isDirtyEntity = true;
                                return true;
                            }

                            return false;
                        });
                    }

                }
            };

            function createGroup(groupName){

                scope.$root.isDirtyEntity = true;


                // Search for the group in the list. Don't add it if it already exists.
                if(searchForGroup(groupName) == -1){

                    scope.groups.push({
                        id: null,
                        accountId: 1,
                        name: groupName,
                        tags: [],
                        entityType: "TagGroup"
                    });
                    scope.$root.isDirtyEntity = true;
                }
            }

            function searchForGroup(groupName){

                var index = -1;

                for(var i = 0; i < scope.groups.length; i++){

                    var group = scope.groups[i];

                    if(group.name == groupName){
                        index = i;
                        break;
                    }

                }

                return index;

            }
        }
    };
}]);