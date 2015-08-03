'use strict';

angular.module('lynkApp')
  .controller('ProjectAddExpertCtrl', function ($scope, $modalInstance, $log, $http, $rootScope, $location, $modal, Auth, svcLookup) {

    svcLookup.experts(function (items) {
      $scope.cachedExperts = items;
    });

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/' + itemId)
        .then(function (result) {
          $scope.project = result.data;
          $scope.existingExperts = $scope.project.experts.slice();
          $log.info('experts found', $scope.project.experts);
      });
    }

    refreshData();

    /**
     * Lookup expert from backend
     */
    $scope.lookupExpert = function(query){
      var items = $scope.cachedExperts;
      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].name.toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
    };

    /**
     * Delete new added experts only
     * Compare the list with existing Experts
     */
     $scope.deleteExpert = function(tag) {
      for(var i = 0; i < $scope.existingExperts.length; i++){
        if(tag.name === $scope.existingExperts[i].name){
          return false; // exist before, cannot delete
        }
      }
      return true; // did not exist before, can be deleted
     };
    /**
     * New Lookup expert from backend
     * Using Likewise query to API
     */
    //$scope.lookupExpert = function (query) {
    //  return $http.get('/api/experts/name/' + query);
   // }

    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
      for(var i = 0; i < $scope.project.experts.length; i++) {
        var id = $scope.project.experts[i].objectId;
        // find the expert in expertStatus
        // if not found push a new status for the new Expert
        if( mapExperts(id) < 0 ) {
          $scope.project.projectSpecificExperts.push({
            objectId :        id,                     // expert ID for mapping
            statusInProject : 'pending',              // init status of new expert
            addedBy :         Auth.getCurrentUser()   // current user who add expert
          });
        }
      }
      reduceData();
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

    $scope.confirmDelete = function (tag) {
      var modalInstance = $modal.open({
          templateUrl: 'app/project/add-expert/add-expert-confirm.html',
          controller: 'ProjectAddExpertConfirmCtrl',
          size: 'sm',
          resolve: {
            expert: function () {
              return tag;
            }
          }
        });

        modalInstance.result.then(function (result) {
          if(result){
            var index = $scope.project.experts.indexOf(tag);
            if (index > -1) {
              $scope.project.experts.splice(index, 1);
            }
          }
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });

        return false;
    };

    /**
     * Map experts with their expertStatus by expert Id
     * @param Integer _id
     * @return index in expertStatus / -1 if not found
     */
    function mapExperts (id){
      for(var i = 0; i < $scope.project.projectSpecificExperts.length; i++){
        if($scope.project.projectSpecificExperts[i].objectId === id) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Reduce the expert info into projectSpecificExperts before patch/update
     * Remove all attributes of experts list except expertId
     * Attribute to be moved:
     *    - statusInProject   - experience
     *    - addedBy           - notes
     *    - history           - country
     *    - partnerRef
     *
     * Reduce the consultation info into just ids before patch/update
     *
     */
    function reduceData () {
      // reduce expert info
      var reduceExperts = [];
      for (var i = 0; i < $scope.project.experts.length; i++) {
        var id = $scope.project.experts[i].objectId;
        reduceExperts.push(id);
        var index = mapExperts(id);
        if( index > -1) {
          if($scope.project.experts[i].statusInProject) {$scope.project.projectSpecificExperts[index].statusInProject = $scope.project.experts[i].statusInProject;}
          if($scope.project.experts[i].addedBy) {$scope.project.projectSpecificExperts[index].addedBy = $scope.project.experts[i].addedBy;}
          if($scope.project.experts[i].experience) {$scope.project.projectSpecificExperts[index].experience = $scope.project.experts[i].experience;}
          if($scope.project.experts[i].notes) {$scope.project.projectSpecificExperts[index].notes = $scope.project.experts[i].notes;}
          if($scope.project.experts[i].history) {$scope.project.projectSpecificExperts[index].history = $scope.project.experts[i].history;}
          if($scope.project.experts[i].country) {$scope.project.projectSpecificExperts[index].country = $scope.project.experts[i].country;}
          if($scope.project.experts[i].partnerRef) {$scope.project.projectSpecificExperts[index].partnerRef = $scope.project.experts[i].partnerRef;}
        } else {
          console.log("Cannot map expert to info, must have error!")
        }
      }
      $scope.project.experts = reduceExperts;
      // reduce consultation
      var reduceCon = [];
      for (var i = 0; i < $scope.project.consultations.length; i++) {
        reduceCon.push($scope.project.consultations[i]._id);
      }
      $scope.project.consultations = reduceCon;
    }
  });
