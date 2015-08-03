'use strict';

angular.module('lynkApp')
  .controller('AccountListCtrl', function ($scope, $http, Account, svcLookup) {
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
    $scope.loading = true;
    svcLookup.accountListIds(function (items) {
      $scope.idList = items;
    });
    //$scope.accounts = Account.query().then(countContact());
    Account.query(function (result) {
      $scope.accounts = result;
      /** Account count function
      $scope.accounts.map(function (account) {
        (function getContactCount(account) {
          var index = _.findIndex(listIds, function(list){
            return list.name === account.name;
          });
          if(index > -1){
            $http.get('/api/clients/count/' + listIds[index].individualId)
             .then(function(error, count){
              console.log(account.name);
              account.count = count;
             });
          }
        })(account);
      });**/
      $scope.loading = false;
    });

    /**function countContact() {
      for(var i = 0; i < $scope.accounts.length; i++) {
        for(var j = 0; j < $scope.idList.length; j++) {
          if($scope.accounts[i].name === $scope.idList[j].name) {
            $scope.loading = true;
            $http.get('/api/clients/count/' + $scope.idList[j].individualId)
              .then(function(result) {
                for(var i = 0; i < $scope.accounts.length; i++) {
                  for(var j = 0; j < $scope.idList.length; j++) {
                    if($scope.accounts[i].name === $scope.idList[j].name) {
                      if($scope.idList[j].individualId === result.data[0].listId){
                        $scope.accounts[i].count = result.data.length;
                        $scope.loading = false;
                      }
                    }
                  }
                }
              });
          }
        }
      }
    }**/
  });
