'use strict';

angular.module('lynkApp')
  .controller('ConsultationInviteClientCtrl', function ($scope, $modalInstance, $location, $http, $rootScope, cachedUsers, consultation, pmEmail, Auth, GoogleCalendarService) {

    var cancellationClause = '==========\n\nAfter the Client agrees to and receives confirmation of consultation from The Straits Network, if the Client cancels or delays the consultation with less than 24 hours notice, the Client will be charged 0.5 consultation hour.\n\n==========';

    // objectId
    var path = $location.path();
    var itemId = (path.split('/'))[path.split('/').length-1];

    // PM's email is used as calendar invite sender email
    $scope.pmEmail = pmEmail;
console.log('inviteClient pmEmail', pmEmail);
    $scope.consultation = consultation;

    $scope.consultation.notifyClients = $scope.consultation.notifyClients || false;

    $scope.setNotifyClients = function (status) {
      $scope.consultation.notifyClients = status;
      console.log('notifyClients is now', status);
    };

    // Set default time to now
    var now = new Date();
    // Prepare list of timezones
    $scope.timezones = _.sortBy(_.map(moment.tz.names(), function(name) {
      return {
        name: name,
        label: name + ' ' + moment().tz(name).format('z (Z)')
      };
    }));

    if (!$scope.consultation.scheduledDate) {
      // Set default timezone to Hong Kong
      $scope.consultation.date = now;
      $scope.consultation.time = now;
      if(!$scope.consultation.timezone){
        var timeZoneIndex = _.findIndex($scope.timezones, function(timezone){
          return timezone.name === 'Asia/Hong_Kong';
        });
        $scope.consultation.timezone = $scope.timezones[timeZoneIndex];
      }
    } else {
      $scope.consultation.date = new Date($scope.consultation.scheduledDate);
      $scope.consultation.time = new Date($scope.consultation.scheduledDate);
      if(!$scope.consultation.timezone){
        var timeZoneIndex = _.findIndex($scope.timezones, function(timezone){
          return timezone.name === 'Asia/Hong_Kong';
        });
        $scope.consultation.timezone = $scope.timezones[timeZoneIndex];
      }
    }



    /**
     * Converts date, time and timezone into Javascript date
     */
    $scope.getDate = function (date, time, timezone) {
      if (date && time && timezone) {
        var dateStr = moment(date).format('YYYY-MM-DD'),
            timeStr = moment(time).format('h:mm');
        var theDate = moment.tz(dateStr + ' ' + timeStr, timezone.name).toDate();
        return theDate;
      } else {
        console.log(date);
        console.log(time);
        console.log(timezone);
        return null;
      }
    }

    $scope.consultation.description = prepareDescription();

    function prepareDescription() {
      var text =  'EXPERT BIO:\n\n' + prepareProjectBio() +
                  '==========\n' +
                  'PROJECT SCOPE:\n' + $scope.consultation.scope + '\n\n' +
                  cancellationClause + '\n' +
                  'Conference details: ' + $scope.consultation.conferenceDetails + '\n';
      return text;
    }

    function prepareProjectBio() {
      var expert = $scope.consultation.expert;
      var bio = 'Knowledge Partner ' + expert.partnerRef + ': ' + expert.name + '\n';

      if (expert.company) bio += 'Company: ' + expert.company + '\n';
      if (expert.history) bio += 'Employment History:\n' + expert.history + '\n\n';
      if (expert.experience) bio += 'Relevant Experience:\n' + expert.experience + '\n\n';
      if (expert.country.length) {
        bio += 'Country:';
        for (var i = expert.country.length - 1; i >= 0; i--) {
           bio += ' ' + expert.country[i].display + ','
        };
        bio = bio.slice(0, -1); // remove last comma
        bio += '\n';
      }

      return bio;
    }

    /**
     * Lookup expert from backend
     */
    $scope.lookupUsers = function(query) {
      var items = cachedUsers;
      var found = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].name.toLowerCase().match(query.toLowerCase())) {
          found.push(items[i]);
        }
      }
      return found;
    };

    $scope.lookupClients = function(query) {
      var clients = [];
      for (var i = $scope.consultation.clients.length - 1; i >= 0; i--) {
        clients.push($scope.consultation.clients[i]);
      };
      console.log('clientAttendees', clients);
      return clients;
    }

    $rootScope.$on('GoogleEventAdded', function (event, data) {
      console.log('GoogleEventAdded', event, data);

      // Add back invite Id
      if (!$scope.consultation.consultationRef) {
        // e.g. C20150527000
        $scope.consultation.consultationRef = 'C' + $scope.consultation.scheduledDate.toISOString().slice(0,10).replace(/-/g,'') + '000';
      }
      $scope.consultation.clientInviteId = data.id;
      $scope.consultation.expert = $scope.consultation.expert.objectId;
      $scope.consultation.project = $scope.consultation.project._id;
      $http.patch('/api/consultations/object/' + itemId, $scope.consultation);

      $modalInstance.close($scope.consultation);
      $scope.loading = false;
    });

    $rootScope.$on('GoogleEventPatched', function (event, data) {
      console.log('GoogleEventPatched', event, data);

      $modalInstance.close($scope.consultation);
      $scope.loading = false;
    })

    $rootScope.$on('GoogleError', function (event, data) {
      console.log('GoogleError', event, data);
      if (data.code === 404) {
        $scope.googleError = 'Calendar not found';
      } else {
        $scope.googleError = data.message;
      }
      $scope.loading = false;
    });

    // Prepares attendees list according to google calendar API spec
    function prepareAttendees(attendees, selfEmail) {
      var node = [];

      for (var i = attendees.length - 1; i >= 0; i--) {
        if (attendees[i] !== selfEmail) {
          var attendee = {
            'email': attendees[i],
            'organizer': false,
            'responseStatus': 'needsAction'
          };
          node.push(attendee);
        }
      };

      // add self as organizer
      node.push({
        'email': selfEmail,
        'organizer': true,
        'self': true,
        'responseStatus': 'needsAction'
      });

      return node;
    }

    // Extracts emails from staff attendees
    function prepareStaffAttendees() {
      var emails = [];
      if ($scope.consultation.staffAttendees.length) {
        for (var i = $scope.consultation.staffAttendees.length - 1; i >= 0; i--) {
          emails.push($scope.consultation.staffAttendees[i].email);
        };
      }
      return emails;
    }

    function prepareExtraAttendees() {
      var emails = [];
      if ($scope.consultation.extraAttendees && $scope.consultation.extraAttendees.length) {
        emails = $scope.consultation.extraAttendees.split(',');
        for (var i = emails.length - 1; i >= 0; i--) {
          emails[i] = emails[i].trim();
        };
      }
      return emails;
    }

    function prepareClientAttendees() {
      var emails = [];
      if ($scope.consultation.clientAttendees.length) {
        for (var i = $scope.consultation.clientAttendees.length - 1; i >= 0; i--) {
          emails.push($scope.consultation.clientAttendees[i].properties.email[0].value);
        };
      }
      return emails;
    }



    /**
     * Submit form
     */
    $scope.ok = function () {

      $scope.loading = true;

      $scope.consultation.scheduledDate = $scope.getDate($scope.consultation.date, $scope.consultation.time, $scope.consultation.timezone);

      if ($scope.consultation.scheduledDate) {
        console.log('Consultation', $scope.consultation);

        var diff = 60; // minutes
        var startDate = $scope.consultation.scheduledDate;
        var endDate = new Date(startDate.getTime() + diff*60000);
        var summary = $scope.consultation.event;
        var description = $scope.consultation.description;
        var where = $scope.consultation.whereClient;
        var notifyAttendees = $scope.consultation.notifyClients;
        // list of clients' emails + expert's email
        var clientAttendees = prepareClientAttendees();
        var staffs = prepareStaffAttendees();
        var extras = prepareExtraAttendees();
        var attendeesList = clientAttendees.concat(staffs).concat(extras);
        console.log('attendeesList', attendeesList);

        if ($scope.consultation.clientInviteId) {
          GoogleCalendarService.patchEvent(startDate, endDate, summary, description, where, notifyAttendees, attendeesList, $scope.consultation.clientInviteId, $scope.pmEmail);
        } else {
          GoogleCalendarService.addEvent(startDate, endDate, summary, description, where, notifyAttendees, attendeesList, $scope.pmEmail);
        }
      } else {
        $modalInstance.close($scope.consultation);
      }
    };

    /**
     * Dismiss modal
     */
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
