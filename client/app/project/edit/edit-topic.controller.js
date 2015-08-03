'use strict';

angular.module('lynkApp')
  .controller('ProjectEditTopicCtrl', function ($scope, $rootScope, $http, $log, $location, $modalInstance, svcLookup) {
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    function refreshData() {
      $scope.project = {};

      $http.get('/api/projects/'+itemId)
        .then(function (result) {
          $scope.project.topics = result.data.topics;

          $log.info($scope.project.topics);
      });

      // lookup and cache topics
      svcLookup.topics(function (items) {
        $scope.cachedTopics = items;
      });
    }

    refreshData();

    /**
     * Lookup topic from backend
     */
    $scope.lookupTopic = function(query){
      var items = $scope.cachedTopics;
      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
    };

    /**
     * Submit form and close modal
     */
    $scope.ok = function () {
      $log.info($scope.project);

      $http.patch('/api/projects/' + itemId, $scope.project)
        .then(function (result) {
          $log.info('updated', result);

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
  });
