'use strict';

describe('Controller: AddComplianceCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var AddComplianceCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddComplianceCtrl = $controller('AddComplianceCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
