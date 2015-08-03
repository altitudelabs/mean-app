'use strict';

angular.module('lynkApp')
  .controller('ProjectInviteMemberCtrl', function ($scope, $modalInstance, $log, $http, $rootScope, $location, cachedUsers) {

    $scope.cachedUsers = cachedUsers;

    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/' + itemId)
        .then(function (result) {
          $scope.project.members = result.data.members;
          $log.info('members found', $scope.project.members);
      });
    }

    /**
     * Lookup expert from backend
     */
    $scope.lookupMember = function(query){
      var items = $scope.cachedUsers;
      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].name.toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
    };

    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
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

    refreshData();

  });
