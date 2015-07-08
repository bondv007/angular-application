app.directive( 'selectAllText', [
    function() {

        return{
            restrict: 'A',
            scope: {},
            link: function ( scope, element, attrs ) {

                element.bind( 'click', function() {
                    this.select();
                });

            }
        }

    }
]);