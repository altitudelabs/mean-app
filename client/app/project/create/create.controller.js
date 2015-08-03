'use strict';

angular.module('lynkApp')
  .controller('ProjectCreateCtrl', function ($scope, $rootScope, $modalInstance, $http, svcLookup, Auth) {

  // lookup and cache users
  svcLookup.users(function (items) {
    $scope.cachedUsers = items; console.log(items);
  });

  function inviteMyself() {
    var me = [];
    for (var i = $scope.cachedUsers.length - 1; i >= 0; i--) {
      if ($scope.cachedUsers[i].name === Auth.getCurrentUser().name) {
        me.push($scope.cachedUsers[i]);
      }
    }
    return me;
  }

  $scope.errors = {};

  $scope.newProject = {
    startDate: Date.now(),
    manager: Auth.getCurrentUser().name,
    status: 'New'
  };

  svcLookup.accounts(function (items) {
    $scope.cachedAccounts = items;
  });
  svcLookup.accountListIds(function (items) {
    $scope.cachedAccountListIds = items;
  })
  svcLookup.clients(function (items) {
    $scope.cachedClients = items;
  });
  svcLookup.regions(function (items) {
    $scope.cachedRegions = items;
  });
  svcLookup.industries(function (items) {
    $scope.cachedIndustries = items;
  });
  svcLookup.topics(function (items) {
    $scope.cachedTopics = items;
  });

  // look up how many projects created today
  svcLookup.projectCountToday(function (count) {
    $scope.cachedTodayCount = count;
  });


  function caseCode() {
    var code = "P";
    /*
     I think for projects we can use “P”+date (YYMMDD)+00,
     i.e. P15041301 where date is when the project comes in,

     for consultation we can use “C”+date+000 where date is the scheduled consultation date.
    */
    var pad = "00",
      today = new Date(),
      yy = today.getFullYear().toString().slice(2),
      mm = today.getMonth() + 1,
      dd = today.getDate();
    var paddedMonth = pad.substring(0, pad.length - mm.toString().length) + mm;
    var paddedDate = pad.substring(0, pad.length - dd.toString().length) + dd;
    var dateString = yy + paddedMonth + paddedDate;

    var newCount = $scope.cachedTodayCount + 1;

    code += dateString + pad.substring(0, pad.length - newCount.toString().length) + newCount;
    return code;
  }


  /**
   * Lookup client from backend
   */
  $scope.lookupClient = function(query){

    $scope.accountListId = null;

    // find name indexOf $scope.cachedAccountListIds.name
    if ($scope.newProject.account.length === 1) {
      for (var i = $scope.cachedAccountListIds.length - 1; i >= 0; i--) {
         // if either name is part of another, this is the right account and we have an individualId
         if ($scope.newProject.account[0].name.toLowerCase().indexOf($scope.cachedAccountListIds[i].name.toLowerCase()) > -1 ||
             $scope.cachedAccountListIds[i].name.toLowerCase().indexOf($scope.newProject.account[0].name.toLowerCase()) > -1) {
           $scope.accountListId = $scope.cachedAccountListIds[i].individualId;
           //console.log('account list id', $scope.accountListId);
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
   * Lookup industry
   */
  $scope.lookupIndustry = function(query){
    var items = $scope.cachedIndustries;
    var found = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].display.toLowerCase().match(query.toLowerCase())) {
        found.push(items[i]);
      }
    }
    return found;
  };

  /**
   * Lookup regions
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

  /**
   * Lookup account
   */
  $scope.lookupAccount = function(query){
    var items = $scope.cachedAccounts;
    var found = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i].name.toLowerCase().match(query.toLowerCase())) {
        found.push(items[i]);
      }
    }
    return found;
  };

  /**
   * Lookup topics
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
  $scope.ok = function (form) {
    $scope.errors = {};
    $scope.submitted = true;

    if (form.$valid) {
      var member = inviteMyself();
      $scope.newProject = _.extend($scope.newProject, {
        caseCode: caseCode(),
        members: member,
        manager: member[0]
      });
      console.log($scope.newProject);

      var cfg = {};
      var response = $http.post('/api/projects', { content: $scope.newProject }, cfg);
      response
        .success(function(dataFromServer, status, headers, config) {
          console.log(status);
          console.log(config);

          $rootScope.$emit('rootScope:emit', 'rootScope Emit');

          $scope.submitted = false;
          $modalInstance.close($scope.newProject);

        })
        .catch(function(err) {

          if (err) {
            $scope.errors = {};

            angular.forEach(err.data.errors, function (error, field) {

              form[field].$setValidity('mongoose', false);
              // $scope.errors[field] = error.message;

              console.log($scope.errors);

            });

          } else {
            $scope.submitted = false;
            $modalInstance.close($scope.newProject);
          }
      });

    }

  };

  /**
   * Dismiss modal
   */
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
