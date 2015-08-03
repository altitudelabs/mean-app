'use strict';

angular.module('lynkApp')
  .factory('Expert', function ($resource) {
    return $resource('/api/experts/object/:objectId',
    {
      objectId: '@objectId'
    },
    {
      update: {
        method: 'PUT',
        params: {}
      },
      patch: {
        method: 'PATCH',
        params: {}
      }
    });
  });
