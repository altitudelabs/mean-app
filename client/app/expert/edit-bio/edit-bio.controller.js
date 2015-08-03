'use strict';

angular.module('lynkApp')
  .controller('ExpertEditBioCtrl', function ($scope, $modalInstance, expert) {
    $scope.expert = expert;

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  });
