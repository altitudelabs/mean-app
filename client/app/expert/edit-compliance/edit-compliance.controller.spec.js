'use strict';

describe('Controller: EditComplianceCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var EditComplianceCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditComplianceCtrl = $controller('EditComplianceCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
