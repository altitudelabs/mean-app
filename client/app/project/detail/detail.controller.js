'use strict';

angular.module('lynkApp')
  .controller('ProjectDetailCtrl', function ($scope, $rootScope, $http, $modal, $log, $location, svcLookup, Auth, Consultation) {

    $scope.isAdmin = Auth.isAdmin;

    var modalInstance;
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    $scope.lookupExpert = function (query) {
      return $http.get('/api/experts/name/' + query);
    }
    // lookup and cache experts
    svcLookup.experts(function (items) {
      $scope.cachedExperts = items;
    });
    // lookup and cache users
    svcLookup.users(function (items) {
      $scope.cachedUsers = items;
    });
    // lookup and cache regions
    svcLookup.regions(function (items) {
      $scope.cachedRegions = items;
    });

    /**
     * Refresh data from model
     */
    function refreshData() {
      $scope.loading = true;
      $scope.project = {};

      $http.get('/api/projects/' + itemId)
        .then(function (result) {
          $scope.project = result.data;
          // map the info in projectSpecificExperts to expert
          for(var i = 0; i < $scope.project.experts.length; i++){
            var projectStatus = $scope.project.projectSpecificExperts[mapExperts($scope.project.experts[i].objectId)];
            if(projectStatus.statusInProject) {$scope.project.experts[i].statusInProject = projectStatus.statusInProject;}
            if(projectStatus.addedBy) {$scope.project.experts[i].addedBy = projectStatus.addedBy;}
            if(projectStatus.history) {$scope.project.experts[i].history = projectStatus.history;}
            if(projectStatus.experience) {$scope.project.experts[i].experience = projectStatus.experience;}
            if(projectStatus.notes) {$scope.project.experts[i].notes = projectStatus.notes;}
            if(projectStatus.country) {$scope.project.experts[i].country = projectStatus.country;}
            if(projectStatus.partnerRef) {$scope.project.experts[i].partnerRef = projectStatus.partnerRef;}
          }
          // map the projectSpecificExperts consultation.expert
          for(var i = 0; i < $scope.project.consultations.length; i++){
            var index = mapExperts($scope.project.consultations[i].expert.objectId);
            if(index > -1 ) {
              if($scope.project.projectSpecificExperts[index].partnerRef) {$scope.project.consultations[i].expert.partnerRef = $scope.project.projectSpecificExperts[index].partnerRef;}
            }
          }
          $scope.project.startDate = new Date($scope.project.startDate);
          $log.info('refreshData', $scope.project);
          //refreshExperts();
        })
        .finally(function() {
          $scope.loading = false;
        });
    }

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
     *    - partnerRef        - sentDate (when expert is assigned statusInProject = 'sent')
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
          if($scope.project.experts[i].sentDate) {$scope.project.projectSpecificExperts[index].sentDate = $scope.project.experts[i].sentDate;}
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
    // Old remote expert function, replaced by populate data
    /**
    function refreshExperts() {
      $scope.tempExperts = $scope.project.experts;
      $scope.project.experts = [];
      for(var i = 0; i < $scope.tempExperts.length; i++) {
        $http.get('/api/experts/object/' + $scope.tempExperts[i])
          .then(function (result) {
            $log.info('Remote expert')
          })
      }
    }
    function getProjectBiosNotes(expert) {
      console.log("Recover bio and notes of " + expert.name);
      for(var i = 0; i < expert.projectBios.length; i++) {
        if(expert.projectBios[i].projectId === itemId) {
          if(expert.projectBios[i].bio.experience) expert.experience = expert.projectBios[i].bio.experience;
          if(expert.projectBios[i].bio.history) expert.history = expert.projectBios[i].bio.history;
          if(expert.projectBios[i].bio.country) expert.country = expert.projectBios[i].bio.country;
          console.log("Recover bio of " + expert.name);
          break;
        }
      }
      for(var i = 0; i < expert.projectNotes.length; i++) {
        if(expert.projectNotes[i].projectId === itemId) {
          expert.notes = expert.projectNotes[i].text;
          console.log("Recover notes of " + expert.name);
          break;
        }
      }
      return expert;
    } **/

    /**
     * Refresh Data and ContactInfo views
     */
    $rootScope.$on('rootScope:emit', function (event, args) {
      refreshData();
    });


    /**
     * Returns appropriate title for expert
     */
    $scope.getTitle = function (expert) {
      if (expert.title && expert.company) {
        return expert.title + '(' + expert.company + ')';
      } else if (expert.title) {
        return expert.title;
      } else if (expert.company) {
        return expert.company;
      } else if (expert.summary) {
        return expert.summary;
      } else {
        return 'N/A';
      }
    }

    /**
     * Performs update to database
     */
    $scope.updateData = function () {
      reduceData();
      $http.put('/api/projects/' + itemId, $scope.project)
        .then(function (result) {
          console.log('updated', result);
      });
    };

    $scope.patchData = function () {
      reduceData();
      $http.patch('/api/projects/' + itemId, $scope.project)
          .then(function (result) {
            // console.log('patched', result);
            $rootScope.$emit('rootScope:emit', 'rootScope Emit');
        });
    }

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
     * Set project status
     */
    $scope.setStatus = function (status) {
      $scope.project.status = status;
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

    $scope.isCollaborator = function () {
      var iamCollaborating = false;
      var me = Auth.getCurrentUser();
      if ($scope.project.members) {
        for (var i = 0; i < $scope.project.members.length; i++) {
          if ($scope.project.members[i].name === me.name) {
            iamCollaborating = true;
            break;
          }
        }
      }
      return iamCollaborating;
    };

    $scope.joinProject = function () {
      $scope.project.members.push(Auth.getCurrentUser());
      console.log($scope.project.members);

      $scope.patchData();
    };

    $scope.leaveProject = function () {
      var myIndex;
      var me = Auth.getCurrentUser();
      if($scope.project.members.length === 1){
        return;
      }
      if ($scope.project.members) {
        for (var i = 0; i < $scope.project.members.length; i++) {
          if ($scope.project.members[i].name === me.name) {
            myIndex = i;
            break;
          }
        }
      }

      $scope.project.members.splice(myIndex, 1);
      $scope.patchData();
    };

    /**
     * Open project manager modal
     */
     $scope.projectManager = function(size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/manager/manager.html',
        controller: 'ProjectManagerCtrl',
        size: size,
        resolve: {
          project: function () {
            return $scope.project;
          }
        }
      });
      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
     }

    /**
     * Open rename project name modal
     */
    $scope.renameProject = function (size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/edit/edit-name.html',
        controller: 'ProjectEditNameCtrl',
        size: size,
        resolve: {
          project: function () {
            return $scope.project;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    /**
     * Invite member to project modal
     */
    $scope.inviteMember = function (cachedUsers, size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/invite-member/invite-member.html',
        controller: 'ProjectInviteMemberCtrl',
        size: size,
        resolve: {
          // project: function () {
          //   return $scope.project;
          // }
          cachedUsers: function () {
            return $scope.cachedUsers;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };


    /**
     * Open edit account modal
     */
    $scope.editAccount = function (Account, size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/edit/edit-account.html',
        controller: 'ProjectEditAccountCtrl',
        size: size,
        resolve: {
          // items: function () {
          //   return $scope.items;
          // }
          Account: function () {
            return $scope.project.account;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
    /**
     * Open edit client modal
     */
    $scope.editClient = function (Account, size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/edit/edit-client.html',
        controller: 'ProjectEditClientCtrl',
        size: size,
        resolve: {
          // items: function () {
          //   return $scope.items;
          // }
          Account: function () {
            return $scope.project.account;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    /**
     * Open edit region modal
     */
    $scope.editRegion = function (size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/edit/edit-region.html',
        controller: 'ProjectEditRegionCtrl',
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

    /**
     * Open edit office modal
     */
    $scope.editOffice = function (size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/edit/edit-office.html',
        controller: 'ProjectEditOfficeCtrl',
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

    /**
     * Open edit industry modal
     */
    $scope.editIndustry = function (size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/edit/edit-industry.html',
        controller: 'ProjectEditIndustryCtrl',
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

    /**
     * Open edit topic modal
     */
    $scope.editTopic = function (size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/edit/edit-topic.html',
        controller: 'ProjectEditTopicCtrl',
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

    /**
     * Add expert modal
     */
    $scope.addExpert = function (cachedExperts, size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/add-expert/add-expert.html',
        controller: 'ProjectAddExpertCtrl',
        size: size,
        resolve: {
          cachedExperts: function () {
            return $scope.cachedExperts;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    /**
     * Add consultation modal
     */
    $scope.addConsultation = function (thisProject, size) {
      modalInstance = $modal.open({
        templateUrl: 'app/project/add-consultation/add-consultation.html',
        controller: 'ProjectAddConsultationCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          },
          thisProject: function () {
            return $scope.project;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
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

    refreshData();

    /**
     * Experts Tab
     */
    $scope.expertsTab = {
      editMode: false,
      selectAllState: false,

      expertsCount: function (status) {
        var count = 0;
        _.each($scope.project.experts, function(expert) {
          if (expert.statusInProject === status) count++;
        });
        return count;
      },

      /**
       * Get selected experts
       */
      getSelected: function () {
        return _.filter($scope.project.experts, function(expert){
          return expert.selected;
        });
      },

      /**
       * Selects or unselects all experts
       */
      selectAll: function ($event) {
        var self = this;
        $event.stopPropagation();
        _.each($scope.project.experts, function (expert){
          self.select(expert, self.selectAllState);
        });
      },

      /**
       * Selects single expert
       * @expert: expert object
       * @toState: boolean; if defined, set selected state
       */
      select: function (expert, toState) {
        var self = this;
        if (toState !== undefined) expert.selected = toState;

        this.editMode = _.some($scope.project.experts, function (expert){
          return expert.selected;
        });

        console.log('Selected experts', $scope.expertsTab.getSelected());
        self.preCopyBiosToClipboard();
      },


      selectExpertsWithStatus: function (status) {
        var self = this;
        _.each($scope.project.experts, function (expert) {
          self.select(expert, false);

          if (expert.statusInProject === status.toLowerCase()) {
            self.select(expert, true);
          }
        });
      },

      updateExpertStatus: function (status) {
        var self = this;
        var experts = self.getSelected();
        _.each(experts, function (expert) {
          expert.statusInProject = status.toLowerCase();
          if (expert.statusInProject === 'sent') {
            expert.sentDate = new Date();
          }
          expert.selected = false;
        });

        $scope.patchData();
        self.selectAllState = false;
      },

      // formats bio to specification
      prepareBio: function(expert) {
        console.log('prepareBio', expert);
        var bio = 'Knowledge Partner ' + expert.partnerRef + ': ' + expert.name + '\n';

        if (expert.company) bio += 'Company: ' + expert.company + '\n';
        if (expert.history) bio += 'Employment History:\n' + expert.history + '\n\n';
        if (expert.experience) bio += 'Relevant Experience:\n' + expert.experience + '\n\n';
        if (expert.country && expert.country.length) {
          bio += 'Country:';
          for (var i = expert.country.length - 1; i >= 0; i--) {
             bio += ' ' + expert.country[i].display + ','
          };
          bio = bio.slice(0, -1); // remove last comma
          bio += '\n';
        }

        return bio;
      },

      // copies bios in background so copy to clipboard is quick
      preCopyBiosToClipboard: function () {
        console.log('preCopyBiosToClipboard');
        var self = this;
        var bios = '';
        var experts = self.getSelected();
        // concat all bios from selected experts
        _.each(experts, function (expert) {
          var expertBio = self.prepareBio(expert);
          if (expertBio) {
            bios += '\n\n' + expertBio + '\n---\n';
          } else {
            bios += '\n\nNo Bio found.\n---\n';
          }
        });
        // copy to clipboard
        $scope.textToCopy = bios;
      },

      deleteExperts: function () {
        var self = this;
        var experts = self.getSelected();
        for (var i = experts.length - 1; i >= 0; i--) {
          var index = mapExperts(experts[i].objectId);
          var deleteCon = [];
          // remove expert data in project
          $scope.project.projectSpecificExperts.splice(index,1);
          // also delete related consultations
          for(var j = 0; j < $scope.project.consultations.length; j++) {
            if($scope.project.consultations[j].expert.objectId === experts[i].objectId) {
              var consultationID = $scope.project.consultations[j].objectId;
              deleteCon.push($scope.project.consultations[j]);
              // in mongo
              $http.delete('/api/consultations/object/' + consultationID)
                .then(function() {
                  console.log('Remove consultation of expert');
                })
            }
          }
          $scope.project.consultations = _.difference($scope.project.consultations, deleteCon);
        };
        $scope.project.experts = _.difference($scope.project.experts, experts);
        $scope.patchData();
      },

      /**
       * Opens bio modal
       */
      bioModal: function (expert, project, cachedRegions) {
        modalInstance = $modal.open({
          templateUrl: 'app/project/expert/bio/bio.html',
          controller: 'ProjectExpertBioCtrl',
          resolve: {
            expert: function () {
              // project level
              return expert;
            },
            project: function () {
              return project;
            },
            cachedRegions: function () {
              return $scope.cachedRegions;
            }
          }
        });

        modalInstance.result
          .then(function (selectedItem) {
            $scope.selected = selectedItem;
          }, function () {
            $log.info('Modal dismissed at: ' + new Date());
          })
          .finally(function () {
            // update bio precopy
            $scope.expertsTab.preCopyBiosToClipboard();
          });
      },

      /**
       * Opens notes modal
       */
      notesModal: function (expert, project, size) {
        modalInstance = $modal.open({
          templateUrl: 'app/project/expert/notes/notes.html',
          controller: 'ProjectExpertNotesCtrl',
          size: size,
          resolve: {
            expert: function () {
              return expert;
            },
            project: function () {
              return project;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      }
    };


    /**
     * Consultations Tab
     */
    $scope.consultationsTab = {
      editMode: false,
      selectAllState: false,

      count: function (status) {
        var count = 0;
        if(status === 'sent to accounting') status = 'accounting';
        if(status === 'cancelled by client') status = 'cancelclient';
        if(status === 'cancelled by expert') status = 'cancelexpert';
        _.each($scope.project.consultations, function(consultation) {
          if (consultation.statusInProject === status) count++;
        });
        return count;
      },

      /**
       * Get selected consultation
       */
      getSelected: function () {
        return _.filter($scope.project.consultations, function(consultation) {
          return consultation.selected;
        });
      },

      /**
       * Selects or unselects all consultation
       */
      selectAll: function ($event) {
        var self = this;
        $event.stopPropagation();
        _.each($scope.project.consultations, function (consultation){
          self.select(consultation, self.selectAllState);
        });
      },

      /**
       * Selects single consultation
       * @consultation: consultation object
       * @toState: boolean; if defined, set selected state
       */
      select: function (consultation, toState) {
        var self = this;
        if (toState !== undefined) consultation.selected = toState;

        this.editMode = _.some($scope.project.consultations, function (consultation){
          return consultation.selected;
        });

        console.log('Selected consultations', $scope.consultationsTab.getSelected());
      },


      selectWithStatus: function (status) {
        var self = this;
        _.each($scope.project.consultations, function (consultation) {
          self.select(consultation, false);

          if (consultation.statusInProject === status.toLowerCase()) {
            self.select(consultation, true);
          }
        });
      },

      updateStatus: function (status) {
        var self = this;
        var consultations = self.getSelected();
        _.each(consultations, function (consultation) {
          consultation.statusInProject = status.toLowerCase();

          if (consultation.statusInProject === 'completed') {
            consultation.completedDate = new Date();
          }
          if (consultation.statusInProject === 'accounting') {
            consultation.accountDate = new Date();
          }
          consultation.selected = false;
          // we are not patching the project as consultations are populated!
          // so we need to patch the consultation instead of project
          // reduce the expert to id!
          consultation.expert = consultation.expert.objectId;
          $http.patch('/api/consultations/object/' + consultation.objectId, consultation)
            .then(function(result){
              console.log('Consultation patch successful');
            });
        });
        //$scope.patchData();
        refreshData();
        self.selectAllState = false;
      },

      delete: function () {
        var self = this;
        var consultations = self.getSelected();

        // propagate delete to system level
        for (var i = consultations.length - 1; i >= 0; i--) {
          Consultation.delete({objectId: consultations[i].objectId});
        };

        $scope.project.consultations = _.difference($scope.project.consultations, consultations);
        $scope.patchData();
      }

    };

  });
