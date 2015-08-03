'use strict';

describe('Controller: ConsultationDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('lynkApp'));

  var ConsultationDetailCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ConsultationDetailCtrl = $controller('ConsultationDetailCtrl', {
      $scope: scope
    });
  }));

  it('Sign the TNC properly', function () {
    // Assume the expert has no compliance
    $scope.consultation.expert.compliance = undefined;
    $scope.signTnc();
    expect($scope.consultation.expert.compliance.tncVersionSigned).toEqual("0");
    expect($scope.consultation.expert.compliance.tncSignedDate).toEqual(jasmine.any(Date));
  });

  it('Cancel signed TNC properly', function () {
    // Assume the expert has signed compliance
    $scope.consultation.expert.compliance = {
      "tncVersionSigned" : "0",
      "tncSignedDate" : "2014-08-18"
      // this is not a correct format of date, it will be converted when refreshData()
      // but just a test, nevermind
    };
    $scope.signTnc();
    expert($scope.consultation.expert.compliance.tncVersionSigned).toEqual(undefined);
    expert($scope.consultation.expert.compliance.tncVersionSigned).toEqual(undefined);
  });

  it('Update the duration to JSON string', function () {
    $scope.duration.durationH = 10;
    $scope.duration.durationM = 10;
    $scope.updateTime();
    expect($scope.consultation.duration).toEqual(jasmine.any(String));
    expect($scope.consultation.duration).toEqual("{\"durationH\":10,\"durationM\":10}");
  });
});
