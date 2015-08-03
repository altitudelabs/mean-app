'use strict';

angular.module('lynkApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('expertList', {
        url: '/experts',
        templateUrl: 'app/expert/list/list.html',
        controller: 'ExpertListCtrl'
      })
      .state('expertDetail', {
        url: '/expert/:id',
        templateUrl: 'app/expert/detail/detail.html',
        controller: 'ExpertDetailCtrl'
      })
      .state('expertDetailByObject', {
        url: '/expert/object/:objectId',
        templateUrl: 'app/expert/detail/detail.html',
        controller: 'ExpertDetailCtrl'
      });
  });

  // List View
  /**.filter('expertListFilter', function () {
    // items: list of projects
    // query: the search query
    // irOrMode: true == use ANY terms, false == use ALL terms
    return function (items, query, inOrMode) {
      if (!query.name && !query.company && !query.location && !query.progressStatus) return items;
      var arrToReturn = [];

      if (inOrMode) {

        items.forEach(function (item) {
          var passTest = false;
          if(query.name){
            if(item.name.toLowerCase().indexOf(query.name.toLowerCase() ) > -1) {
              passTest = true;
            }
          }
          if(query.company){
            if(item.company.toLowerCase().indexOf(query.company.toLowerCase() ) > -1) {
              passTest = true;
            }
          }
          if(query.location){
            if(item.location.toLowerCase().indexOf(query.location.toLowerCase() ) > -1) {
              passTest = true;
            }
          }
          if(query.progressStatus){
            if(item.progressStatus.toLowerCase().indexOf(query.progressStatus.toLowerCase() ) > -1) {
              passTest = true;
            }
          }
          // Add item to return array only if passTest is true -- i.e. if ANY search terms were found in item
          if (passTest) { arrToReturn.push(item); }
        });
      } else {
        items.forEach(function (item) {
          var passTest = true;
          passTest = passTest && (
                (query.name ? (item.name && item.name.toLowerCase().indexOf(query.name.toLowerCase()) > -1) : true ) &&
                (query.company ? (item.company && item.company.toLowerCase().indexOf(query.company.toLowerCase()) > -1) : true ) &&
                (query.location ? (item.location && item.location.toLowerCase().indexOf(query.location.toLowerCase()) > -1) : true ) &&
                (query.progressStatus ? (item.progressStatus && item.progressStatus.toLowerCase().indexOf(query.progressStatus.toLowerCase()) > -1) : true)
              );
          // Add item to return array only if passTest is true -- ALL search terms were found in item
          if (passTest) { arrToReturn.push(item); }
        });
      }
      return arrToReturn;
    };
  });*/
