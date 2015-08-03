'use strict';

angular.module('lynkApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('consultationList', {
        url: '/consultations',
        templateUrl: 'app/consultation/list/list.html',
        controller: 'ConsultationListCtrl',
        authenticate: true
      })
      .state('consultationDetail', {
        url: '/consultation/:id',
        templateUrl: 'app/consultation/detail/detail.html',
        controller: 'ConsultationDetailCtrl',
        authenticate: true
      });
  })
  // List View
  .filter('consultationListFilter', function () {
    // items: list of consultations
    // query: the search query
    // irOrMode: true == use ANY terms, false == use ALL terms
    return function (items, query, inOrMode) {
      if (!query) {return items;}

      var terms = query.split(' ');
      var arrToReturn = [];

      if (inOrMode) {

        items.forEach(function (item) {
          var passTest = false;

          terms.forEach(function (term) {
            // iterate through terms found in query box
            var itemClients = JSON.stringify(item.clients);
            var itemExpert = JSON.stringify(item.expert);

            // Build a haystack string to search for query in
            var hayStack =  (itemClients ? itemClients : '') + ' ' +
                            (itemExpert ? itemExpert : '') + ' ' +
                            (item.consultationRef ? item.consultationRef : '') + ' ' +
                            item.name + ' ' +
                            (item.projectName ? item.projectName : '') + ' ';

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

            var itemClients = JSON.stringify(item.clients);
            var itemExpert = JSON.stringify(item.expert);

            // console.log(item);

            passTest = passTest && (
                (item.consultationRef && item.consultationRef.toLowerCase().indexOf(term.toLowerCase()) > -1) ||
                item.name.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                (item.projectName && item.projectName.toLowerCase().indexOf(term.toLowerCase()) > -1) ||
                itemClients.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                itemExpert.toLowerCase().indexOf(term.toLowerCase()) > -1
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