'use strict';

angular.module('lynkApp')
  .controller('EditHistoryCtrl', function ($scope, $modalInstance, history) {
    // variable for ui select
    $scope.newHistory = history;
    $scope.newHistory.date = new Date($scope.newHistory.date);
    $scope.choices = [{name:'Long', version:'0'},{name:'Short', version:'1'}];
    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
      console.log($scope.newHistory);
      $modalInstance.close($scope.newHistory);
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
