'use strict';

angular.module('lynkApp')
  .controller('SidebarCtrl', function ($scope, $location, Auth) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.isActive = function(route) {
      var currentRoute = $location.path();
      return currentRoute.indexOf(route) === 0;
    };
  });