'use strict';

describe('Controller: InviteMemberCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var InviteMemberCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InviteMemberCtrl = $controller('InviteMemberCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
