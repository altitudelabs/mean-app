'use strict';

describe('Controller: ConsultationListCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ConsultationListCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ConsultationListCtrl = $controller('ConsultationListCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
