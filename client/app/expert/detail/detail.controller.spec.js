'use strict';

describe('Controller: ExpertDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ExpertDetailCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExpertDetailCtrl = $controller('ExpertDetailCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
