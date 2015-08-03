'use strict';

describe('Controller: InviteClientCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var InviteClientCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InviteClientCtrl = $controller('InviteClientCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
