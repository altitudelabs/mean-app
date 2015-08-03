'use strict';

describe('Controller: ExpertListCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ExpertListCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExpertListCtrl = $controller('ExpertListCtrl', {
      $scope: scope
    });
  }));

  it('Set query mode to OR(true)', function () {
    $scope.setQueryOr(true);
    expect($scope.searchQuery.queryModeOr).toEqual(true);
    expect($scope.focusInput).toEqual(true);
  });

  it('Set query mode to AND(false)', function () {
    $scope.setQueryOr(false);
    expect($scope.searchQuery.queryModeOr).toEqual(false);
    expect($scope.focusInput).toEqual(true);
  });

  it('Clear search input field properly', function () {
    $scope.searchQuery.name = 'dummy name';
    $scope.searchQuery.company= 'dummy company';
    $scope.searchQuery.location = 'dummy location';
    $scope.searchQuery.status = 'dummy status';
    $scope.clear();
    expect($scope.searchQuery.name).toEqual('');
    expect($scope.searchQuery.name).toEqual(jasmine.any(String));
    expect($scope.searchQuery.company).toEqual('');
    expect($scope.searchQuery.company).toEqual(jasmine.any(String));
    expect($scope.searchQuery.location).toEqual('');
    expect($scope.searchQuery.location).toEqual(jasmine.any(String));
    expect($scope.searchQuery.status).toEqual('');
    expect($scope.searchQuery.status).toEqual(jasmine.any(String));
  })

});
