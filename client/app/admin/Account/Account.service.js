'use strict';

angular.module('lynkApp')
  .factory('Account', function ($resource) {
    return $resource('/api/accounts/:id/:controller', {
      id: '@_id'
    },
    {
      update: {
        method: 'PUT',
        params: {}
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
    });
  });
