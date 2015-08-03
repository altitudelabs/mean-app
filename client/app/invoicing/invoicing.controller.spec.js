'use strict';

describe('Controller: InvoicingCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var InvoicingCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvoicingCtrl = $controller('InvoicingCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
