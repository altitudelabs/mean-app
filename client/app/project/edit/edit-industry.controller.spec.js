'use strict';

describe('Controller: ProjectEditIndustryCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectEditIndustryCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectEditIndustryCtrl = $controller('ProjectEditIndustryCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
