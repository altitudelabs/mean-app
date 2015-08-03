'use strict';

describe('Controller: ProjectExpertBioCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectExpertBioCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectExpertBioCtrl = $controller('ProjectExpertBioCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
