'use strict';

angular.module('lynkApp')
  .controller('ExpertDetailCtrl', function ($scope, $rootScope, $location, $http, $modal, $log, Consultation) {

    var $modalInstance;

    var itemId;
    var path = $location.path();
    if (path.indexOf('object') > -1) {
      itemId = (path.split('/'))[path.split('/').length-1];
      // Redirect to make URL looks better
      $location.path('/expert/' + itemId);
    } else {
      itemId = (path.split('/'))[path.split('/').length-1];
      // now use populate, all use objectId
      refreshDataByObjectId();
    }

    /**
     * Refresh data from model
     * NEW!!! Populate data do not use _id, dun use this function

    function refreshData() {
      $scope.loading = true;
      $scope.expert = {};

      $http.get('/api/experts/objectId/' + itemId)
        .then(function (result) {
          $scope.expert = result.data;
          console.log('refreshData', $scope.expert);
        })
        .finally(function() {
          $scope.loading = false;
        });
    }**/

    /**
     * Update data to model
     */
     $scope.updateData = function () {
      reduceExpert();
      $http.put('/api/experts/object/' + itemId, $scope.expert)
        .then(function (result) {
          console.log('updated', result);
          refreshDataByObjectId();
      });
    };

    /**
     * Refresh data from model
     */
    function refreshDataByObjectId() {
      $scope.loading = true;
      $scope.expert = {};

      $http.get('/api/experts/object/' + itemId)
        .then(function (result) {
          //console.log('Redirection to Expert Page '+ result.data.objectId);
          //$location.path('/expert/' + result.data.objectId);
          if(!result.data.compliance){
            result.data.compliance = {};
          }
          if(!result.data.compliance.history){
            result.data.compliance.history = [];
          }
          $scope.expert = result.data;
          $scope.expert.projectCompliance.map(function(compliance){
            if(compliance.project){
              $http.get('/api/projects/'+compliance.project)
              .then(function(result){
                compliance.project = result.data;
              });
            }
          });
          console.log('refreshData', $scope.expert);
        })
        .finally(function() {
          $scope.loading = false;
        });
    }

    $scope.projectsTab = {
      projects: []
    };

    function getProjects() {
      $scope.loading = true;

      $http.get('/api/projects')
        .then(function (result) {
          $scope.projectsTab.projects = _.filter(result.data, function (project, key) {
            for (var i = project.experts.length - 1; i >= 0; i--) {
              if (project.experts[i].objectId === itemId || project.experts[i]._id === itemId) {
                return true;
              }
            };
            return false;
          });
          // parse the projectSpecificExpert in each project
          for(var i = $scope.projectsTab.projects.length - 1; i >= 0; i--) {
            for(var j = $scope.projectsTab.projects[i].projectSpecificExperts.length - 1; j >= 0; j--) {
              if($scope.projectsTab.projects[i].projectSpecificExperts[j].objectId === itemId) {
                $scope.projectsTab.projects[i].projectSpecificExperts = $scope.projectsTab.projects[i].projectSpecificExperts[j];
                break;
              }
            }
          }
          console.log('getProjects', $scope.projectsTab.projects);
        })
        .finally(function() {
          $scope.loading = false;
        });
    }
    getProjects();

    $scope.consultationsTab = {
      consultations: []
    };

    function getConsultations() {
      $scope.loading = true;
      if (path.indexOf('object') > -1) {
        // use objectId

        $http.get('/api/consultations')
          .then(function (result) {
            $scope.consultationsTab.consultations = _.filter(result.data, function (consultation, key) {
              if (consultation.expert._id === itemId || consultation.expert.objectId === itemId) {
                return true;
              }
              return false;
            });
            console.log('getConsultations', $scope.consultationsTab.consultations);
          })
          .finally(function() {
            $scope.loading = false;
          });

      } else {
        // use _id
        $http.get('/api/consultations')
          .then(function (result) {
            $scope.consultationsTab.consultations = _.filter(result.data, function (consultation, key) {
              if (consultation.expert._id === itemId || consultation.expert.objectId === itemId) {
                return true;
              }
              return false;
            });
            console.log('getConsultations', $scope.consultationsTab.consultations);
          })
          .finally(function() {
            $scope.loading = false;
          });
      }
    }
    getConsultations();

    // reduce Contact and project in projectCompliance
    function reduceExpert() {
      var tempArr = [];
      // reduce contact
      for(var i = 0; i < $scope.expert.contacts.length; i++){
        tempArr.push($scope.expert.contacts[i].objectId);
      }
      $scope.expert.contacts = tempArr;
      // reduce Project
      for(var i = 0; i < $scope.expert.projectCompliance.length; i++){
        if($scope.expert.projectCompliance[i].project){
          $scope.expert.projectCompliance[i].project = $scope.expert.projectCompliance[i].project._id;
        }
      }
    }

    /**
     * Edit expert bio modal
     */
    $scope.editBio = function (modalInstance, size) {
      $modalInstance = $modal.open({
        templateUrl: 'app/expert/edit-bio/edit-bio.html',
        controller: 'ExpertEditBioCtrl',
        size: size,
        resolve: {
          expert: function () {
            return $scope.expert;
          }
        }
      });

      $modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    /**
     * Compliance History related modal
     */
    $scope.addHistory = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'app/expert/add-history/add-history.html',
        controller: 'AddHistoryCtrl',
        size: size
      });

      modalInstance.result.then(function (newHistory) {
        $scope.expert.compliance.history.push(newHistory);
        $scope.updateData();
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
    $scope.editHistory = function (index, size) {
      var modalInstance = $modal.open({
        templateUrl: 'app/expert/edit-history/edit-history.html',
        controller: 'EditHistoryCtrl',
        size: size,
        resolve: {
          history : function () {
            return $scope.expert.compliance.history[index];
          }
        }
      });

      modalInstance.result.then(function (newHistory) {
        $scope.expert.compliance.history[index] = newHistory;
        $scope.updateData();
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
    /**
     * Compliance history selection
     */
    $scope.historyTab = {
      editMode: false,
      selectAllState: false,

      /**
       * Get selected consultation
       */
      getSelected: function () {
        return _.filter($scope.expert.compliance.history, function(history) {
          return history.selected;
        });
      },

      /**
       * Selects or unselects all consultation
       */
      selectAll: function ($event) {
        var self = this;
        $event.stopPropagation();
        _.each($scope.expert.compliance.history, function (history){
          self.select(history, self.selectAllState);
        });
      },

      select: function (history, toState) {
        var self = this;
        if (toState !== undefined) history.selected = toState;

        this.editMode = _.some($scope.expert.compliance.history, function (history){
          return history.selected;
        });

        console.log('Selected History', $scope.historyTab.getSelected());
      },

      delete: function () {
        var self = this;
        var selected = self.getSelected();
        $scope.expert.compliance.history = _.difference($scope.expert.compliance.history, selected);
        $scope.updateData();
        self.selectAllState = false;
      }

    };


    /**
     * Project Compliance related modal
     */
    $scope.addCompliance = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'app/expert/add-compliance/add-compliance.html',
        controller: 'AddComplianceCtrl',
        size: 'lg',
        resolve: {
          listOfProjects: function() {
            return $scope.projectsTab.projects;
          }
        }
      });

      modalInstance.result.then(function (newCompliance) {
        $scope.expert.projectCompliance.push(newCompliance);
        $scope.updateData();
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
    $scope.editCompliance = function (index, size) {
      var modalInstance = $modal.open({
        templateUrl: 'app/expert/edit-compliance/edit-compliance.html',
        controller: 'EditComplianceCtrl',
        size: 'lg',
        resolve: {
          compliance : function () {
            return $scope.expert.projectCompliance[index];
          },
          listOfProjects: function() {
            return $scope.projectsTab.projects;
          }
        }
      });

      modalInstance.result.then(function (newCompliance) {
        $scope.expert.projectCompliance[index] = newCompliance;
        $scope.updateData();
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
   /**
     * Compliance modal
     */
    $scope.complianceTab = {
      editMode: false,
      selectAllState: false,

      /**
       * Get selected consultation
       */
      getSelected: function () {
        return _.filter($scope.expert.projectCompliance, function(compliance) {
          return compliance.selected;
        });
      },

      /**
       * Selects or unselects all consultation
       */
      selectAll: function ($event) {
        var self = this;
        console.log(self.selectAllState);
        $event.stopPropagation();
        _.each($scope.expert.projectCompliance, function (compliance){
          self.select(compliance, self.selectAllState);
        });
      },

      /**
       * Selects single consultation
       * @consultation: consultation object
       * @toState: boolean; if defined, set selected state
       */
      select: function (compliance, toState) {
        var self = this;
        if (toState !== undefined) compliance.selected = toState;

        this.editMode = _.some($scope.expert.projectCompliance, function (compliance){
          return compliance.selected;
        });

        console.log('Selected Compliance', $scope.complianceTab.getSelected());
      },

      delete: function () {
        var self = this;
        var selected = self.getSelected();
        $scope.expert.projectCompliance = _.difference($scope.expert.projectCompliance, selected);
        $scope.updateData();
        self.selectAllState = false;
      }

    };
  });
