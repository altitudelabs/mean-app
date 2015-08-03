'use strict';

describe('Controller: AccountDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var AccountDetailCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AccountDetailCtrl = $controller('AccountDetailCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
