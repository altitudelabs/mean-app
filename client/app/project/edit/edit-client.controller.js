'use strict';

angular.module('lynkApp')
  .controller('ProjectEditClientCtrl', function ($scope, $modalInstance, $log, $http, $rootScope, $location, Account, svcLookup) {
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    $log.info('itemId', itemId);

    $scope.Account = Account;

    svcLookup.accountListIds(function (items) {
      $scope.cachedAccountListIds = items;
    })
    svcLookup.clients(function (items) {
      $scope.cachedClients = items;
    });

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/' + itemId)
        .then(function (result) {
          $scope.project.clients = result.data.clients;

          $log.info($scope.project.clients);
      });
    }

    refreshData();

    /**
     * Lookup client from backend
     */
    $scope.lookupClient = function(query){
      // var chosenAccount = $scope.Account;
      // if (chosenAccount) {
      //   var items = chosenAccount[0].contacts; console.log(items);
      //   var found = [];
      //   for (var i = 0, len = items.length; i < len; i++) {
      //     if (items[i].properties.name) {
      //       if (items[i].properties.name[0].value.toLowerCase().match(query.toLowerCase())) {
      //         found.push({
      //           objectId: items[i].objectId,
      //           name: items[i].properties.name[0].value,
      //           properties: items[i].properties
      //         });
      //       }
      //     }
      //   }
      //   console.log(found);
      //   return found;

      // } else {
      //   return ['Select an account first'];
      // }
      $scope.accountListId = null;

      // find name indexOf $scope.cachedAccountListIds.name
      if ($scope.Account.length === 1) {
        for (var i = $scope.cachedAccountListIds.length - 1; i >= 0; i--) {
         // if either name is part of another, this is the right account and we have an individualId
         if ($scope.Account[0].name.toLowerCase().indexOf($scope.cachedAccountListIds[i].name.toLowerCase()) > -1 ||
             $scope.cachedAccountListIds[i].name.toLowerCase().indexOf($scope.Account[0].name.toLowerCase()) > -1) {
           $scope.accountListId = $scope.cachedAccountListIds[i].individualId;
           //console.log('account list id', $scope.accountListId);
           break;
         }
       };

        var items = $scope.cachedClients;
        var found = [];
        for (var i = 0, len = items.length; i < len; i++) {
          if ( items[i].listId === $scope.accountListId &&
               items[i].name.toLowerCase().match(query.toLowerCase()) ) {
            found.push(items[i]);
          }
        }
        return found;

      } else {
        return [];
      }

    };

    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
      console.log($scope.project);

      $http.patch('/api/projects/' + itemId, $scope.project)
        .then(function (result) {
          console.log('updated', result);

          $rootScope.$emit('rootScope:emit', 'rootScope Emit');
      });

      $modalInstance.close($scope.project);
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
