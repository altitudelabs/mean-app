'use strict';

angular.module('lynkApp')
  .controller('ProjectAddConsultationCtrl', function ($scope, $modalInstance, $http, $location, $rootScope, thisProject, Consultation, svcLookup) {

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    $scope.project = thisProject;
    //$scope.$index = $scope.project.consultations.length;

    svcLookup.accountListIds(function (items) {
      $scope.cachedAccountListIds = items;
    })
    svcLookup.clients(function (items) {
      $scope.cachedClients = items;
    });

    $scope.thisCon = {};

    /**
     * Lookup expert from project
     */
    $scope.lookupExpert = function (query) {
      var items = $scope.project.experts;
      // take only selected experts
      items = _.filter(items, {'statusInProject': 'selected'});

      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].name.toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
    };

    /**
     * Lookup client from project
     */
    $scope.lookupClient = function (query) {
      // var chosenAccount = $scope.thisProject.account;
      // if (chosenAccount && chosenAccount[0].contacts) {
      //   var items = chosenAccount[0].contacts;
      //   var found = [];
      //   for (var i = 0, len = items.length; i < len; i++) {
      //     if (items[i].properties.name) {
      //       if (items[i].properties.name[0].value.toLowerCase().match(query.toLowerCase())) {
      //         found.push({
      //           objectId: items[i].objectId,
      //           name: items[i].properties.name[0].value,
      //           properties: items[i].properties
      //         });
      //       }
      //     }
      //   }
      //   return found;
      // } else {
      //   return [{ name: 'No clients found in this account' }];
      // }
      $scope.accountListId = null;

      // find name indexOf $scope.cachedAccountListIds.name
      if ($scope.project.account.length === 1) {
        for (var i = $scope.cachedAccountListIds.length - 1; i >= 0; i--) {
          // if either name is part of another, this is the right account and we have an individualId
          if ($scope.project.account[0].name.toLowerCase().indexOf($scope.cachedAccountListIds[i].name.toLowerCase()) > -1 ||
              $scope.cachedAccountListIds[i].name.toLowerCase().indexOf($scope.project.account[0].name.toLowerCase()) > -1) {
            $scope.accountListId = $scope.cachedAccountListIds[i].individualId;
            // console.log('account list id', $scope.accountListId);
            break;
          }
        };

        var items = $scope.cachedClients;
        var found = [];
        for (var i = 0, len = items.length; i < len; i++) {
          if ( items[i].listId === $scope.accountListId &&
               items[i].name.toLowerCase().match(query.toLowerCase()) ) {
            found.push(items[i]);
          }
        }
        return found;

      } else {
        return [];
      }
    };

    /**
     * Lookup expert's project compliance
     */
    $scope.lookupCompliance = function(){
      if($scope.thisCon.expert){
        var items = $scope.project.experts;
        // take only selected experts
        items = _.filter(items, {'statusInProject': 'selected'});
        var found = {};
        for (var i = 0, len = items.length; i < len; i++) {
          if (items[i].name.match($scope.thisCon.expert.name)) {
            found = items[i];
            break;
          }
        }
        var compliance = [];
        for (var i = 0, len = found.projectCompliance.length; i < len; i++) {
          if(found.projectCompliance[i].project === itemId){
            compliance.push(found.projectCompliance[i]);
          }
        }
        return compliance;
      } else {
        return [];
      }
    };
    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    /**
     * Submit form and close modal
     */
    $scope.ok = function (form) {
      $scope.errors = {};
      $scope.submitted = true;

      if (form.$valid) {
        /**
        for (var i = $scope.thisProject.consultations.length - 1; i >= 0; i--) {
          $scope.thisProject.consultations[i].objectId = $scope.thisProject.consultations[i].objectId || newObjectId();

          if (!$scope.thisProject.consultations[i].statusInProject) {
            $scope.thisProject.consultations[i].selectedDate = new Date();
          }

          $scope.thisProject.consultations[i].statusInProject = $scope.thisProject.consultations[i].statusInProject || 'selected';
        }
        // console.log('thisProject clientCaseCode', $scope.thisProject.clientCaseCode);**/
        reduceData();
        var newConsultationId = newObjectId();
        var newDate = new Date();
        var newCon = {
          project: $scope.project._id,
          selectedDate: newDate,
          objectId: newConsultationId,
          clients: $scope.thisCon.clients,
          expert: $scope.thisCon.expert.objectId,
          name: $scope.thisCon.name,
          statusInProject: 'selected',
          account: $scope.project.account,
          hourlyRate: { currency: 'USD$'}
        };
        if($scope.thisCon.compliance){
          newCon.compliance = $scope.thisCon.compliance;
        }
        console.log('newCon', newCon);
        $http.post('/api/consultations/', newCon)
          .then(function(result){
            console.log('newConsult saved');
            // update project
            $scope.project.consultations.push(result.data._id);
            $http.patch('/api/projects/' + itemId, $scope.project)
              .then(function() {
                // delete the compliance in expert if temp compliance is used
                if($scope.thisCon.compliance){
                  var index = _.findIndex($scope.thisCon.expert.projectCompliance, function(item){
                    return item.referenceId === $scope.thisCon.compliance.referenceId;
                  });
                  if(index > -1){
                    var remove = $scope.thisCon.expert.projectCompliance.splice(index,1);
                    $http.patch('/api/experts/object/' + $scope.thisCon.expert.objectId, $scope.thisCon.expert)
                    .then(function(){
                      $rootScope.$emit('rootScope:emit', 'rootScope Emit');
                      $modalInstance.close($scope.project);
                    });
                  }
                } else {
                  $rootScope.$emit('rootScope:emit', 'rootScope Emit');
                  $modalInstance.close($scope.project);
                }
              });
          });
      }

    };

    /**
     * When consultation is saved in project, we propagate to create consultation system level
     */
    function propagateChange (objectId) {
      var newDate = new Date();
      var newCon = new Consultation(
        { project: $scope.project._id,
          selectedDate: newDate,
          objectId: objectId,
          clients: $scope.thisCon.clients,
          expert: $scope.thisCon.expert.objectId,
          name: $scope.thisCon.name
        });
      console.log('newCon', newCon);

      newCon.$save(function(c) {
        console.log('newConsult saved', c);
      });

      $rootScope.$emit('rootScope:emit', 'rootScope Emit');
    }

    function newObjectId() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < 15; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
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

  })
  .filter('propsFilter', function() {
    return function(items, props) {
      var out = [];

      if (angular.isArray(items)) {
        items.forEach(function(item) {
          var itemMatches = false;

          var keys = Object.keys(props);
          for (var i = 0; i < keys.length; i++) {
            var prop = keys[i];
            var text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }

          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }
      return out;
    }
  })
  .filter('projectFilter', function() {
    return function(items, id){
      var out = [];
      if (angular.isArray(items)) {
        items.forEach(function(item) {
          var itemMatches = false;
          if(item.project === id){
            out.push(item);
          }
        });
      } else {
        // Let the output be the input untouched
        out = items;
      }
      return out;
    }
  });