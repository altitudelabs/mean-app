'use strict';

describe('Controller: ExpertEditBioCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ExpertEditBioCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExpertEditBioCtrl = $controller('ExpertEditBioCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
