'use strict';

angular.module('lynkApp')
  .controller('ProjectEditIndustryCtrl', function ($scope, $rootScope, $http, $location, $modalInstance, svcLookup) {
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/'+itemId)
        .then(function (result) {
          $scope.project.industries = result.data.industries;

          console.log($scope.project.industries);
      });

      // lookup and cache industrys
      svcLookup.industries(function (items) {
        $scope.cachedIndustries = items;
      });
    }

    refreshData();

    /**
     * Lookup industry from backend
     */
    $scope.lookupIndustry = function(query){
      var items = $scope.cachedIndustries;
      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].display.toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
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
