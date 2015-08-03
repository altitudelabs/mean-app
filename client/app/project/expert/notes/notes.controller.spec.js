'use strict';

describe('Controller: ProjectExpertNotesCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectExpertNotesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectExpertNotesCtrl = $controller('ProjectExpertNotesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
