'use strict';

angular.module('lynkApp')
  .controller('ProjectEditNameCtrl', function ($scope, $http, $location, $rootScope, $modalInstance, project) {
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.project = {};
      $http.get('/api/projects/'+itemId)
        .then(function (result) {
          $scope.project.name = result.data.name;
          // console.log($scope.project.name);
      });
    }

    refreshData();

    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
      console.log($scope.project);

      $http.patch('/api/projects/' + itemId, $scope.project)
        .then(function (result) {
          // console.log('updated', result);
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
