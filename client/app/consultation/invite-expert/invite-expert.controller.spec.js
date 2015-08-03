'use strict';

describe('Controller: InviteExpertCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var InviteExpertCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InviteExpertCtrl = $controller('InviteExpertCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
