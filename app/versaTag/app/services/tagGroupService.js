/**
 * Created by Rick.Jones on 2/11/15.
 */
app.factory('tagGroupService', [ 'EC2Restangular', '$q',
   function(EC2Restangular, $q){

       var restPath = 'tags/groups';
       var accountId = 1;

       var pub = {};

       pub.allGroups = function(){

           var deferred = $q.defer();

           EC2Restangular.all(restPath).one('all', accountId).getList().then(function(response){

               deferred.resolve(response);

           }, function(response){

               deferred.reject(response);

           });

           return deferred.promise;

       };

       pub.getGroupByAdvertiserTag = function(tag){

           var deferred = $q.defer();

           if(tag.type && tag.id){

               EC2Restangular.all(restPath).one('of', tag.tagType).getList(tag.id).then(function(response){

                   deferred.resolve(response);

               }, function(response){

                   deferred.reject(response);

               });

           }



           return deferred.promise;

       };

       pub.createGroup = function(groupName){

           var deferred = $q.defer();

           EC2Restangular.all(restPath).one('get', accountId).customGET(groupName).then(function(response){

               deferred.resolve(response);

           }, function(response){

               deferred.reject(response);

           });

           return deferred.promise;
       };

       pub.suggestGroup = function(partialGroupName){

           var deferred = $q.defer();

           EC2Restangular.all(restPath).one('suggest', accountId).getList(partialGroupName).then(function(response){

               deferred.resolve(response);

           }, function(response){

               deferred.reject(response);

           });

           return deferred.promise;

       };

       function getGroupNamesOnly(groups){
           var groupNames = [];

           for(var i=0; i < groups.length; i++){

               groupNames.push(groups[i].name);

           }

           return groupNames;
       }

       /**
        * This method will add and remove groups to the tag when a save is done.
        * It will wipe out all the groups associated with the tag and add them again
        *
        * @param groups
        * @param tag
        */
       pub.saveGroups = function(groups, tag){
           var deferred = $q.defer();

           var payLoad = {"entities": [{
               "type": "GroupTagger",
               "accountId": accountId,
               "tag": { id: tag.id, tagType: tag.tagType},
               "groups": getGroupNamesOnly(groups)

           }]};

           //console.log(JSON.stringify(payLoad));

           EC2Restangular.all(restPath).post(payLoad).then(function(response){
               deferred.resolve(response);
           }, function(response){
               deferred.reject(response);
           });

           return deferred.promise;
       };

       pub.addGroupToTag = function(groupId, tag){

           var deferred = $q.defer();

           EC2Restangular.all(restPath).one('add', groupId).one(tag.tagType, tag.id).get().then(function(response){

               deferred.resolve(response);

           }, function(response){

               deferred.reject(response);

           });

           return deferred.promise;

       };

       pub.removeGroupFromTag = function(groupId, tag){

           var deferred = $q.defer();

           EC2Restangular.one(restPath).one('remove', groupId).one(tag.tagType, tag.id).get().then(function(response){

               deferred.resolve(response);

           }, function(response){

               deferred.reject(response);

           });

           return deferred.promise;

       };

       pub.removeGroup = function(groupId){

           var deferred = $q.defer();

           EC2Restangular.one(restPath, groupId).delete().then(function(response){

               deferred.resolve(response);

           }, function(response){

               deferred.reject(response);

           });

           return deferred.promise;

       };

       return pub;
   }
]);