'use strict';

describe('Service: GoogleCalendarService', function () {

  // load the service's module
  beforeEach(module('lynkApp'));

  // instantiate service
  var GoogleCalendarService;
  beforeEach(inject(function (_GoogleCalendarService_) {
    GoogleCalendarService = _GoogleCalendarService_;
  }));

  it('should do something', function () {
    expect(!!GoogleCalendarService).toBe(true);
  });

});
