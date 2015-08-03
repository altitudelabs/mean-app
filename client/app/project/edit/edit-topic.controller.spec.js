'use strict';

describe('Controller: ProjectEditTopicCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ProjectEditTopicCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectEditTopicCtrl = $controller('ProjectEditTopicCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
