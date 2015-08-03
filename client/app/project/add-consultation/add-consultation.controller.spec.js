'use strict';

describe('Controller: ProjectAddConsultationCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectAddConsultationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectAddConsultationCtrl = $controller('ProjectAddConsultationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
