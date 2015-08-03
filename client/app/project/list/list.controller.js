'use strict';

angular.module('lynkApp')
  .controller('ProjectListCtrl', function ($scope, $rootScope, $log, $modal, $http, Auth) {

    $scope.viewing = 'Active'; // or 'Archived'
    $scope.mine = 'My Projects'; // or 'All Projects'

    /**
     * Active edit mode where user can set status and archive projects
     */
    $scope.editMode = false;

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

      // console.log('queryModeOr is', $scope.queryModeOr);
    };

    $scope.orderByField = 'startDate';
    $scope.reverseSort = true;
    $scope.selectAllState = false;

    /**
     * Get projects from server
     */
    function refreshData() {
      $scope.projects = [];
      $scope.loading = true;

      var base = '/api/projects';
      var query = [];

      if ($scope.viewing === 'Archived') {
        query.push('archive');
      }

      if ($scope.mine === 'My Projects') {
        query.push('mine=' + Auth.getCurrentUser().name);
      }

      if (query) {
        query = query.join('&');
        query = base + '?' + query;
      } else {
        query = base;
      }

      $http.get(query)
        .then(function(result) {
          $scope.projects = result.data;
        })
        // .then(function() {
        //   // for each client in project, fetch by objectId
        // })
        .finally(function() {
          console.log('Projects', $scope.projects);
          $scope.loading = false;
        });

    }

    refreshData();

    $rootScope.$on('rootScope:emit', function (event, args) {
      refreshData();
    });

    // Special ng-click function for parsed['Inactive'] due to [''] problem
    $scope.inactive = function () {
      $scope.orderByField = 'clients[0].parsed["Inactive (days)"]';
    }
    $scope.setViewing = function (status) {
      $scope.viewing = status;
      refreshData();
    };
    $scope.setMine = function (status) {
      $scope.mine = status;
      refreshData();
    };

    $scope.selectAllProjects = function () {
      _.each($scope.projects, function(project){
        $scope.selectProject(project, $scope.selectAllState);
      });
    };

    $scope.selectProject = function (project, toState) {
      if (toState !== undefined) project.selected = toState;

      $scope.editMode = _.some($scope.projects, function(project){
        return project.selected;
      });

      console.log('Selected projects', $scope.getSelectedProjects());
    };

    $scope.getSelectedProjects = function () {
      return _.filter($scope.projects, function(project){
        return project.selected;
      });
    };

    $scope.archiveProject = function () {
      var selectedProjects = $scope.getSelectedProjects();
      for (var i = 0, len = selectedProjects.length; i < len; i++) {
        selectedProjects[i].status = 'Archived';
      }
      $scope.updateData();
      $scope.selectAllState = false;
    };

    $scope.deleteProject = function () {
      var selectedProjects = $scope.getSelectedProjects();
      var numProjectsToDelete = selectedProjects.length;
      for (var i = 0, len = selectedProjects.length; i < len; i++) {
        // selectedProjects[i].status = 'Deleted';
        // remove all related consultations
        console.log('deleting', selectedProjects[i]._id);
        for(var j = 0, len2 = selectedProjects[i].consultations.length; j < len2 ; j++) {
          console.log('deleting consultation', selectedProjects[i].consultations[j]);
          $http.delete('/api/consultations/' + selectedProjects[i].consultations[j]);
        }
        // remove all compliance related to project in experts
        for(var k = 0, len3 = selectedProjects[i].experts.length; k < len3; k++) {
          console.log('remove compliance in expert', selectedProjects[i].experts[k]);
          var compliance = [];
          for(var l = 0, len4 = selectedProjects[i].experts[k].projectCompliance.length; l < len4; l++){
            if(selectedProjects[i].experts[k].projectCompliance[l].project !== selectedProjects[i]._id){
              compliance.push(selectedProjects[i].experts[k].projectCompliance[l]);
            }
          }
          selectedProjects[i].experts[k].projectCompliance = compliance;
          $http.patch('/api/experts/object/' + selectedProjects[i].experts[k].objectId, selectedProjects[i].experts[k]);
        }

        $http.delete('/api/projects/' + selectedProjects[i]._id).then(function() {
          if (--numProjectsToDelete === 0)
            refreshData();
        });
      }

      $scope.selectAllState = false;
      $scope.editMode = false;
    };

    // updates all selectedProjects
    $scope.updateData = function () {
      var selectedProjects = $scope.getSelectedProjects();
      for (var i = 0, len = selectedProjects.length; i < len; i++) {
        $http.put('/api/projects/' + selectedProjects[i]._id, selectedProjects[i])
          .then(function (result) {
            console.log('updated', result);
        });
      }

      $log.info('updated', selectedProjects);
      refreshData();
    };

    /**
     * Open modal
     */
    $scope.open = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'app/project/create/create.html',
        controller: 'ProjectCreateCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    // open confirm delete modal
    $scope.confirmDelete = function () {
      var projects = $scope.getSelectedProjects();
      var modalInstance = $modal.open({
          templateUrl: 'app/project/delete-confirm/delete-confirm.html',
          controller: 'DeleteConfirmCtrl',
          size: 'sm',
          resolve: {
            projects: function () {
              return projects;
            }
          }
        });

        modalInstance.result.then(function (result) {
          if(result){
            $scope.deleteProject();
          }
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
    };

  });
