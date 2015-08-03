'use strict';

angular.module('lynkApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        authenticate: true
      })
      .state('analytics', {
        url: '/analytics',
        templateUrl: 'app/main/analytics/analytics.html',
        controller: 'AnalyticsCtrl',
        authenticate: true
      });
  // })
  // .value('GoogleApp', {
  //   apiKey: 'ericapikey',
  //   clientId: '233768312999-2866e60a3nadisjl13472kcun51frng8.apps.googleusercontent.com',
  //   scopes: [
  //     'https://www.googleapis.com/auth/userinfo.profile',
  //     'https://www.googleapis.com/auth/userinfo.email',
  //     'https://www.googleapis.com/auth/calendar'
  //   ]
  });