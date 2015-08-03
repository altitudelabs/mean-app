'use strict';

angular.module('lynkApp')
  .controller('ProjectExpertNotesCtrl', function ($scope, $modalInstance, $http, $rootScope, $location, expert, project, Expert) {

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    $scope.project = project;
    $scope.expert = expert;

    /**
     * When notes is saved, we propagate to expert's notes to system level
     */
    function propagateChange(result) {
      // console.log('patched', result);
      var experts = result.config.data.experts;
      // console.log(experts);

      if (experts) {

        angular.forEach(experts, function(expert, key) {
          // console.log(key); // 0, 1, ...
          // console.log(expert); // expert

          var updated = Expert.get({objectId: expert.objectId}, function() {

            var pushOrReplace = function (notes, newNote) {
              var projectSpecificNote = {
                projectId: $scope.project._id,
                projectName: $scope.project.name,
                text: newNote
              };

              var indexFound = _.findIndex(notes, function(note) { return note.projectId === $scope.project._id });

              // if we find it already exists at system level
              if (indexFound !== -1) {
                notes[indexFound] = projectSpecificNote;

              } else {

                notes.push(projectSpecificNote);
              }

              return notes;
            };

            updated.projectNotes = pushOrReplace(updated.projectNotes, expert.notes);
            updated.$patch();

          });

        });

      }

      $rootScope.$emit('rootScope:emit', 'rootScope Emit');
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
     * Submit form and close modal
     */
    $scope.ok = function () {
      // console.log('bio controller', $scope.project);
      reduceData();
      $http.patch('/api/projects/' + itemId, $scope.project)
        .then(function (result) {
          console.log('updated', result);
          $rootScope.$emit('rootScope:emit', 'rootScope Emit');
        });
      $modalInstance.close($scope.expert);
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
