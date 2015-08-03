'use strict';

angular.module('lynkApp')
  .controller('ConsultationListCtrl', function ($scope, $rootScope, $http, $q, Auth) {
    /**
     * Active edit mode where user can set status and delete consultations
     */
    $scope.editMode = false;

    $scope.selectAllState = false;

    /**
     * Auto focus on search input
     */
    $scope.focusInput = true;

    /**
     * Check to allow Admin only for certain actions
     */
    $scope.isAdmin = Auth.isAdmin;

    /**
     * Sets whether user searches project with all terms (queryModeOr == false) or any terms (queryModeOr == true)
     */
    $scope.queryModeOr = true;
    $scope.setQueryOr = function (value) {
      $scope.queryModeOr = value;
      $scope.focusInput = true; // always focus back on search input

      console.log('queryModeOr is', $scope.queryModeOr);
    };

    /**
     * Refresh Data and ContactInfo views
     */
    $rootScope.$on('rootScope:emit', function (event, args) {
      refreshData();
    });

    $scope.selectAll = function () {
      _.each($scope.consultations, function(consultation){
        $scope.select(consultation, $scope.selectAllState);
      });
    };

    $scope.select = function (project, toState) {
      if (toState !== undefined) project.selected = toState;

      $scope.editMode = _.some($scope.consultations, function(con){
        return con.selected;
      });

      console.log('Selected consultations', $scope.getSelected());
    };

    $scope.getSelected = function () {
      return _.filter($scope.consultations, function(con){
        return con.selected;
      });
    };

    // delete consultation from list view
    $scope.delete = function () {
      var selected = $scope.getSelected();
      for (var i = 0, len = selected.length; i < len; i++) {
        console.log('deleting', selected[i]._id);

        var promise = deleteConsultationForProject(selected[i].project._id, selected[i]._id);
        promise.then(function(consultationId) {

          $http.delete('/api/consultations/' + consultationId).then(function() {
            $rootScope.$emit('rootScope:emit', 'rootScope Emit');
          });

        }, function(err) {
          console.log('error deleting consultation', err);
        });
      }

      $scope.selectAllState = false;
    };

    // propagate delete at project level
    function deleteConsultationForProject(projectId, consultationId) {

      var deferred = $q.defer();

      $http.get('/api/projects/' + projectId)
        .then(function (result) {
          var project = {};
          project.consultations = result.data.consultations;
          var whichToDelete;

          for (var i = project.consultations.length - 1; i >= 0; i--) {
            if (project.consultations[i] === consultationId) {
              whichToDelete = i;
              break;
            }
          };

          project.consultations = _.remove(project.consultations, function(value, key) {
            return key === whichToDelete + 1; // key starts with 1, not 0
          });

          $http.patch('/api/projects/' + projectId, project);

          deferred.resolve(consultationId);

        }, function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    }


    function refreshData() {
      $scope.loading = true;
      $scope.consultations = [];
      var query = '/api/consultations';

      $http.get(query)
        .then(function(result) {
          $scope.consultations = result.data;
          console.log('refreshData', $scope.consultations);

        })
        .finally(function() {
          $scope.loading = false;
        });
    }

    refreshData();

    // Consultation Ref
    // for consultation we can use “C”+date+000 where date is the scheduled consultation date.

  });
