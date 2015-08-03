'use strict';

describe('Controller: ProjectCreateCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectCreateCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectCreateCtrl = $controller('ProjectCreateCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
