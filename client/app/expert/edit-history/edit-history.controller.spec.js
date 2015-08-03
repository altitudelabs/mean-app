'use strict';

describe('Controller: EditHistoryCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var EditHistoryCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditHistoryCtrl = $controller('EditHistoryCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
