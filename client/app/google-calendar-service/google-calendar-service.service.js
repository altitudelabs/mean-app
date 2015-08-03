'use strict';
// https://github.com/jbroquist/bookingappdemo-angular/blob/master/app/js/services/GoogleCalendarService.js

angular.module('lynkApp')
  .factory('GoogleCalendarService', function ($http, $q, $rootScope) {

    var $scope = angular.element(document).scope();

    //the url where our node.js application is located
    var baseUrl = '/api/googleCalendar';

    return {
      scope: $scope,

      getEvents: function() {
        var defer = $q.defer();

        $http.get(baseUrl + '/events').then(function (response) {

          console.log('getEvents', response);

          if (response.status === 200) {

            $rootScope.$broadcast('GoogleEventsReceived', response.data.items);
            defer.resolve(response.data.items);

          } else {

            $rootScope.$broadcast('GoogleError', response.data);
            defer.reject(response.data);
          }

        });

        return defer.promise;
      },

      addEvent: function (startDate, endDate, summary, description, where, notifyAttendees, attendees, emailToUse) {
        var defer = $q.defer();

        var postData = {
          startDate: startDate,
          endDate: endDate,
          summary: summary,
          description: description,
          location: where,
          attendees: attendees,
          notifyAttendees: notifyAttendees,

          emailToUse: emailToUse
        };
        console.log('gcal service addEvent: postData', postData);
        console.log('baseUrl/event', baseUrl+'/event');
        $http.post(baseUrl+'/event', postData, {'Content-Type': 'application/json'}).then(function (response) {
          console.log('addEvent', response);

          if (response.status === 200) {

            $rootScope.$broadcast('GoogleEventAdded', response.data);
            defer.resolve(response.data);

          } else {

            $rootScope.$broadcast('GoogleError', response.data);
            defer.reject(response.data)
          }
        });

        return defer.promise;
      },

      patchEvent: function (startDate, endDate, summary, description, where, notifyAttendees, attendees, eventId, emailToUse) {
        var defer = $q.defer();

        var postData = {
          startDate: startDate,
          endDate: endDate,
          summary: summary,
          description: description,
          location: where,
          attendees: attendees,
          notifyAttendees: notifyAttendees,

          emailToUse: emailToUse
        };

        $http.patch(baseUrl + '/event/' + eventId, postData, {'Content-Type': 'application/json'}).then(function (response) {
          console.log('patchEvent', response);

          if (response.status === 200) {

            $rootScope.$broadcast('GoogleEventPatched', response.data);
            defer.resolve(response.data);

          } else {

            $rootScope.$broadcast('GoogleError', response.data);
            defer.reject(response.data)
          }
        });

        return defer.promise;

      }

    };
  });
