'use strict';

angular.module('lynkApp')
  .controller('EditComplianceCtrl', function ($scope, $http, Auth, $modalInstance, compliance, listOfProjects) {
    function refreshData () {
      $scope.newCompliance = compliance;
      if($scope.newCompliance.tncSignedDate){
        $scope.newCompliance.tncSignedDate = new Date($scope.newCompliance.tncSignedDate);
      }
      $scope.projectList = listOfProjects;
    }
    refreshData();

    $scope.ok = function () {
      // reduce project to project Id only
      console.log($scope.newCompliance);
      $modalInstance.close($scope.newCompliance);
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

        /**
     * Click functions for approvals
     */
    $scope.statusSelect = function(stage, select){
      if(stage === 2){
        if(!$scope.newCompliance.stage2){ $scope.newCompliance.stage2 = {}};
        if($scope.newCompliance.stage2.status === select) {
          $scope.newCompliance.stage2.status = undefined;
        } else {
          $scope.newCompliance.stage2.status = select;
        }
      } else if(stage === 3){
        if(!$scope.newCompliance.stage3){ $scope.newCompliance.stage3 = {}};
        if($scope.newCompliance.stage3.status === select) {
          $scope.newCompliance.stage3.status = undefined;
        } else {
          $scope.newCompliance.stage3.status = select;
        }
      } else if(stage === 4){
        if(!$scope.newCompliance.stage4){ $scope.newCompliance.stage4 = {}};
        if($scope.newCompliance.stage4.status === select) {
          $scope.newCompliance.stage4.status = undefined;
        } else {
          $scope.newCompliance.stage4.status = select;
        }
      } else if(stage === 5){
        if(!$scope.newCompliance.stage5){ $scope.newCompliance.stage5 = {}};
        if($scope.newCompliance.stage5.status === select) {
          $scope.newCompliance.stage5.status = undefined;
        } else {
          $scope.newCompliance.stage5.status = select;
        }
      } else if(stage === 6){
        if(!$scope.newCompliance.stage6){ $scope.newCompliance.stage6 = {}};
        if($scope.newCompliance.stage6.status === select) {
          $scope.newCompliance.stage6.status = undefined;
        } else {
          $scope.newCompliance.stage6.status = select;
        }
      } else if(stage === 7){
        if(!$scope.newCompliance.stage7){ $scope.newCompliance.stage7 = {}};
        if($scope.newCompliance.stage7.status === select) {
          $scope.newCompliance.stage7.status = undefined;
        } else {
          $scope.newCompliance.stage7.status = select;
        }
      }
    };

    $scope.signTNC = function() {
      if(!$scope.newCompliance.tncSignedDate){
        $scope.newCompliance.tncSignedDate = new Date();
      } else {
        $scope.newCompliance.tncSignedDate = undefined;
      }
    };
  });
