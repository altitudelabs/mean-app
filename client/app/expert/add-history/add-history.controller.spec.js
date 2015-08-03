'use strict';

describe('Controller: AddHistoryCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var AddHistoryCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddHistoryCtrl = $controller('AddHistoryCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
