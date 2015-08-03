'use strict';

describe('Controller: DeleteConfirmCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var DeleteConfirmCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DeleteConfirmCtrl = $controller('DeleteConfirmCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
