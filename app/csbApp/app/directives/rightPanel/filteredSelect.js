app.directive( 'filteredSelect', [
    function() {

        return{
            restrict: 'E',
            scope: {
                listToChooseFrom: '=',
                listChosen: '=',
				itemNameKey: '@',
				itemIdKey: '@',
                filterName: '@',
                filterId: '@',
                label: '@'
            },
            templateUrl: 'csbApp/app/directives/views/rightPanel/filteredSelect.html',
            link: function( scope, element, attrs ) {

                // init some vars
                scope.listToChooseFromSelected = [];
                scope.listChosenSelected = [];

                /**
                 * Add an item from the list on the left to the chosen list on the right
                 */
                scope.addChosen = function() {

                    // loop over each selected item
                    angular.forEach( scope.listToChooseFromSelected, function( item ) {
                        scope.listChosen.push( item );
                    });

                    scope.listToChooseFromSelected.emptyArray();

                };


                /**
                 * Adds all the items from list on the left to the chosen list on the right
                 */
                scope.addAll = function() {

                    // loop over each of the items in the choose from list
                    angular.forEach( scope.listToChooseFrom, function( item ) {
                        scope.listChosen.push( item );
                    });

                    scope.listToChooseFromSelected.emptyArray();

                };


                /**
                 * Remove an item from the chosen list on the right
                 */
                scope.removeChosen = function() {

                    // loop over each selected item
                    angular.forEach( scope.listChosenSelected, function( selectedItem ) {

                        // then loop over the chosen items so we can compare
                        angular.forEach( scope.listChosen, function( item, index ) {
                            if ( selectedItem == item ) {
                                scope.listChosen.splice( index, 1 );
                            }
                        });

                    });

                    // reset the chosen items in the selected list
                    scope.listChosenSelected.emptyArray();

                };


                /**
                 * Removes all items from the chosen list on the right and resets the selected items
                 */
                scope.removeAll = function() {
                    scope.listChosen.emptyArray();
                    scope.listChosenSelected.emptyArray();
                };


                /**
                 * Filter to remove items that have been selected from the listToChooseFrom list
                 */
                scope.selectedFilter = function( item ) {

                    var notInSelectedList = true;

                    angular.forEach( scope.listChosen, function( chosenItem ) {
                        notInSelectedList = chosenItem[ scope.filterName ] == item[ scope.filterName ] && chosenItem[ scope.filterId ] == item[ scope.filterId ] ? false : notInSelectedList;
                    });

                    return notInSelectedList;

                };

            }
        }
    }
]);
