'use strict';

angular.module('lynkApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, Account) {

    // Selected users
    $scope.selected = {};

    $scope.users = User.query();
    $scope.accounts = Account.query();

    $scope.isAdmin = Auth.isAdmin();


    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.changeRole = function(user, newRole) {
      User.update({ _id: user._id, role: newRole });
    };

    $scope.statuses = [
      {value: 'admin', text: 'Admin'},
      {value: 'am', text: 'Account Manager'},
      {value: 'researcher', text: 'Researcher'}
    ];
  });
