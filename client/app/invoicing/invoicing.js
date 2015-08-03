'use strict';

angular.module('lynkApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('invoicing', {
        url: '/invoicing',
        templateUrl: 'app/invoicing/invoicing.html',
        controller: 'InvoicingCtrl'
      });
  });