'use strict';

describe('Service: expert', function () {

  // load the service's module
  beforeEach(module('lynkApp'));

  // instantiate service
  var expert;
  beforeEach(inject(function (_expert_) {
    expert = _expert_;
  }));

  it('should do something', function () {
    expect(!!expert).toBe(true);
  });

});
