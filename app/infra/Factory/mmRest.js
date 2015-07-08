/**
 * Created by rotem.perets on 11/16/14.
 */
app.factory('mmRest', ['EC2Restangular', 'entityMetaData',
  function mmRestFactory(EC2Restangular, entityMetaData) {
    var account = EC2Restangular.all(entityMetaData.account.restPath);
    var site = EC2Restangular.all(entityMetaData.site.restPath);
    var siteRelations = EC2Restangular.one(entityMetaData.siteRelations.restPath);
    var userPermissions = EC2Restangular.one(entityMetaData.userPermissions.restPath);

    return {
      EC2Restangular: EC2Restangular,
      account : account,
      site: site,
      siteRelations: siteRelations,
      userPermissions: userPermissions
    };
  }
]);