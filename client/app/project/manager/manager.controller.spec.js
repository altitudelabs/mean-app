'use strict';

describe('Controller: ProjectAddExpertCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectAddExpertCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectAddExpertCtrl = $controller('ProjectAddExpertCtrl', {
      $scope: scope
    });
  }));

  it('lookupExpert return JSON object', function () {
    var returnValue = $scope.lookupExpert('Melvin');
    expect(returnValue).toEqual(jasmine.any(Object));
  });
});
