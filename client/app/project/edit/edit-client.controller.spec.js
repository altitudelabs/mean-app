'use strict';

describe('Controller: ProjectEditClientCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectEditAccountCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectEditAccountCtrl = $controller('ProjectEditAccountCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
