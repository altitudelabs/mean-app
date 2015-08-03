'use strict';

describe('Service: consultation', function () {

  // load the service's module
  beforeEach(module('lynkApp'));

  // instantiate service
  var consultation;
  beforeEach(inject(function (_consultation_) {
    consultation = _consultation_;
  }));

  it('should do something', function () {
    expect(!!consultation).toBe(true);
  });

});
