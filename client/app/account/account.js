'use strict';

angular.module('lynkApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('accountList', {
        url: '/accounts',
        templateUrl: 'app/account/accountList/accountList.html',
        controller: 'AccountListCtrl',
        authenticate: true
      })
      .state('accountDetail', {
        url: '/account/:id',
        templateUrl: 'app/account/accountDetail/accountDetail.html',
        controller: 'AccountDetailCtrl',
        authenticate: true
      })
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  });