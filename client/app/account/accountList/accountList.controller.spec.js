'use strict';

describe('Controller: AccountListCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var AccountListCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AccountListCtrl = $controller('AccountListCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
