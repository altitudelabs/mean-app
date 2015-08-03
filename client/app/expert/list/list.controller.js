'use strict';

angular.module('lynkApp')
  .controller('ExpertListCtrl', function ($scope, $http) {
    // Scope variable used in controller
    $scope.searchQuery = {};
    $scope.experts = [];
    $scope.offset = 0;

    // variable used in pagination
    $scope.perPage = 50;
    $scope.totalExperts = 0;
    $scope.currentPage = 1;
    $scope.totalPages = 0;

    // querying OR = Any; AND = All
    $scope.searchQuery.queryModeOr = false;

    // variables used in sorting
    $scope.orderByField = 'name';
    $scope.reverseSort = 1;

    $scope.setQueryOr = function (value) {
      $scope.searchQuery.queryModeOr = value;
      $scope.focusInput = true; // always focus back on search input
      console.log('queryModeOr is', $scope.searchQuery.queryModeOr);
      $scope.pageChanged();
    };
    $scope.setOrder = function () {
      if($scope.reverseSort === 1){
        $scope.reverseSort = -1;
      } else {
        $scope.reverseSort = 1;
      }
    }
    $scope.pageChanged = function() {
      $scope.loading = true;
      getResultsPage();
      countResult();
      $scope.totalPages = Math.ceil($scope.totalExperts / $scope.perPage);
    };

    $scope.clear = function() {
      $scope.searchQuery.name = '';
      $scope.searchQuery.company= '';
      $scope.searchQuery.location = '';
      $scope.searchQuery.status = '';
      $scope.focusInput = true;
      $scope.pageChanged();
    }
    function getResultsPage() {
      console.log("Fetch result page: " + $scope.currentPage);
      $scope.offset = ($scope.currentPage - 1) * $scope.perPage;
      if(checkStr($scope.searchQuery.name) || checkStr($scope.searchQuery.company) || checkStr($scope.searchQuery.location) || checkStr($scope.searchQuery.status)){
        $http.get('/api/experts/search/' + JSON.stringify($scope.searchQuery) + '/skip/' + $scope.offset + '/field/' + $scope.orderByField + '/sort/'+ $scope.reverseSort)
        .then(function(result) {
          $scope.experts = result.data;
        })
        .finally(function() {
          $scope.loading = false;
        });
      } else {
        $http.get('/api/experts/skip/' + $scope.offset + '/limit/' + $scope.perPage + '/field/' + $scope.orderByField + '/sort/'+ $scope.reverseSort)
        .then(function(result) {
          $scope.experts = result.data;
        })
        .finally(function() {
          $scope.loading = false;
        });
      }

    }

    function countResult() {
      if(checkStr($scope.searchQuery.name) || checkStr($scope.searchQuery.company) || checkStr($scope.searchQuery.location) || checkStr($scope.searchQuery.status)){
        $http.get('/api/experts/searchCount/' + JSON.stringify($scope.searchQuery)).then(function(result) {
          $scope.totalExperts = result.data.count;
        });
      } else {
        $http.get('/api/experts/count').then(function(result) {
          $scope.totalExperts = result.data.count;
        });
      }
    }

    function checkStr(str) {
      return !(!str || 0 === str.length || /^\s*$/.test(str));
    }

    // initial call for data
    $scope.pageChanged();

    $scope.$watch('currentPage', function() {
      $scope.pageChanged();
    });
  });
