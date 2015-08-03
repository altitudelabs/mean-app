'use strict';

angular.module('lynkApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('projectList', {
        url: '/projects',
        templateUrl: 'app/project/list/list.html',
        controller: 'ProjectListCtrl',
        authenticate: true
      })
      .state('projectDetail', {
        url: '/project/:id',
        templateUrl: 'app/project/detail/detail.html',
        controller: 'ProjectDetailCtrl',
        authenticate: true
      });
  })

  .directive('focusMe', function($timeout) {
    return {
      scope: { trigger: '=focusMe' },
      link: function(scope, element) {
        scope.$watch('trigger', function(value) {
          if(value === true) {
            element[0].focus();
            scope.trigger = false;
          }
        });
      }
    };
  })

  // Experts Tab
  .filter('pendingFilter', function () {
    return function (experts) {
      var validExperts = [];
      // loop through experts, only return status is pending.
      if (experts) {
        experts.forEach(function (expert) {
          if (expert.statusInProject === 'pending') validExperts.push(expert);
        });
      }
      return validExperts;
    };
  })
  .filter('approvedFilter', function () {
    return function (experts) {
      var validExperts = [];
      // loop through experts, only return status is approved.
      if (experts) {
        experts.forEach(function (expert) {
          if (expert.statusInProject === 'approved') validExperts.push(expert);
        });
      }
      return validExperts;
    };
  })
  .filter('sentFilter', function () {
    return function (experts) {
      var validExperts = [];
      // loop through experts, only return status is sent.
      if (experts) {
        experts.forEach(function (expert) {
          if (expert.statusInProject === 'sent') validExperts.push(expert);
        });
      }
      return validExperts;
    };
  })
  .filter('selectedFilter', function () {
    return function (experts) {
      var validExperts = [];
      // loop through experts, only return status is selected.
      if (experts) {
        experts.forEach(function (expert) {
          if (expert.statusInProject === 'selected') validExperts.push(expert);
        });
      }
      return validExperts;
    };
  })
  .filter('rejectedFilter', function () {
    return function (experts) {
      var validExperts = [];
      // loop through experts, only return status is rejected.
      if (experts) {
        experts.forEach(function (expert) {
          if (expert.statusInProject === 'rejected') validExperts.push(expert);
        });
      }
      return validExperts;
    };
  })


  // Consultations Tab
  .filter('selectedConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is selected.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'selected') valid.push(item);
        });
      }
      return valid;
    };
  })
  .filter('scheduledConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is scheduled.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'scheduled') valid.push(item);
        });
      }
      return valid;
    };
  })
  .filter('completedConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is completed.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'completed') valid.push(item);
        });
      }
      return valid;
    };
  })
  .filter('accountConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is closed.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'accounting') valid.push(item);
        });
      }
      return valid;
    };
  })
  .filter('postponedConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is closed.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'postponed') valid.push(item);
        });
      }
      return valid;
    };
  })
  .filter('cancelClientConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is closed.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'cancelclient') valid.push(item);
        });
      }
      return valid;
    };
  })
  .filter('cancelExpertConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is closed.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'cancelexpert') valid.push(item);
        });
      }
      return valid;
    };
  })
  .filter('paidConsultationsFilter', function () {
    return function (items) {
      var valid = [];
      // loop through items, only return status is paid.
      if (items && items.forEach ) {
        items.forEach(function (item) {
          if (item.statusInProject === 'paid') valid.push(item);
        });
      }
      return valid;
    };
  })

  // Project List View
  .filter('projectListFilter', function () {
    // items: list of projects
    // query: the search query
    // irOrMode: true == use ANY terms, false == use ALL terms
    return function (items, query, inOrMode) {
      if (!query) return items;

      var terms = query.split(' ');
      var arrToReturn = [];


      if (inOrMode) {

        items.forEach(function (item) {
          var passTest = false;

          terms.forEach(function (term) {
            // iterate through terms found in query box
            var itemAccounts = JSON.stringify(item.account);
            var itemClients = JSON.stringify(item.clients);
            var itemIndustries = JSON.stringify(item.industries);
            var itemRegions = JSON.stringify(item.region);

            // Build a haystack string to search for query in
            var hayStack =  (itemAccounts ? itemAccounts : '') + ' ' +
                            (itemClients ? itemClients : '') + ' ' +
                            (itemIndustries ? itemIndustries : '') + ' ' +
                            (itemRegions ? itemRegions : '') + ' ' +
                            item.status + ' ' +
                            item.caseCode + ' ' +
                            item.name + ' ' +
                            (item.clientCaseCode ? item.clientCaseCode : '') + ' ' +
                            (item.description ? item.description : '') + ' ' +
                            (item.specialNotes ? item.specialNotes : '') + ' ' +
                            item.manager[0];

            hayStack = hayStack.toLowerCase();
            // console.log(hayStack);

            // if any terms are found, passTest is set to and remains true
            if (hayStack.indexOf( term.toLowerCase() ) > -1) {
              passTest = passTest || true;
            }
          });

          // Add item to return array only if passTest is true -- i.e. if ANY search terms were found in item
          if (passTest) { arrToReturn.push(item); }

        });


      } else {

        items.forEach(function (item) {
          var passTest = true;
          terms.forEach(function (term) {
            // iterate through terms found in query box
            // if any terms aren't found, passTest is set to and remains false

            var itemAccounts = JSON.stringify(item.account);
            var itemClients = JSON.stringify(item.clients);
            var itemIndustries = JSON.stringify(item.industries);
            var itemRegions = JSON.stringify(item.region);

            // console.log(item);

            passTest = passTest && (
                item.status.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                item.caseCode.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                item.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                (item.clientCaseCode && item.clientCaseCode.toLowerCase().indexOf(term.toLowerCase()) > -1) ||
                (item.description && item.description.toLowerCase().indexOf(term.toLowerCase()) > -1) ||
                (item.specialNotes && item.specialNotes.toLowerCase().indexOf(term.toLowerCase()) > -1) ||
                (item.manager[0] && item.manager[0].toLowerCase().indexOf(term.toLowerCase()) > -1) ||
                itemAccounts.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                itemClients.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                itemIndustries.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                itemRegions.toLowerCase().indexOf(term.toLowerCase()) > -1
              );
          });

          // console.log('passTest', passTest);
          // Add item to return array only if passTest is true -- ALL search terms were found in item
          if (passTest) { arrToReturn.push(item); }

        });

      }

      return arrToReturn;

    };

  });

