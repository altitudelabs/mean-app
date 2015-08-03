'use strict';

angular.module('lynkApp')
  .controller('DeleteConfirmCtrl', function ($scope, $modalInstance, $log, $http, $rootScope, $location, projects) {
    $scope.projects = projects;
    /**
     * Return true
     */
    $scope.ok = function () {
      console.log("Confirm delete");
      $modalInstance.close(true);
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.close(false);
    };
  });