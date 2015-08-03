'use strict';

angular.module('lynkApp')
  .controller('ConsultationDetailCtrl', function ($scope, $modal, $http, $location, svcLookup, $log, $sessionStorage) {

    $scope.loading = false;

    // lookup and cache users
    svcLookup.users(function (items) {
      $scope.cachedUsers = items;
    });

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.loading = true;
      $scope.consultation = {};

      $http.get('/api/consultations/object/' + itemId)
        .then(function (result) {
          // TODO: See if anymore time fields need to convert
          if(result.data.expert.compliance) {
            if(result.data.expert.compliance.tncSignedDate) {
              result.data.expert.compliance.tncSignedDate = new Date(result.data.expert.compliance.tncSignedDate);
            }
          }
          // Convert Date string to JSON Date object
          if (result.data.scheduledDate) {
            result.data.scheduledDate = new Date(result.data.scheduledDate);
          }
          if(result.data.compliance){
            if(result.data.compliance.stage2){
              if(result.data.compliance.stage2.referenceDate){result.data.compliance.stage2.referenceDate = new Date(result.data.compliance.stage2.referenceDate);}
            }
            if(result.data.compliance.stage3){
              if(result.data.compliance.stage3.referenceDate){result.data.compliance.stage3.referenceDate = new Date(result.data.compliance.stage3.referenceDate);}
            }
            if(result.data.compliance.stage4){
              if(result.data.compliance.stage4.referenceDate){result.data.compliance.stage4.referenceDate = new Date(result.data.compliance.stage4.referenceDate);}
            }
            if(result.data.compliance.stage5){
              if(result.data.compliance.stage5.referenceDate){result.data.compliance.stage5.referenceDate = new Date(result.data.compliance.stage5.referenceDate);}
            }
            if(result.data.compliance.stage6){
              if(result.data.compliance.stage6.referenceDate){result.data.compliance.stage6.referenceDate = new Date(result.data.compliance.stage6.referenceDate);}
            }
            if(result.data.compliance.stage7){
              if(result.data.compliance.stage7.referenceDate){result.data.compliance.stage7.referenceDate = new Date(result.data.compliance.stage7.referenceDate);}
            }
          } else {
            // No compliance? create a to prevent undefined problem
            result.data.compliance = {};
          }
          $scope.consultation = result.data;
          $log.info('refreshData', $scope.consultation);
        })
        .finally(function() {
          $scope.pmEmail = $scope.consultation.project.manager.email;
          $scope.loading = false;
        });
    }

    refreshData();

    $scope.updateData = function () {
      // reduce data: expertID, projectID
      $scope.consultation.expert = $scope.consultation.expert.objectId;
      $scope.consultation.project = $scope.consultation.project._id;
      $http.put('/api/consultations/object/' + itemId, $scope.consultation)
        .then(function (result) {
          console.log('updated', result);
          refreshData();
      });
    };

    /**
     * Click functions for approvals
     */
    $scope.statusSelect = function(stage, select){
      if(stage === 2){
        if(!$scope.consultation.compliance.stage2){ $scope.consultation.compliance.stage2 = {}};
        if($scope.consultation.compliance.stage2.status === select) {
          $scope.consultation.compliance.stage2.status = undefined;
        } else {
          $scope.consultation.compliance.stage2.status = select;
        }
      } else if(stage === 3){
        if(!$scope.consultation.compliance.stage3){ $scope.consultation.compliance.stage3 = {}};
        if($scope.consultation.compliance.stage3.status === select) {
          $scope.consultation.compliance.stage3.status = undefined;
        } else {
          $scope.consultation.compliance.stage3.status = select;
        }
      } else if(stage === 4){
        if(!$scope.consultation.compliance.stage4){ $scope.consultation.compliance.stage4 = {}};
        if($scope.consultation.compliance.stage4.status === select) {
          $scope.consultation.compliance.stage4.status = undefined;
        } else {
          $scope.consultation.compliance.stage4.status = select;
        }
      } else if(stage === 5){
        if(!$scope.consultation.compliance.stage5){ $scope.consultation.compliance.stage5 = {}};
        if($scope.consultation.compliance.stage5.status === select) {
          $scope.consultation.compliance.stage5.status = undefined;
        } else {
          $scope.consultation.compliance.stage5.status = select;
        }
      } else if(stage === 6){
        if(!$scope.consultation.compliance.stage6){ $scope.consultation.compliance.stage6 = {}};
        if($scope.consultation.compliance.stage6.status === select) {
          $scope.consultation.compliance.stage6.status = undefined;
        } else {
          $scope.consultation.compliance.stage6.status = select;
        }
      } else if(stage === 7){
        if(!$scope.consultation.compliance.stage7){ $scope.consultation.compliance.stage7 = {}};
        if($scope.consultation.compliance.stage7.status === select) {
          $scope.consultation.compliance.stage7.status = undefined;
        } else {
          $scope.consultation.compliance.stage7.status = select;
        }
      }

      $scope.updateData();
    };

    /**
     * Override textarea keypress
     */
    $scope.textareaKeydown = function ($event, $form) {
      // If only enter is pressed, submit form
      if ($event.keyCode === 13 && !$event.metaKey && !$event.shiftKey && !$event.ctrlKey && !$event.altKey) {
        $form.$submit();
        $event.preventDefault();
      }
    };

    $scope.overviewTab = {};

    /**
     * Opens invite Expert modal
     */
    $scope.overviewTab.inviteExpertModal = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'app/consultation/invite-expert/invite-expert.html',
        controller: 'ConsultationInviteExpertCtrl',
        size: size,
        resolve: {
          consultation: function() {
            return $scope.consultation;
          },
          cachedUsers: function() {
            return $scope.cachedUsers;
          },
          pmEmail: function() {
            return $scope.pmEmail;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
        refreshData();
      });
    };

    /**
     * Opens invite Client modal
     */
    $scope.overviewTab.inviteClientModal = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'app/consultation/invite-client/invite-client.html',
        controller: 'ConsultationInviteClientCtrl',
        size: size,
        resolve: {
          consultation: function() {
            return $scope.consultation;
          },
          cachedUsers: function() {
            return $scope.cachedUsers;
          },
          pmEmail: function() {
            return $scope.pmEmail;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
        refreshData();
      });
    };

    /**
     * Returns indicator class
     */
    $scope.getIndicatorClass = function (status) {
      if (status === 'Archived') {
        return 'indicator-archived';
      } else if (status === 'Closed') {
        return 'indicator-closed';
      } else if (status === 'On Hold') {
        return 'indicator-onhold';
      } else {
        return 'indicator-active';
      }
    };

    /**
     * Signed TSN T&C function
     */
    $scope.signTnc = function () {
      // First sign, assign date
      if ($scope.consultation.expert.compliance === undefined) {
        $scope.consultation.expert.compliance = {};
      }
      if ($scope.consultation.expert.compliance.tncSignedDate === undefined) {
        $scope.consultation.expert.compliance.tncSignedDate = new Date();
        // Default to be long
        $scope.consultation.expert.compliance.tncVersionSigned = "0";
      } else {
        $scope.consultation.expert.compliance.tncSignedDate = undefined;
        $scope.consultation.expert.compliance.tncVersionSigned = undefined;
      }
    }
  });
