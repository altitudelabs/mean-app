'use strict';

describe('Controller: ProjectDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectDetailCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectDetailCtrl = $controller('ProjectDetailCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
