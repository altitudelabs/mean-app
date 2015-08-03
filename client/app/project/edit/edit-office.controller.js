'use strict';

angular.module('lynkApp')
  .controller('ProjectEditOfficeCtrl', function ($scope, $rootScope, $http, $location, $modalInstance, svcLookup) {
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/' + itemId)
        .then(function (result) {
          $scope.project.originatingOffice = result.data.originatingOffice;
          console.log($scope.project.originatingOffice);
      });

      // lookup and cache regions
      svcLookup.regions(function (items) {
        $scope.cachedRegions = items;
        // filter the cachedRegions only country
        filterCountries();
      });
    }
    function filterCountries() {
      $scope.countries = [];
      _.each($scope.cachedRegions, function(region){
        if(region.objectId.indexOf('c') > -1){
          $scope.countries.push(region);
        }
      });
      console.log($scope.countries);
    }

    refreshData();

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
