/**
 * Created by Rick.Jones on 11/12/14.
 */

function ErrorMessage(type, message){
    var self = this;

    self.type = type;
    self.msg = message;
}

app.factory('errorFactory', [
    function(){
        var factory = {};

        factory.errorMessages = [];

        factory.addErrorMessage = function(type, message){
            var errorMessage = new ErrorMessage(type, message);
            factory.errorMessages.push(errorMessage);
        };

        factory.removeErrorMessage = function(index){
            factory.errorMessages.splice(index, 1);
        }

        return factory;
    }
]);