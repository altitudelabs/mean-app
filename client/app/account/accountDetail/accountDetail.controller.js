'use strict';

angular.module('lynkApp')
  .controller('AccountDetailCtrl', function ($scope, $http, $log, $location, Auth) {

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    $scope.isAdmin = Auth.isAdmin;

    // API patch account info
    $scope.updateData = function () {
      $http.put('/api/accounts/' + itemId, $scope.account)
        .then(function (result) {
          console.log('updated', result);
      });
    };

    /**
     * Refresh data from model
     */
    function refreshData() {
      $scope.loading = true;
      $scope.account = {};

      $http.get('/api/accounts/' + itemId)
        .then(function (result) {
          $scope.account = result.data;
          $log.info('refreshData', $scope.account);
        })
        .finally(function() {
          refreshParsed();
        });
    }

    /**
     * Refresh parsed contents, but not saving to $scope.account, prevent update real data to db
     * Chain of http get to ensure finally loading stop
     */
     function refreshParsed() {
      // get the number of items need to http.get
      var itemNumber = 0;
      if($scope.account.parsed['Primary Contact']){
        itemNumber++;
      }
      if($scope.account.parsed['Compliance Contact']){
        itemNumber++;
      }
      if($scope.account.parsed['Account Manager']){
        itemNumber++;
      }
      if($scope.account.parsed['Back-up']){
        itemNumber++;
      }
      $scope.loading = true;
      if($scope.account.parsed['Primary Contact']){
        $http.get('/api/contacts/' + $scope.account.parsed['Primary Contact'])
          .then(function (result) {
            $scope.primaryContact = result.data[0];
            $log.info('refresh primary contact', $scope.primaryContact);
            itemNumber--;
            if(itemNumber === 0){
              $scope.loading = false;
            }
        });
      }
      if($scope.account.parsed['Compliance Contact']){
        $http.get('/api/contacts/' + $scope.account.parsed['Compliance Contact'])
          .then(function (result) {
            $scope.complianceContact = result.data[0];
            $log.info('refresh compliance contact', $scope.complianceContact);
            itemNumber--;
            if(itemNumber === 0){
              $scope.loading = false;
            }
        });
      }
      if($scope.account.parsed['Account Manager']){
        $http.get('/api/accounts/relateIQ/' + $scope.account.parsed['Account Manager'])
          .then(function (result) {
            $scope.accountManager = result.data;
            $log.info('refresh account manager', $scope.accountManager);
            itemNumber--;
            if(itemNumber === 0){
              $scope.loading = false;
            }
        });
      }
      if($scope.account.parsed['Back-up']){
        $http.get('api/accounts/relateIQ/' + $scope.account.parsed['Back-up'])
          .then(function (result) {
            $scope.backup = result.data;
            $log.info('refresh backup', $scope.backup);
            itemNumber--;
            if(itemNumber === 0){
              $scope.loading = false;
            }
        });
      }
      if(itemNumber === 0){
        $scope.loading = false;
      }
    }


    refreshData();

  });
