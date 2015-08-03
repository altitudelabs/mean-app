'use strict';

angular.module('lynkApp')
  .controller('ProjectExpertBioCtrl', function ($scope, $modalInstance, $rootScope, $http, $location, expert, project, cachedRegions, Expert) {

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    $scope.project = project;
    $scope.expert = expert;
    $scope.cachedRegions = cachedRegions;

    /**
     * Lookup region from backend
     */
    $scope.lookupRegion = function(query){
      var items = $scope.cachedRegions;
      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].display.toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
    };
    $scope.lookupRegionID = function(query) {
      var items = $scope.cachedRegions;
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].objectId === query) {
          return items[i];
        }
      }
      return {};
    }
    /**
     * Lookup region from backend
     *
    $scope.lookupRegion = function (query) {
      var items = $scope.cachedRegions;
      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].display.toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
    };**/

    /**
     * When bio is saved, we propagate to expert's bio to system level
     */
    function propagateChange(result) {
      // console.log('patched', result);
      var experts = result.config.data.experts;
      // console.log(experts);

      if (experts) {

        angular.forEach(experts, function (expert, key) {
          var updated = Expert.get({objectId: expert.objectId}, function() {

            var pushOrReplace = function (bios, newBio) {

              var projectSpecificBio = _.extend({

                projectId: $scope.project._id,
                projectName: $scope.project.name

              }, { bio: newBio });

              var indexFound = _.findIndex(bios, function(bio) { return bio.projectId === $scope.project._id });

              // if we find it already exists at system level
              if (indexFound !== -1) {
                bios[indexFound] = projectSpecificBio;

              } else {

                bios.push(projectSpecificBio);
              }

              return bios;
            };

            var newBio = {
              company: expert.company,
              country: expert.country,
              history: expert.history,
              experience: expert.experience,
              general: expert.bio
            };

            updated.projectBios = pushOrReplace(updated.projectBios, newBio);
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
      $scope.expert.selected = false;
      console.log($scope.expert);
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

    // https://github.com/monospaced/angular-elastic#how-it-works
    $rootScope.$broadcast('elastic:adjust');

    function randomId() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i=0; i < 15; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
    }

    function prePopulate() {
      if ($scope.expert.relateIQ) {
        if (!$scope.expert.company) $scope.expert.company = $scope.expert.relateIQ.company;
        if (!$scope.expert.country.length && $scope.expert.relateIQ.country) {
          var country = $scope.lookupRegionID($scope.expert.relateIQ.country);
          if(country){
             $scope.expert.country.push(country);
          }
          if($scope.expert.relateIQ.location){
            var location = $scope.lookupRegion($scope.expert.relateIQ.location);
            if(location.length){
              $scope.expert.country.push(location[0]);
            } else {
              $scope.expert.country.push({
                "objectId": randomId(),
                "display": $scope.expert.relateIQ.location
              });
            }
          }
        }

        if (!$scope.expert.experience) $scope.expert.experience = $scope.expert.relateIQ.experience;
        if (!$scope.expert.history) $scope.expert.history = $scope.expert.relateIQ.history;
      }
    }

    // only prepopulate if info not exist
    prePopulate();


  });
