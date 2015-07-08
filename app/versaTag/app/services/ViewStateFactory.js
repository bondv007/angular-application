/**
 * Created by Rick.Jones on 1/13/15.
 */
app.factory('viewStateFactory', [ '$state',
    function($state){
        var pub = {};

        pub.change = function(state){
            return $state.go(state, {}, {location: "replace"});
        };

        pub.reload = function(state){
            return $state.go(state, {}, {reload: true});
        };

        pub.goTo = function(state){
            return $state.go(state);
        };

        return pub;
    }
]);