'use strict';

angular.module('lynkApp')
  .factory('Consultation', function ($resource) {
    return $resource('/api/consultations/object/:objectId',
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
