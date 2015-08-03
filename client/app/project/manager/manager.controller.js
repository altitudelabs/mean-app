'use strict';

angular.module('lynkApp')
  .controller('ProjectManagerCtrl', function ($scope, $modalInstance, $log, $http, $rootScope, $location, $modal, Auth, svcLookup) {

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/' + itemId)
        .then(function (result) {
          if(result.data.manager){
            $scope.project.members = result.data.members;
            $scope.project.manager = result.data.manager;
          }
          $log.info('Project fetched', $scope.project);
      });
    }

    refreshData();

    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
      console.log("after", $scope.project);

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
