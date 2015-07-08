/**
 * Created by Rick.Jones on 8/29/14.
 */
function WatcherUtils(){};

/**
 * Helper method to watch for changes from a factory
 *
 * @param scope
 * @param factory
 * @param property
 * @param action
 */
WatcherUtils.watchFactoryChange = function(scope, factory, property, action){

    scope.$watch(function() { return factory[property] }, action);

};