'use strict';

angular.module('lynkApp')
  .controller('ProjectEditAccountCtrl', function ($scope, $modalInstance, $log, $http, $rootScope, $location, Account, svcLookup) {
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    $log.info('itemId', itemId);

    $scope.Account = Account;

    svcLookup.accounts(function (items) {
      $scope.cachedAccounts = items;
      console.log($scope.cachedAccounts);
    });

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/' + itemId)
        .then(function (result) {
          $scope.project.account = [];
          $scope.project.account[0] = result.data.account[0];
          if(result.data.account[0]){
            $scope.backup = result.data.account[0];
          }
          $log.info($scope.project.account[0]);
      });
    }

    refreshData();

    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
      console.log($scope.project);
      if($scope.backup){
        if($scope.project.account[0].objectId === $scope.backup.objectId){
          $modalInstance.close($scope.project);
        } else {
          // update
          $scope.project.clients = [];
          $http.patch('/api/projects/' + itemId, $scope.project)
          .then(function (result) {
            console.log('updated', result);
            $rootScope.$emit('rootScope:emit', 'rootScope Emit');
            $modalInstance.close($scope.project);
          });
        }
      } else {
        // no previous account, still update new
        $scope.project.clients = [];
        $http.patch('/api/projects/' + itemId, $scope.project)
        .then(function (result) {
          console.log('updated', result);
          $rootScope.$emit('rootScope:emit', 'rootScope Emit');
          $modalInstance.close($scope.project);
        });
      }
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
