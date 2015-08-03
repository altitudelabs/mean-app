'use strict';

describe('Controller: ProjectEditNameCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectEditNameCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectEditNameCtrl = $controller('ProjectEditNameCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
