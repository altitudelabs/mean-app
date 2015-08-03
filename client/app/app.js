'use strict';

angular.module('lynkApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'xeditable',
  'ngTagsInput',
  'ngStorage',
  'ngClipboard',
  'ui.select',
  'angularUtils.directives.dirPagination',
  'monospaced.elastic',
  'nvd3'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath('bower_components/zeroclipboard/dist/ZeroClipboard.swf');
  }])

  .run(function(editableOptions, editableThemes) {
    editableThemes.bs3.formTpl = '<form class="editable-wrap" role="form"></form>';
    editableThemes.bs3.submitTpl = '<div class="pull-left">Enter to <button type="submit">save</button</span>';
    editableThemes.bs3.cancelTpl = '<div class="pull-right">Esc to <button type="button" ng-click="$form.$cancel()">cancel</button></span>';
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  })

  .directive('loading', ['$http', function ($http) {
    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {

        scope.isLoading = function () {
          return $http.pendingRequests.length > 0;
        };

        scope.$watch(scope.isLoading, function (v) {
          if (v) {
            elm.show();
          } else {
            elm.hide();
          }
        });
      }
    };
  }])

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .factory('svcLookup', function ($http, $sessionStorage) {
   return {
      projectCountToday: function (callback) {
        $http.get('/api/projects/countToday').success(callback);
      },
      accounts: function (callback) {
        $http.get('/api/accounts').success(callback);
      },
      accountListIds: function (callback) {
        var listIds =  [
          // Individual list ID
          {individualId: '55682f70e4b09e15082e86b1', name: '10EQS'},
          {individualId: '5568348ce4b09e15082e8a25', name: 'A.T. Kearney'},
          {individualId: '55589ac4e4b0466addf4ca9d', name: 'Bain'},
          {individualId: '555aa7fee4b0c32ce08a3ca7', name: 'Baring'},
          {individualId: '554b14c9e4b001afe0ef94d3', name: 'BCG'},
          {individualId: '556836cee4b09e15082e8c14', name: 'Blackpeak'},
          {individualId: '555ab2c9e4b03ef10c96bfd0', name: 'Dymon'},
          {individualId: '555ab383e4b03ef10c96c30c', name: 'Fidelity'},
          {individualId: '555ad21fe4b08787329b13a3', name: 'Frost & Sullivan'},
          {individualId: '555ad45ae4b08787329b17e5', name: 'Janchor'},
          {individualId: '555ad7d1e4b08787329b1ef3', name: 'Karst Peak'},
          {individualId: '555ad81de4b08787329b1f6e', name: 'KKR'},
          {individualId: '555ad4e7e4b08787329b18d6', name: 'L.E.K.'},
          {individualId: '5459e6eae4b0da3dd71d143a', name: 'McKinsey'},
          {individualId: '555ad96ee4b08787329b216c', name: 'Mizuho Asia Partners'},
          {individualId: '555ada61e4b08787329b22d2', name: 'Mizuho Bank'},
          {individualId: '555adb27e4b03ef10c9732a1', name: 'Navis'},
          {individualId: '555adbc5e4b03ef10c9733b5', name: 'Northstar'},
          {individualId: '555ae6c3e4b03ef10c974d9b', name: 'Oasis'},
          {individualId: '555ae743e4b03ef10c974e92', name: 'OCP'},
          {individualId: '555ad64ee4b08787329b1c29', name: 'Oliver Wyman'},
          {individualId: '5558ac13e4b0466addf50d42', name: 'Parthenon / EY'},
          {individualId: '555ae79ce4b03ef10c974f4a', name: 'Platinum Equity'},
          {individualId: '55682da1e4b09e15082e85b7', name: 'PWC / Strategy&'},
          {individualId: '555ae810e4b03ef10c975057', name: 'Southern Capital'},
          {individualId: '555aedf0e4b0c32ce08aca6b', name: 'Tybourne'},
          {individualId: '555ad74ce4b08787329b1dee', name: 'Value Partners'},
          {individualId: '555aef7be4b0c32ce08acc1f', name: 'Wendel'},
          {individualId: '55a4d6b5e4b09de207d030ae', name: 'TESTING ACCOUNT'}
        ];
        callback(listIds);
      },
      clients: function(callback) {
        $http.get('/api/clients').success(callback);
      },
      regions: function (callback) {
        $http.get('/api/regions').success(callback);
      },
      industries: function (callback) {
        $http.get('/api/industries').success(callback);
      },
      topics: function (callback) {
        callback(['Marketing', 'Due Diligence', 'Research & Development', 'Operations']);
      },
      experts: function (callback) {
        //$http.get('/api/experts').success(callback);
        callback($sessionStorage.experts);
      },
      users: function (callback) {
        $http.get('/api/users').success(callback);
        //callback($sessionStorage.users);
      }
   };
  })

  .factory('expertCache', function($cacheFactory) {
    return $cacheFactory('expertCache');
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {

      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        } else {
          // If user is not admin, redirect to root
          if (next.admin && !Auth.isAdmin()) {
            $location.path('/login');
          }
        }
      });
    });
  });
