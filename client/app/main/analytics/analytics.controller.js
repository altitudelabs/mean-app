'use strict';

angular.module('lynkApp')
  .controller('AnalyticsCtrl', function ($scope, $http) {
    // Init views, first refresh data and then create all the tabs
    function init() {
      var now = new Date();
      var currentMonth = now.getMonth();
      var monthRef = {0:'JAN',1:'FEB',2:'MAR',3:'APR',4:'MAY',5:'JUN',6:'JUL',7:'AUG',8:'SEP',9:'OCT',10:'NOV',11:'DEC'};
      $scope.currentMonthText = monthRef[currentMonth];
      switch(currentMonth) {
        case 0:
        case 1:
        case 2:
          $scope.currentQuarterText = 'q1';
          break;
        case 3:
        case 4:
        case 5:
          $scope.currentQuarterText = 'q2';
          break;
        case 6:
        case 7:
        case 8:
          $scope.currentQuarterText = 'q3';
          break;
        default:
          $scope.currentQuarterText = 'q4';
          break;
      }
      refreshData();
    }

    // refresh data and init the scope tabs
    function refreshData() {
      var itemsToUpdate = 0; // a counter to ensure all data is fetch before mapping
        $http.get('api/analytics/totalProjectsByAll')
          .then(function(result) {
            $scope.totalProjects = result.data;
            itemsToUpdate++;
            initScopeTabs(itemsToUpdate);
          });
        $http.get('api/analytics/completedConsultationsByAll')
          .then(function(result) {
            $scope.completedConsultations = result.data;
            itemsToUpdate++;
            initScopeTabs(itemsToUpdate);
          });
        $http.get('api/analytics/cancelledConsultationsByAll')
          .then(function(result) {
            $scope.cancelledConsultations = result.data;
            itemsToUpdate++;
            initScopeTabs(itemsToUpdate);
          });
        $http.get('api/analytics/projectYieldByAll')
        .then(function(result) {
          $scope.projectYield = result.data;
          itemsToUpdate++;
          initScopeTabs(itemsToUpdate);
        });
        $http.get('api/analytics/responseTimeByAll')
        .then(function(result) {
          $scope.responseTime = result.data;
          itemsToUpdate++;
          initScopeTabs(itemsToUpdate);
        });
        $http.get('api/analytics/firstProfileSentByAll')
        .then(function(result) {
          $scope.firstProfileSent = result.data;
          itemsToUpdate++;
          initScopeTabs(itemsToUpdate);
        });
    }

    // init scope tabs only when all data get
    function initScopeTabs(itemLength) {
      if(itemLength !== 6) { // change if the number of data change
        return;
      } else {
        /**
         * Everything about the account manager tab
         * AM include roles : admin, am
         */
        $scope.AccountManagerTab = {
          // status for the tab
          // 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
          filterOptions:[
            'Total Projects',
            'Completed Consultations',
            // 'Cancelled Consultations',
            'Project Yield',
            // 'Revenue',
            // 'Response Time',
            'First Profiles Sent',
            'AM Rank (# consultations)'
          ],
          /**
           * Filter the type of data wanted
           */
          filter: 'Total Projects',
          status: 0,
          currentPage: 1,
          data: [],
          options: {
              chart: {
                  margin: {
                    left: 120
                  },
                  type: 'multiBarHorizontalChart',
                  height: 450,
                  x: function(d){return d.name;},
                  y: function(d){return d.value;},
                  showControls: false,
                  showValues: true,
                  showLegend: false,
                  transitionDuration: 500,
                  xAxis: {
                      width: 200,
                      rotateYLabel: false
                  },
                  yAxis: {
                      axisLabelDistance: 100
                  }
              }
            },
          // values in this tab
          // Total Projects
          totalProjects: [],
          totalProjects_hash: {}, // the mapping of am <-> # of projects
          // Total Completed Consultations
          completedConsultations: [],
          completedConsultations_hash: {}, // the mapping of am <-> # of consultations
          cancelledConsultations: [],
          cancelledConsultations_hash: {}, // the mapping of am <-> # of consultations
          // Average # of Consultation / project
          projectYield: [],
          projectYield_hash: {},
          projectCount : {},
          consultationCount: {},
          // Revenue
          revenue: [],
          revenue_hash: {},
          responseTime: [],
          responseTime_hash: {},
          firstProfileSent: [],
          firstProfileSent_hash: {},
          // Ranking for AM
          ranking: [],
          ranking_hash: {},

          /**
           * Selects the time series and refresh the datas
           * @index: the index for time series
           * 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
           */
          select: function (index) {
            var self = this;
            self.status = index;
            console.log('Select Acc.Manager Tab', self.status);
            self.mapData();
          },

          // Map the data only if itemLength is equal to number of data Http.get()
          mapData: function() {
            var self = this;
            var year = new Date().getFullYear();
            // re-create the hash according to time series
            if (self.status === 0) {
              // TOTAL PROJECTS
              self.totalProjects_hash = new HashTableMonth();
              // COMPLETED CONSULTATIONS
              self.completedConsultations_hash = new HashTableMonth();
              // PROJECT YIELD
              self.projectCount = new HashTableMonth();
              self.consultationCount = new HashTableMonth();
              self.projectYield_hash = new HashTableMonth();
              // RANKING
              self.ranking_hash = new HashTableMonth();
            } else if (self.status === 1) {

              self.totalProjects_hash = new HashTableQuarter();
              self.completedConsultations_hash = new HashTableQuarter();
              self.projectCount = new HashTableQuarter();
              self.consultationCount = new HashTableQuarter();
              self.projectYield_hash = new HashTableQuarter();
              self.ranking_hash = new HashTableQuarter();
            } else {
              self.totalProjects_hash = new HashTableGraph();
              self.completedConsultations_hash = new HashTableGraph();
              self.projectCount = new HashTableGraph();
              self.consultationCount = new HashTableGraph();
              self.projectYield_hash = new HashTableGraph();
              self.ranking_hash = new HashTableGraph();
            }
            // start hashing the data depend on the status(time)
            if(self.status === 3) {
              // ALL Time Project
              _.each($scope.totalProjects, function(project){
                if(project.manager.role === 'admin' || project.manager.role === 'am'){
                  // only admin and am are count in this tab
                  self.totalProjects_hash.put(project.manager);
                }
              });
              // ALL Time Completed Consultations
              _.each($scope.completedConsultations, function(consultation){
                if(consultation.project.manager.role === 'admin' || consultation.project.manager.role === 'am' )
                  self.completedConsultations_hash.put(consultation.project.manager);
              });
              // ALL Time Project Yield, use 2 hashes
              _.each($scope.projectYield, function(project){
                if(project.manager.role === 'admin' || project.manager.role === 'am'){
                  // only admin and am are count in this tab
                  self.consultationCount.put(project.manager, project.consultations.length);
                  self.projectCount.put(project.manager);
                }
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    self.projectYield_hash.put(manager, ((self.consultationCount.hashes[key1].value / self.projectCount.hashes[key2].value) || 0));
                  }
                }
              }
              // ALL Time ranking
              self.ranking_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse();
            } else if (self.status === 2) {
              // Year to Date Projects
              _.each($scope.totalProjects, function(project){
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  if(project.manager.role === 'admin' || project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    self.totalProjects_hash.put(project.manager);
                  }
                }
              });
              // Year to Date consultations
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  if(consultation.project.manager.role === 'admin' || consultation.project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    self.completedConsultations_hash.put(consultation.project.manager);
                  }
                }
              });

              // Year to Date Project Yield, use 2 hash to calculate
              _.each($scope.projectYield, function(project){
                // only project in this year are counted
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  if(project.manager.role === 'admin' || project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    self.consultationCount.put(project.manager, project.consultations.length);
                    self.projectCount.put(project.manager);
                  }
                }
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    self.projectYield_hash.put(manager, ((self.consultationCount.hashes[key1].value / self.projectCount.hashes[key2].value) || 0));
                  }
                }
              }
              // Year to Date Ranking
              self.ranking_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse();
            } else if (self.status === 1){
              // Quarte Project
              _.each($scope.totalProjects, function(project){
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  if(project.manager.role === 'admin' || project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(project.startDate).getMonth();
                    switch(true){
                      case month>=0 && month<3:
                        // JAN to Mar
                        self.totalProjects_hash.put(project.manager, 'q1');
                        break;
                      case month>=3 && month<6:
                        // APR to JUN
                        self.totalProjects_hash.put(project.manager, 'q2');
                        break;
                      case month>=6 && month<9:
                        // JUL to SEP
                        self.totalProjects_hash.put(project.manager, 'q3');
                        break;
                      case month>=9 && month<12:
                        // OCT to DEC
                        self.totalProjects_hash.put(project.manager, 'q4');
                        break;
                    }
                  }
                }
              });
              // Quarterly Consultations
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  if(consultation.project.manager.role === 'admin' || consultation.project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(consultation.completedDate).getMonth();
                    switch(true){
                      case month>=0 && month<3:
                        // JAN to Mar
                        self.completedConsultations_hash.put(consultation.project.manager, 'q1');
                        break;
                      case month>=3 && month<6:
                        // APR to JUN
                        self.completedConsultations_hash.put(consultation.project.manager, 'q2');
                        break;
                      case month>=6 && month<9:
                        // JUL to SEP
                        self.completedConsultations_hash.put(consultation.project.manager, 'q3');
                        break;
                      case month>=9 && month<12:
                        // OCT to DEC
                        self.completedConsultations_hash.put(consultation.project.manager, 'q4');
                        break;
                    }
                  }
                }
              });
              // Quarte Project Yield, use 2 hash to calculate
              _.each($scope.projectYield, function(project){
                // only project in this year are counted
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  if(project.manager.role === 'admin' || project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(project.startDate).getMonth();
                    switch(true){
                      case month>=0 && month<3:
                        // JAN to Mar
                        self.consultationCount.put(project.manager, 'q1', project.consultations.length);
                        self.projectCount.put(project.manager, 'q1');
                        break;
                      case month>=3 && month<6:
                        // APR to JUN
                        self.consultationCount.put(project.manager, 'q2', project.consultations.length);
                        self.projectCount.put(project.manager, 'q2');
                        break;
                      case month>=6 && month<9:
                        // JUL to SEP
                        self.consultationCount.put(project.manager, 'q3', project.consultations.length);
                        self.projectCount.put(project.manager, 'q3');
                        break;
                      case month>=9 && month<12:
                        // OCT to DEC
                        self.consultationCount.put(project.manager, 'q4', project.consultations.length);
                        self.projectCount.put(project.manager, 'q4');
                        break;
                    }
                  }
                }
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    // q1
                    self.projectYield_hash.put(manager, 'q1', ((self.consultationCount.hashes[key1]['q1'] / self.projectCount.hashes[key2]['q1']) || 0));
                    // q2
                    self.projectYield_hash.put(manager, 'q2', ((self.consultationCount.hashes[key1]['q2'] / self.projectCount.hashes[key2]['q2']) || 0));
                    // q3
                    self.projectYield_hash.put(manager, 'q3', ((self.consultationCount.hashes[key1]['q3'] / self.projectCount.hashes[key2]['q3']) || 0));
                    // q4
                    self.projectYield_hash.put(manager, 'q4', ((self.consultationCount.hashes[key1]['q4'] / self.projectCount.hashes[key2]['q4']) || 0));
                  }
                }
              }
              // Quarter Ranking AM
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  if(consultation.project.manager.role === 'admin' || consultation.project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(consultation.completedDate).getMonth();
                    switch(true){
                      case month>=0 && month<3:
                        // JAN to Mar
                        self.ranking_hash.put(consultation.project.manager, 'q1');
                        break;
                      case month>=3 && month<6:
                        // APR to JUN
                        self.ranking_hash.put(consultation.project.manager, 'q2');
                        break;
                      case month>=6 && month<9:
                        // JUL to SEP
                        self.ranking_hash.put(consultation.project.manager, 'q3');
                        break;
                      case month>=9 && month<12:
                        // OCT to DEC
                        self.ranking_hash.put(consultation.project.manager, 'q4');
                        break;
                    }
                  }
                }
              });
            } else {
              // Monthly Projects
              _.each($scope.totalProjects, function(project){
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  if(project.manager.role === 'admin' || project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(project.startDate).getMonth();
                    switch(true){
                      case month===0: // JAN
                        self.totalProjects_hash.put(project.manager, 'JAN'); break;
                      case month===1: // FEB
                        self.totalProjects_hash.put(project.manager, 'FEB'); break;
                      case month===2: // MAR
                        self.totalProjects_hash.put(project.manager, 'MAR'); break;
                      case month===3: // APR
                        self.totalProjects_hash.put(project.manager, 'APR'); break;
                      case month===4: // MAY
                        self.totalProjects_hash.put(project.manager, 'MAY'); break;
                      case month===5: // JUN
                        self.totalProjects_hash.put(project.manager, 'JUN'); break;
                      case month===6: // JUL
                        self.totalProjects_hash.put(project.manager, 'JUL'); break;
                      case month===7: // AUG
                        self.totalProjects_hash.put(project.manager, 'AUG'); break;
                      case month===8: // SEP
                        self.totalProjects_hash.put(project.manager, 'SEP'); break;
                      case month===9: // OCT
                        self.totalProjects_hash.put(project.manager, 'OCT'); break;
                      case month===10: // NOV
                        self.totalProjects_hash.put(project.manager, 'NOV'); break;
                      case month===11: // DEC
                        self.totalProjects_hash.put(project.manager, 'DEC'); break;
                    }
                  }
                }
              });
              // Monthly Consultations
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  if(consultation.project.manager.role === 'admin' || consultation.project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(consultation.completedDate).getMonth();
                    switch(true){
                      case month===0: // JAN
                        self.completedConsultations_hash.put(consultation.project.manager, 'JAN'); break;
                      case month===1: // FEB
                        self.completedConsultations_hash.put(consultation.project.manager, 'FEB'); break;
                      case month===2: // MAR
                        self.completedConsultations_hash.put(consultation.project.manager, 'MAR'); break;
                      case month===3: // APR
                        self.completedConsultations_hash.put(consultation.project.manager, 'APR'); break;
                      case month===4: // MAY
                        self.completedConsultations_hash.put(consultation.project.manager, 'MAY'); break;
                      case month===5: // JUN
                        self.completedConsultations_hash.put(consultation.project.manager, 'JUN'); break;
                      case month===6: // JUL
                        self.completedConsultations_hash.put(consultation.project.manager, 'JUL'); break;
                      case month===7: // AUG
                        self.completedConsultations_hash.put(consultation.project.manager, 'AUG'); break;
                      case month===8: // SEP
                        self.completedConsultations_hash.put(consultation.project.manager, 'SEP'); break;
                      case month===9: // OCT
                        self.completedConsultations_hash.put(consultation.project.manager, 'OCT'); break;
                      case month===10: // NOV
                        self.completedConsultations_hash.put(consultation.project.manager, 'NOV'); break;
                      case month===11: // DEC
                        self.completedConsultations_hash.put(consultation.project.manager, 'DEC'); break;
                    }
                  }
                }
              });
              // Monthly Project Yield, use 2 hash to calculate
              _.each($scope.projectYield, function(project){
                // only project in this year are counted
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  if(project.manager.role === 'admin' || project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(project.startDate).getMonth();
                    switch(true){
                      case month===0: // JAN
                        self.consultationCount.put(project.manager, 'JAN', project.consultations.length);
                        self.projectCount.put(project.manager, 'JAN');
                        break;
                      case month===1: // FEB
                        self.consultationCount.put(project.manager, 'FEB', project.consultations.length);
                        self.projectCount.put(project.manager, 'FEB');
                        break;
                      case month===2: // MAR
                        self.consultationCount.put(project.manager, 'MAR', project.consultations.length);
                        self.projectCount.put(project.manager, 'MAR');
                        break;
                      case month===3: // APR
                        self.consultationCount.put(project.manager, 'APR', project.consultations.length);
                        self.projectCount.put(project.manager, 'APR');
                        break;
                      case month===4: // MAY
                        self.consultationCount.put(project.manager, 'MAY', project.consultations.length);
                        self.projectCount.put(project.manager, 'MAY');
                        break;
                      case month===5: // JUN
                        self.consultationCount.put(project.manager, 'JUN', project.consultations.length);
                        self.projectCount.put(project.manager, 'JUN');
                        break;
                      case month===6: // JUL
                        self.consultationCount.put(project.manager, 'JUL', project.consultations.length);
                        self.projectCount.put(project.manager, 'JUL');
                        break;
                      case month===7: // AUG
                        self.consultationCount.put(project.manager, 'AUG', project.consultations.length);
                        self.projectCount.put(project.manager, 'AUG');
                        break;
                      case month===8: // SEP
                        self.consultationCount.put(project.manager, 'SEP', project.consultations.length);
                        self.projectCount.put(project.manager, 'SEP');
                        break;
                      case month===9: // OCT
                        self.consultationCount.put(project.manager, 'OCT', project.consultations.length);
                        self.projectCount.put(project.manager, 'OCT');
                        break;
                      case month===10: // NOV
                        self.consultationCount.put(project.manager, 'NOV', project.consultations.length);
                        self.projectCount.put(project.manager, 'NOV');
                        break;
                      case month===11: // DEC
                        self.consultationCount.put(project.manager, 'DEC', project.consultations.length);
                        self.projectCount.put(project.manager, 'DEC');
                        break;
                    }
                  }
                }
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    // JAN
                    self.projectYield_hash.put(manager, 'JAN', ((self.consultationCount.hashes[key1]['JAN'] / self.projectCount.hashes[key2]['JAN']) || 0));
                    // FEB
                    self.projectYield_hash.put(manager, 'FEB', ((self.consultationCount.hashes[key1]['FEB'] / self.projectCount.hashes[key2]['FEB']) || 0));
                    // MAR
                    self.projectYield_hash.put(manager, 'MAR', ((self.consultationCount.hashes[key1]['MAR'] / self.projectCount.hashes[key2]['MAR']) || 0));
                    // APR
                    self.projectYield_hash.put(manager, 'APR', ((self.consultationCount.hashes[key1]['APR'] / self.projectCount.hashes[key2]['APR']) || 0));
                    // MAY
                    self.projectYield_hash.put(manager, 'MAY', ((self.consultationCount.hashes[key1]['MAY'] / self.projectCount.hashes[key2]['MAY']) || 0));
                    // JUN
                    self.projectYield_hash.put(manager, 'JUN', ((self.consultationCount.hashes[key1]['JUN'] / self.projectCount.hashes[key2]['JUN']) || 0));
                    // JUL
                    self.projectYield_hash.put(manager, 'JUL', ((self.consultationCount.hashes[key1]['JUL'] / self.projectCount.hashes[key2]['JUL']) || 0));
                    // AUG
                    self.projectYield_hash.put(manager, 'AUG', ((self.consultationCount.hashes[key1]['AUG'] / self.projectCount.hashes[key2]['AUG']) || 0));
                    // SEP
                    self.projectYield_hash.put(manager, 'SEP', ((self.consultationCount.hashes[key1]['SEP'] / self.projectCount.hashes[key2]['SEP']) || 0));
                    // OCT
                    self.projectYield_hash.put(manager, 'OCT', ((self.consultationCount.hashes[key1]['OCT'] / self.projectCount.hashes[key2]['OCT']) || 0));
                    // NOV
                    self.projectYield_hash.put(manager, 'NOV', ((self.consultationCount.hashes[key1]['NOV'] / self.projectCount.hashes[key2]['NOV']) || 0));
                    // DEC
                    self.projectYield_hash.put(manager, 'DEC', ((self.consultationCount.hashes[key1]['DEC'] / self.projectCount.hashes[key2]['DEC']) || 0));
                  }
                }
              }
              // Monthly Ranking
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  if(consultation.project.manager.role === 'admin' || consultation.project.manager.role === 'am'){
                    // only admin and am are count in this tab
                    // get the month
                    var month = new Date(consultation.completedDate).getMonth();
                    switch(true){
                      case month===0: // JAN
                        self.ranking_hash.put(consultation.project.manager, 'JAN'); break;
                      case month===1: // FEB
                        self.ranking_hash.put(consultation.project.manager, 'FEB'); break;
                      case month===2: // MAR
                        self.ranking_hash.put(consultation.project.manager, 'MAR'); break;
                      case month===3: // APR
                        self.ranking_hash.put(consultation.project.manager, 'APR'); break;
                      case month===4: // MAY
                        self.ranking_hash.put(consultation.project.manager, 'MAY'); break;
                      case month===5: // JUN
                        self.ranking_hash.put(consultation.project.manager, 'JUN'); break;
                      case month===6: // JUL
                        self.ranking_hash.put(consultation.project.manager, 'JUL'); break;
                      case month===7: // AUG
                        self.ranking_hash.put(consultation.project.manager, 'AUG'); break;
                      case month===8: // SEP
                        self.ranking_hash.put(consultation.project.manager, 'SEP'); break;
                      case month===9: // OCT
                        self.ranking_hash.put(consultation.project.manager, 'OCT'); break;
                      case month===10: // NOV
                        self.ranking_hash.put(consultation.project.manager, 'NOV'); break;
                      case month===11: // DEC
                        self.ranking_hash.put(consultation.project.manager, 'DEC'); break;
                    }
                  }
                }
              });
            }
            self.refreshGraph();
          },
          // Setup the graph settings
          getGraphOptions: function() {
            var self = this;
            var options = {};
            options = {
              chart: {
                  margin: {
                    left: 120
                  },
                  type: 'multiBarHorizontalChart',
                  height: 450,
                  x: function(d){return d.name;},
                  y: function(d){return d.value;},
                  showControls: false,
                  showValues: true,
                  showLegend: false,
                  transitionDuration: 500,
                  xAxis: {
                      width: 200,
                      rotateYLabel: false
                  },
                  yAxis: {
                      axisLabelDistance: 100,
                  },
                  tooltips: false
              }
            };
            if(self.status === 3){
              options.title = {
                enable: true,
                text: 'All Time',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            } else if(self.status === 2){
              options.title = {
                enable: true,
                text: 'Year to Date',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            }
            self.options = options;
          },

          // Place the data according to related hashes
          getGraphData: function() {
            var self = this;
            var data = {};
            if(self.filter === 'Total Projects'){
              var project = self.totalProjects_hash.index();
              project = project.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Total Projects",
                    "color": "#75c3b3",
                    "values": project
                  }
              ];
            } else if(self.filter === 'Completed Consultations'){
              var consultations = self.completedConsultations_hash.index();
              consultations = consultations.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Completed Consultations",
                    "color": "#75c3b3",
                    "values": consultations
                  }
              ];
            } else if(self.filter === 'Project Yield'){
              var project = self.projectYield_hash.index();
              project = project.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "Project Yield",
                    "color": "#75c3b3",
                    "values": project
                  }
              ];
            } else if(self.filter === 'AM Rank (# consultations)'){
              var ranking;
              if (self.status === 2 || self.status === 3) {
                // ytd, all-time
                ranking = self.ranking_hash;
                ranking = ranking.splice((self.currentPage-1)*10, 10);
              }
              data = [
                  {
                    "key": "AM Ranking",
                    "color": "#75c3b3",
                    "values": ranking
                  }
              ];
            }
            self.data = data;
          },
          // refresh the graph when filter changed
          refreshGraph: function() {
            var self = this;
            self.getGraphData();
            self.getGraphOptions();
          }
        };
        $scope.AccountManagerTab.mapData();
        /**
         * Everything about the Researcher tab
         * Researcher include roles : researcher
         */
        $scope.ResearcherTab = {
          // status for the tab
          // 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
          filterOptions:[
            'Total Projects',
            'Completed Consultations',
            'Project Yield',
            // 'Revenue',
            'Researcher Rank (# consultations)'
          ],
          /**
           * Filter the type of data wanted
           */
          filter: 'Total Projects',
          status: 0,
          currentPage: 1,
          data: [],
          options: {
              chart: {
                  margin: {
                    left: 120
                  },
                  type: 'multiBarHorizontalChart',
                  height: 450,
                  x: function(d){return d.name;},
                  y: function(d){return d.value;},
                  showControls: false,
                  showValues: true,
                  showLegend: false,
                  transitionDuration: 500,
                  xAxis: {
                      width: 200,
                      rotateYLabel: false
                  },
                  yAxis: {
                      axisLabelDistance: 100
                  }
              }
            },
          // values in this tab
          // Total Projects
          totalProjects: [],
          totalProjects_hash: {}, // the mapping of am <-> # of projects
          // Total Completed Consultations
          completedConsultations: [],
          completedConsultations_hash: {}, // the mapping of am <-> # of consultations
          cancelledConsultations: [],
          cancelledConsultations_hash: {}, // the mapping of am <-> # of consultations
          // Average # of Consultation / project
          projectYield: [],
          projectYield_hash: {},
          projectCount : {},
          consultationCount: {},
          // Revenue
          revenue: [],
          revenue_hash: {},
          responseTime: [],
          responseTime_hash: {},
          firstProfileSent: [],
          firstProfileSent_hash: {},
          // top10 Reseacher
          ranking: [],
          ranking_hash: {},

          /**
           * Selects the time series and refresh the datas
           * @index: the index for time series
           * 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
           */
          select: function (index) {
            var self = this;
            self.status = index;
            console.log('Select Researcher Tab', self.status);
            self.mapData();
          },
          // Map the data only if itemLength is equal to number of data Http.get()
          mapData: function() {
            var self = this;
            var year = new Date().getFullYear();
            // re-create the hash according to time series
            if (self.status === 0) {
              self.totalProjects_hash = new HashTableMonth();
              self.completedConsultations_hash = new HashTableMonth();
              self.consultationCount = new HashTableMonth();
              self.projectCount = new HashTableMonth();
              self.projectYield_hash = new HashTableMonth();
              self.ranking_hash = new HashTableMonth();
            } else if (self.status === 1) {

              self.totalProjects_hash = new HashTableQuarter();
              self.completedConsultations_hash = new HashTableQuarter();
              self.consultationCount = new HashTableQuarter();
              self.projectCount = new HashTableQuarter();
              self.projectYield_hash = new HashTableQuarter();
              self.ranking_hash = new HashTableQuarter();

            } else {
              self.totalProjects_hash = new HashTableGraph();
              self.completedConsultations_hash = new HashTableGraph();
              self.consultationCount = new HashTableGraph();
              self.projectCount = new HashTableGraph();
              self.projectYield_hash = new HashTableGraph();
              self.ranking_hash = new HashTableGraph();
            }
            // start hashing the data depend on the status(time)
            if(self.status === 3){
              // ALL Time Project
              _.each($scope.totalProjects, function(project){
                _.each(project.members, function(member){
                  if(member.role === 'researcher'){
                    // only admin and am are count in this tab
                    self.totalProjects_hash.put(member);
                  }
                });
              });
              // ALL Time Completed Consultations
              _.each($scope.completedConsultations, function(consultation){
                _.each(consultation.project.members, function(member){
                  if(member.role === 'researcher'){
                    self.completedConsultations_hash.put(member);
                  }
                });
              });
              // ALL Time Project Yield, use 2 hashes
              _.each($scope.projectYield, function(project){
                _.each(project.members, function(member){
                    if(member.role === 'researcher'){
                      // only admin and am are count in this tab
                      self.consultationCount.put(member, project.consultations.length);
                      self.projectCount.put(member);
                    }
                  });
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    self.projectYield_hash.put(manager, ((self.consultationCount.hashes[key1].value / self.projectCount.hashes[key2].value) || 0));
                  }
                }
              }
              // All time Top 10 Researchers
              self.ranking_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse();
            } else if (self.status === 2) {
              // Year to Date Projects
              _.each($scope.totalProjects, function(project){
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  _.each(project.members, function(member){
                    if(member.role === 'researcher'){
                      self.totalProjects_hash.put(member);
                    }
                  });
                }
              });
              // Year to Date consultations
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  _.each(consultation.project.members, function(member){
                    if(member.role === 'researcher'){
                      self.completedConsultations_hash.put(member);
                    }
                  });
                }
              });
              // Year to Date Project Yield, use 2 hash to calculate
              _.each($scope.projectYield, function(project){
                // only project in this year are counted
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  _.each(project.members, function(member){
                    if(member.role === 'researcher'){
                      self.consultationCount.put(member, project.consultations.length);
                      self.projectCount.put(member);
                    }
                  });
                }
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    self.projectYield_hash.put(manager, ((self.consultationCount.hashes[key1].value / self.projectCount.hashes[key2].value) || 0));
                  }
                }
              }
              // Year to Date Top 10 Researchers
              self.ranking_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse();
            } else if (self.status === 1){
              // Quarte Project
              _.each($scope.totalProjects, function(project){
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  _.each(project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(project.startDate).getMonth();
                      switch(true){
                        case month>=0 && month<3:
                          // JAN to Mar
                          self.totalProjects_hash.put(member, 'q1');
                          break;
                        case month>=3 && month<6:
                          // APR to JUN
                          self.totalProjects_hash.put(member, 'q2');
                          break;
                        case month>=6 && month<9:
                          // JUL to SEP
                          self.totalProjects_hash.put(member, 'q3');
                          break;
                        case month>=9 && month<12:
                          // OCT to DEC
                          self.totalProjects_hash.put(member, 'q4');
                          break;
                      }
                    }
                  });
                }
              });
              // Quarte Consultations
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  _.each(consultation.project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(consultation.completedDate).getMonth();
                      switch(true){
                        case month>=0 && month<3:
                          // JAN to Mar
                          self.completedConsultations_hash.put(member, 'q1');
                          break;
                        case month>=3 && month<6:
                          // APR to JUN
                          self.completedConsultations_hash.put(member, 'q2');
                          break;
                        case month>=6 && month<9:
                          // JUL to SEP
                          self.completedConsultations_hash.put(member, 'q3');
                          break;
                        case month>=9 && month<12:
                          // OCT to DEC
                          self.completedConsultations_hash.put(member, 'q4');
                          break;
                      }
                    }
                  });
                }
              });
              // Quarte Project Yield, use 2 hash to calculate
              _.each($scope.projectYield, function(project){
                // only project in this year are counted
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  _.each(project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(project.startDate).getMonth();
                      switch(true){
                        case month>=0 && month<3:
                          // JAN to Mar
                          self.consultationCount.put(member, 'q1', project.consultations.length);
                          self.projectCount.put(member, 'q1');
                          break;
                        case month>=3 && month<6:
                          // APR to JUN
                          self.consultationCount.put(member, 'q2', project.consultations.length);
                          self.projectCount.put(member, 'q2');
                          break;
                        case month>=6 && month<9:
                          // JUL to SEP
                          self.consultationCount.put(member, 'q3', project.consultations.length);
                          self.projectCount.put(member, 'q3');
                          break;
                        case month>=9 && month<12:
                          // OCT to DEC
                          self.consultationCount.put(member, 'q4', project.consultations.length);
                          self.projectCount.put(member, 'q4');
                          break;
                      }
                    }
                  });
                }
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    // q1
                    self.projectYield_hash.put(manager, 'q1', ((self.consultationCount.hashes[key1]['q1'] / self.projectCount.hashes[key2]['q1']) || 0));
                    // q2
                    self.projectYield_hash.put(manager, 'q2', ((self.consultationCount.hashes[key1]['q2'] / self.projectCount.hashes[key2]['q2']) || 0));
                    // q3
                    self.projectYield_hash.put(manager, 'q3', ((self.consultationCount.hashes[key1]['q3'] / self.projectCount.hashes[key2]['q3']) || 0));
                    // q4
                    self.projectYield_hash.put(manager, 'q4', ((self.consultationCount.hashes[key1]['q4'] / self.projectCount.hashes[key2]['q4']) || 0));
                  }
                }
              }
              // Quarte Top 10 Researchers
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  _.each(consultation.project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(consultation.completedDate).getMonth();
                      switch(true){
                        case month>=0 && month<3:
                          // JAN to Mar
                          self.ranking_hash.put(member, 'q1');
                          break;
                        case month>=3 && month<6:
                          // APR to JUN
                          self.ranking_hash.put(member, 'q2');
                          break;
                        case month>=6 && month<9:
                          // JUL to SEP
                          self.ranking_hash.put(member, 'q3');
                          break;
                        case month>=9 && month<12:
                          // OCT to DEC
                          self.ranking_hash.put(member, 'q4');
                          break;
                      }
                    }
                  });
                }
              });
            } else {
              // Monthly Projects
              _.each($scope.totalProjects, function(project){
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  _.each(project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(project.startDate).getMonth();
                      switch(true){
                        case month===0: // JAN
                          self.totalProjects_hash.put(member, 'JAN'); break;
                        case month===1: // FEB
                          self.totalProjects_hash.put(member, 'FEB'); break;
                        case month===2: // MAR
                          self.totalProjects_hash.put(member, 'MAR'); break;
                        case month===3: // APR
                          self.totalProjects_hash.put(member, 'APR'); break;
                        case month===4: // MAY
                          self.totalProjects_hash.put(member, 'MAY'); break;
                        case month===5: // JUN
                          self.totalProjects_hash.put(member, 'JUN'); break;
                        case month===6: // JUL
                          self.totalProjects_hash.put(member, 'JUL'); break;
                        case month===7: // AUG
                          self.totalProjects_hash.put(member, 'AUG'); break;
                        case month===8: // SEP
                          self.totalProjects_hash.put(member, 'SEP'); break;
                        case month===9: // OCT
                          self.totalProjects_hash.put(member, 'OCT'); break;
                        case month===10: // NOV
                          self.totalProjects_hash.put(member, 'NOV'); break;
                        case month===11: // DEC
                          self.totalProjects_hash.put(member, 'DEC'); break;
                      }
                    }
                  });
                }
              });
              // Monthly Consultations
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  _.each(consultation.project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(consultation.completedDate).getMonth();
                      switch(true){
                        case month===0: // JAN
                          self.completedConsultations_hash.put(member, 'JAN'); break;
                        case month===1: // FEB
                          self.completedConsultations_hash.put(member, 'FEB'); break;
                        case month===2: // MAR
                          self.completedConsultations_hash.put(member, 'MAR'); break;
                        case month===3: // APR
                          self.completedConsultations_hash.put(member, 'APR'); break;
                        case month===4: // MAY
                          self.completedConsultations_hash.put(member, 'MAY'); break;
                        case month===5: // JUN
                          self.completedConsultations_hash.put(member, 'JUN'); break;
                        case month===6: // JUL
                          self.completedConsultations_hash.put(member, 'JUL'); break;
                        case month===7: // AUG
                          self.completedConsultations_hash.put(member, 'AUG'); break;
                        case month===8: // SEP
                          self.completedConsultations_hash.put(member, 'SEP'); break;
                        case month===9: // OCT
                          self.completedConsultations_hash.put(member, 'OCT'); break;
                        case month===10: // NOV
                          self.completedConsultations_hash.put(member, 'NOV'); break;
                        case month===11: // DEC
                          self.completedConsultations_hash.put(member, 'DEC'); break;
                      }
                    }
                  });
                }
              });
              // Monthly Project Yield, use 2 hash to calculate
              _.each($scope.projectYield, function(project){
                // only project in this year are counted
                var projectYear = new Date(project.startDate).getFullYear();
                if(projectYear === year){
                  _.each(project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(project.startDate).getMonth();
                      switch(true){
                        case month===0: // JAN
                          self.consultationCount.put(member, 'JAN', project.consultations.length);
                          self.projectCount.put(member, 'JAN');
                          break;
                        case month===1: // FEB
                          self.consultationCount.put(member, 'FEB', project.consultations.length);
                          self.projectCount.put(member, 'FEB');
                          break;
                        case month===2: // MAR
                          self.consultationCount.put(member, 'MAR', project.consultations.length);
                          self.projectCount.put(member, 'MAR');
                          break;
                        case month===3: // APR
                          self.consultationCount.put(member, 'APR', project.consultations.length);
                          self.projectCount.put(member, 'APR');
                          break;
                        case month===4: // MAY
                          self.consultationCount.put(member, 'MAY', project.consultations.length);
                          self.projectCount.put(member, 'MAY');
                          break;
                        case month===5: // JUN
                          self.consultationCount.put(member, 'JUN', project.consultations.length);
                          self.projectCount.put(member, 'JUN');
                          break;
                        case month===6: // JUL
                          self.consultationCount.put(member, 'JUL', project.consultations.length);
                          self.projectCount.put(member, 'JUL');
                          break;
                        case month===7: // AUG
                          self.consultationCount.put(member, 'AUG', project.consultations.length);
                          self.projectCount.put(member, 'AUG');
                          break;
                        case month===8: // SEP
                          self.consultationCount.put(member, 'SEP', project.consultations.length);
                          self.projectCount.put(member, 'SEP');
                          break;
                        case month===9: // OCT
                          self.consultationCount.put(member, 'OCT', project.consultations.length);
                          self.projectCount.put(member, 'OCT');
                          break;
                        case month===10: // NOV
                          self.consultationCount.put(member, 'NOV', project.consultations.length);
                          self.projectCount.put(member, 'NOV');
                          break;
                        case month===11: // DEC
                          self.consultationCount.put(member, 'DEC', project.consultations.length);
                          self.projectCount.put(member, 'DEC');
                          break;
                      }
                    }
                  });
                }
              });
              for (var key1 in self.consultationCount.hashes){
                for(var key2 in self.projectCount.hashes){
                  if(key1 === key2){
                    // get manager object
                    var manager = {
                      _id: key1,
                      name: self.consultationCount.hashes[key1].name
                    };
                    // JAN
                    self.projectYield_hash.put(manager, 'JAN', ((self.consultationCount.hashes[key1]['JAN'] / self.projectCount.hashes[key2]['JAN']) || 0));
                    // FEB
                    self.projectYield_hash.put(manager, 'FEB', ((self.consultationCount.hashes[key1]['FEB'] / self.projectCount.hashes[key2]['FEB']) || 0));
                    // MAR
                    self.projectYield_hash.put(manager, 'MAR', ((self.consultationCount.hashes[key1]['MAR'] / self.projectCount.hashes[key2]['MAR']) || 0));
                    // APR
                    self.projectYield_hash.put(manager, 'APR', ((self.consultationCount.hashes[key1]['APR'] / self.projectCount.hashes[key2]['APR']) || 0));
                    // MAY
                    self.projectYield_hash.put(manager, 'MAY', ((self.consultationCount.hashes[key1]['MAY'] / self.projectCount.hashes[key2]['MAY']) || 0));
                    // JUN
                    self.projectYield_hash.put(manager, 'JUN', ((self.consultationCount.hashes[key1]['JUN'] / self.projectCount.hashes[key2]['JUN']) || 0));
                    // JUL
                    self.projectYield_hash.put(manager, 'JUL', ((self.consultationCount.hashes[key1]['JUL'] / self.projectCount.hashes[key2]['JUL']) || 0));
                    // AUG
                    self.projectYield_hash.put(manager, 'AUG', ((self.consultationCount.hashes[key1]['AUG'] / self.projectCount.hashes[key2]['AUG']) || 0));
                    // SEP
                    self.projectYield_hash.put(manager, 'SEP', ((self.consultationCount.hashes[key1]['SEP'] / self.projectCount.hashes[key2]['SEP']) || 0));
                    // OCT
                    self.projectYield_hash.put(manager, 'OCT', ((self.consultationCount.hashes[key1]['OCT'] / self.projectCount.hashes[key2]['OCT']) || 0));
                    // NOV
                    self.projectYield_hash.put(manager, 'NOV', ((self.consultationCount.hashes[key1]['NOV'] / self.projectCount.hashes[key2]['NOV']) || 0));
                    // DEC
                    self.projectYield_hash.put(manager, 'DEC', ((self.consultationCount.hashes[key1]['DEC'] / self.projectCount.hashes[key2]['DEC']) || 0));
                  }
                }
              }
              // Monthly Top 10 Researchers
              _.each($scope.completedConsultations, function(consultation){
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if(consultationYear === year){
                  _.each(consultation.project.members, function(member){
                    if(member.role === 'researcher'){
                      // get the month
                      var month = new Date(consultation.completedDate).getMonth();
                      switch(true){
                        case month===0: // JAN
                          self.ranking_hash.put(member, 'JAN'); break;
                        case month===1: // FEB
                          self.ranking_hash.put(member, 'FEB'); break;
                        case month===2: // MAR
                          self.ranking_hash.put(member, 'MAR'); break;
                        case month===3: // APR
                          self.ranking_hash.put(member, 'APR'); break;
                        case month===4: // MAY
                          self.ranking_hash.put(member, 'MAY'); break;
                        case month===5: // JUN
                          self.ranking_hash.put(member, 'JUN'); break;
                        case month===6: // JUL
                          self.ranking_hash.put(member, 'JUL'); break;
                        case month===7: // AUG
                          self.ranking_hash.put(member, 'AUG'); break;
                        case month===8: // SEP
                          self.ranking_hash.put(member, 'SEP'); break;
                        case month===9: // OCT
                          self.ranking_hash.put(member, 'OCT'); break;
                        case month===10: // NOV
                          self.ranking_hash.put(member, 'NOV'); break;
                        case month===11: // DEC
                          self.ranking_hash.put(member, 'DEC'); break;
                      }
                    }
                  });
                }
              });
            }
            self.refreshGraph();
          },
          // Setup the graph settings
          getGraphOptions: function() {
            var self = this;
            var options = {};
            options = {
              chart: {
                  margin: {
                    left: 120
                  },
                  type: 'multiBarHorizontalChart',
                  height: 450,
                  x: function(d){return d.name;},
                  y: function(d){return d.value;},
                  showControls: false,
                  showValues: true,
                  showLegend: false,
                  transitionDuration: 500,
                  xAxis: {
                      width: 200,
                      rotateYLabel: false
                  },
                  yAxis: {
                      axisLabelDistance: 100
                  },
                  tooltips: false
              }
            };
            if(self.status === 3){
              options.title = {
                enable: true,
                text: 'All Time',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            } else if(self.status === 2){
              options.title = {
                enable: true,
                text: 'Year to Date',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            }
            self.options = options;
          },

          // Place the data according to related hashes
          getGraphData: function() {
            var self = this;
            var data = {};
            if(self.filter === 'Total Projects'){
              var project = self.totalProjects_hash.index();
              project = project.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Total Projects",
                    "color": "#75c3b3",
                    "values": project
                  }
              ];
            } else if(self.filter === 'Completed Consultations'){
              var consultations = self.completedConsultations_hash.index();
              consultations = consultations.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Completed Consultations",
                    "color": "#75c3b3",
                    "values": consultations
                  }
              ];
            } else if(self.filter === 'Project Yield'){
              var project = self.projectYield_hash.index();
              project = project.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "Project Yield",
                    "color": "#75c3b3",
                    "values": project
                  }
              ];
            } else if(self.filter === 'Researcher Rank (# consultations)'){
              var ranking;
              if (self.status === 2 || self.status === 3) {
                // ytd, all-time
                ranking = self.ranking_hash;
                ranking = ranking.splice((self.currentPage-1)*10, 10);
              }
              data = [
                  {
                    "key": "Reseacher Ranking",
                    "color": "#75c3b3",
                    "values": ranking
                  }
              ];
            }
            self.data = data;
          },
          // refresh the graph when filter changed
          refreshGraph: function() {
            var self = this;
            self.getGraphData();
            self.getGraphOptions();
          }
        };
        $scope.ResearcherTab.mapData();
        /**
         * Everything about the Client tab
         */
        $scope.ClientTab = {
          // status for the tab
          // 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
          filterOptions:[
            'Total Projects',
            'Total Consultations',
            // 'Total Revenue',
            // 'Last Active',
            'Top 10 Clients'
          ],
          /**
           * Filter the type of data wanted
           */
          filter: 'Total Projects',
          status: 0,
          currentPage: 1,
          data: [],
          options: {},
          // values in this tab
          // Total Projects
          totalProjects: [],
          totalProjects_hash: {}, // the mapping of am <-> # of projects
          // Total Completed Consultations
          completedConsultations: [],
          completedConsultations_hash: {}, // the mapping of am <-> # of consultations
          // Top 10 Clients
          top10Clients: [],
          top10Clients_hash: {},
          /**
           * Selects the time series and refresh the datas
           * @index: the index for time series
           * 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
           */
          select: function (index) {
            var self = this;
            self.status = index;
            console.log('Select Client Tab', self.status);
            self.mapData();
          },
          // Map the data only if itemLength is equal to number of data Http.get()
          mapData: function() {
            var self = this;
            var year = new Date().getFullYear();

            // re-create the hash according to time series
            if (self.status === 0) {

              self.totalProjects_hash = new HashTableMonth('objectId');
              self.completedConsultations_hash = new HashTableMonth('objectId');
              self.top10Clients_hash = new HashTableMonth('objectId');

            } else if (self.status === 1) {

              self.totalProjects_hash = new HashTableQuarter('objectId');
              self.completedConsultations_hash = new HashTableQuarter('objectId');
              self.top10Clients_hash = new HashTableQuarter('objectId');

            } else {

              self.totalProjects_hash = new HashTableGraph('objectId');
              self.completedConsultations_hash = new HashTableGraph('objectId');
              self.top10Clients_hash = new HashTableGraph('objectId');
            }

            // start hashing the data depend on the status(time)
            if (self.status === 3) {
              // ALL Time Project
              _.each($scope.totalProjects, function(project) {
                self.totalProjects_hash.put(project.account[0]);
              });
              // ALL Time Completed Consultations
              _.each($scope.completedConsultations, function(consultation){
                self.completedConsultations_hash.put(consultation.account[0]);
              });
              // Top 10 Clients
              self.top10Clients_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse().slice(0,10);

            } else if (self.status === 2) {
              // Year to Date Projects
              _.each($scope.totalProjects, function(project) {
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if (projectYear === year) {
                  self.totalProjects_hash.put(project.account[0]);
                }
              });
              // Year to Date consultations
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  self.completedConsultations_hash.put(consultation.account[0]);
                }
              });
              // Top 10 Clients
              self.top10Clients_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse().slice(0,10);

            } else if (self.status === 1) {

              // Quarterly Project
              _.each($scope.totalProjects, function(project) {
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if (projectYear === year) {

                  // only admin and am are count in this tab
                  // get the month
                  var month = new Date(project.startDate).getMonth();
                  switch(true) {
                    case month>=0 && month<3:
                      // JAN to Mar
                      self.totalProjects_hash.put(project.account[0], 'q1');
                      break;
                    case month>=3 && month<6:
                      // APR to JUN
                      self.totalProjects_hash.put(project.account[0], 'q2');
                      break;
                    case month>=6 && month<9:
                      // JUL to SEP
                      self.totalProjects_hash.put(project.account[0], 'q3');
                      break;
                    case month>=9 && month<12:
                      // OCT to DEC
                      self.totalProjects_hash.put(project.account[0], 'q4');
                      break;
                  };
                }
              });

              // Quarterly Consultations
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true){
                    case month>=0 && month<3:
                      // JAN to Mar
                      self.completedConsultations_hash.put(consultation.account[0], 'q1');
                      break;
                    case month>=3 && month<6:
                      // APR to JUN
                      self.completedConsultations_hash.put(consultation.account[0], 'q2');
                      break;
                    case month>=6 && month<9:
                      // JUL to SEP
                      self.completedConsultations_hash.put(consultation.account[0], 'q3');
                      break;
                    case month>=9 && month<12:
                      // OCT to DEC
                      self.completedConsultations_hash.put(consultation.account[0], 'q4');
                      break;
                  }
                }
              });

              // Top 10 Clients
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true){
                    case month>=0 && month<3:
                      // JAN to Mar
                      self.top10Clients_hash.put(consultation.account[0], 'q1');
                      break;
                    case month>=3 && month<6:
                      // APR to JUN
                      self.top10Clients_hash.put(consultation.account[0], 'q2');
                      break;
                    case month>=6 && month<9:
                      // JUL to SEP
                      self.top10Clients_hash.put(consultation.account[0], 'q3');
                      break;
                    case month>=9 && month<12:
                      // OCT to DEC
                      self.top10Clients_hash.put(consultation.account[0], 'q4');
                      break;
                  }
                }
              });


            } else {

              // Monthly Projects
              _.each($scope.totalProjects, function(project) {
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if (projectYear === year) {

                  // only admin and am are count in this tab
                  // get the month
                  var month = new Date(project.startDate).getMonth();
                  switch(true) {
                    case month===0: // JAN
                      self.totalProjects_hash.put(project.account[0], 'JAN'); break;
                    case month===1: // FEB
                      self.totalProjects_hash.put(project.account[0], 'FEB'); break;
                    case month===2: // MAR
                      self.totalProjects_hash.put(project.account[0], 'MAR'); break;
                    case month===3: // APR
                      self.totalProjects_hash.put(project.account[0], 'APR'); break;
                    case month===4: // MAY
                      self.totalProjects_hash.put(project.account[0], 'MAY'); break;
                    case month===5: // JUN
                      self.totalProjects_hash.put(project.account[0], 'JUN'); break;
                    case month===6: // JUL
                      self.totalProjects_hash.put(project.account[0], 'JUL'); break;
                    case month===7: // AUG
                      self.totalProjects_hash.put(project.account[0], 'AUG'); break;
                    case month===8: // SEP
                      self.totalProjects_hash.put(project.account[0], 'SEP'); break;
                    case month===9: // OCT
                      self.totalProjects_hash.put(project.account[0], 'OCT'); break;
                    case month===10: // NOV
                      self.totalProjects_hash.put(project.account[0], 'NOV'); break;
                    case month===11: // DEC
                      self.totalProjects_hash.put(project.account[0], 'DEC'); break;
                  };

                }
              });

              // Monthly Consultations
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true) {
                    case month===0: // JAN
                      self.completedConsultations_hash.put(consultation.account[0], 'JAN'); break;
                    case month===1: // FEB
                      self.completedConsultations_hash.put(consultation.account[0], 'FEB'); break;
                    case month===2: // MAR
                      self.completedConsultations_hash.put(consultation.account[0], 'MAR'); break;
                    case month===3: // APR
                      self.completedConsultations_hash.put(consultation.account[0], 'APR'); break;
                    case month===4: // MAY
                      self.completedConsultations_hash.put(consultation.account[0], 'MAY'); break;
                    case month===5: // JUN
                      self.completedConsultations_hash.put(consultation.account[0], 'JUN'); break;
                    case month===6: // JUL
                      self.completedConsultations_hash.put(consultation.account[0], 'JUL'); break;
                    case month===7: // AUG
                      self.completedConsultations_hash.put(consultation.account[0], 'AUG'); break;
                    case month===8: // SEP
                      self.completedConsultations_hash.put(consultation.account[0], 'SEP'); break;
                    case month===9: // OCT
                      self.completedConsultations_hash.put(consultation.account[0], 'OCT'); break;
                    case month===10: // NOV
                      self.completedConsultations_hash.put(consultation.account[0], 'NOV'); break;
                    case month===11: // DEC
                      self.completedConsultations_hash.put(consultation.account[0], 'DEC'); break;
                  };
                }
              });

              // Top 10 Clients
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true) {
                    case month===0: // JAN
                      self.top10Clients_hash.put(consultation.account[0], 'JAN'); break;
                    case month===1: // FEB
                      self.top10Clients_hash.put(consultation.account[0], 'FEB'); break;
                    case month===2: // MAR
                      self.top10Clients_hash.put(consultation.account[0], 'MAR'); break;
                    case month===3: // APR
                      self.top10Clients_hash.put(consultation.account[0], 'APR'); break;
                    case month===4: // MAY
                      self.top10Clients_hash.put(consultation.account[0], 'MAY'); break;
                    case month===5: // JUN
                      self.top10Clients_hash.put(consultation.account[0], 'JUN'); break;
                    case month===6: // JUL
                      self.top10Clients_hash.put(consultation.account[0], 'JUL'); break;
                    case month===7: // AUG
                      self.top10Clients_hash.put(consultation.account[0], 'AUG'); break;
                    case month===8: // SEP
                      self.top10Clients_hash.put(consultation.account[0], 'SEP'); break;
                    case month===9: // OCT
                      self.top10Clients_hash.put(consultation.account[0], 'OCT'); break;
                    case month===10: // NOV
                      self.top10Clients_hash.put(consultation.account[0], 'NOV'); break;
                    case month===11: // DEC
                      self.top10Clients_hash.put(consultation.account[0], 'DEC'); break;
                  };
                }
              });

            }

            self.refreshGraph();
          },

          // Setup the graph settings
          getGraphOptions: function() {
            var self = this;
            var options = {};
            options = {
              chart: {
                  margin: {
                    left: 120
                  },
                  type: 'multiBarHorizontalChart',
                  height: 450,
                  x: function(d){return d.name;},
                  y: function(d){return d.value;},
                  showControls: false,
                  showValues: true,
                  showLegend: false,
                  transitionDuration: 500,
                  xAxis: {
                      width: 200,
                      rotateYLabel: false
                  },
                  yAxis: {
                      axisLabelDistance: 100
                  },
                  tooltips: false
              }
            };
            if (self.status === 3) {
              options.title = {
                enable: true,
                text: 'All Time',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            } else if (self.status === 2) {
              options.title = {
                enable: true,
                text: 'Year to Date',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            }
            self.options = options;
          },

          // Place the data according to related hashes
          getGraphData: function() {
            var self = this;
            var data = {};
            if(self.filter === 'Total Projects'){
              var project = self.totalProjects_hash.index();
              project = project.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Total Projects",
                    "color": "#75c3b3",
                    "values": project
                  }
              ];
            } else if(self.filter === 'Total Consultations'){
              var consultations = self.completedConsultations_hash.index();
              consultations = consultations.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Total Consultations",
                    "color": "#75c3b3",
                    "values": consultations
                  }
              ];
            } else if (self.filter === 'Top 10 Clients') {

              var top10Clients;
              if (self.status === 2 || self.status === 3) {
                // ytd, all-time
                top10Clients = self.top10Clients_hash;
              }

              console.log('top10Clients', top10Clients);

              data = [
                {
                  "key": "Top 10 Clients",
                  "color": "#75c3b3",
                  "values": top10Clients
                }
              ];
            }
            self.data = data;
          },
          // refresh the graph when filter changed
          refreshGraph: function() {
            var self = this;
            self.getGraphData();
            self.getGraphOptions();
          }
        };
        $scope.ClientTab.mapData();
        /**
         * Everything about the Expert tab
         */
        $scope.ExpertTab = {
          // status for the tab
          // 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
          filterOptions:[
            'Total Projects',
            'Total Consultations',
            // 'Total Revenue',
            // 'Last Active',
            'Top 10 Experts'
          ],
          /**
           * Filter the type of data wanted
           */
          filter: 'Total Projects',
          status: 0,
          currentPage: 1,
          data: [],
          options: {},
          // values in this tab
          // Total Projects
          totalProjects: [],
          totalProjects_hash: {}, // the mapping of am <-> # of projects
          // Total Completed Consultations
          completedConsultations: [],
          completedConsultations_hash: {}, // the mapping of am <-> # of consultations
          // Top 10 Clients
          top10Experts: [],
          top10Experts_hash: {},
          /**
           * Selects the time series and refresh the datas
           * @index: the index for time series
           * 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
           */
          select: function (index) {
            var self = this;
            self.status = index;
            console.log('Select Expert Tab', self.status);
            self.mapData();
          },
          // Map the data only if itemLength is equal to number of data Http.get()
          mapData: function() {
            var self = this;
            var year = new Date().getFullYear();

            // re-create the hash according to time series
            if (self.status === 0) {
              self.totalProjects_hash = new HashTableMonth();
              self.completedConsultations_hash = new HashTableMonth();
              self.top10Experts_hash = new HashTableMonth();
            } else if (self.status === 1) {
              self.totalProjects_hash = new HashTableQuarter();
              self.completedConsultations_hash = new HashTableQuarter();
              self.top10Experts_hash = new HashTableQuarter();
            } else {
              self.totalProjects_hash = new HashTableGraph();
              self.completedConsultations_hash = new HashTableGraph();
              self.top10Experts_hash = new HashTableGraph();
            }

            // start hashing the data depend on the status(time)
            if (self.status === 3) {
              // ALL Time Project
              _.each($scope.totalProjects, function(project) {
                _.each(project.experts, function(expert){
                  self.totalProjects_hash.put(expert);
                });
              });
              // ALL Time Completed Consultations
              _.each($scope.completedConsultations, function(consultation){
                self.completedConsultations_hash.put(consultation.expert);
              });
              // Top 10 Clients
              self.top10Experts_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse().slice(0,10);

            } else if (self.status === 2) {
              // Year to Date Projects
              _.each($scope.totalProjects, function(project) {
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if (projectYear === year) {
                  _.each(project.experts, function(expert){
                    self.totalProjects_hash.put(expert);
                  });
                }
              });
              // Year to Date consultations
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  self.completedConsultations_hash.put(consultation.expert);
                }
              });
              // Top 10 Experts
              self.top10Experts_hash = _.sortBy(self.completedConsultations_hash.index(), ['value'], ['asc'], null).reverse().slice(0,10);

            } else if (self.status === 1) {

              // Quarterly Project
              _.each($scope.totalProjects, function(project) {
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if (projectYear === year) {

                  // only admin and am are count in this tab
                  // get the month
                  var month = new Date(project.startDate).getMonth();
                  switch(true) {
                    case month>=0 && month<3:
                      // JAN to Mar
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'q1');
                      });
                      break;
                    case month>=3 && month<6:
                      // APR to JUN
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'q2');
                      });
                      break;
                    case month>=6 && month<9:
                      // JUL to SEP
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'q3');
                      });
                      break;
                    case month>=9 && month<12:
                      // OCT to DEC
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'q4');
                      });
                      break;
                  };
                }
              });

              // Quarterly Consultations
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true){
                    case month>=0 && month<3:
                      // JAN to Mar
                      self.completedConsultations_hash.put(consultation.expert, 'q1');
                      break;
                    case month>=3 && month<6:
                      // APR to JUN
                      self.completedConsultations_hash.put(consultation.expert, 'q2');
                      break;
                    case month>=6 && month<9:
                      // JUL to SEP
                      self.completedConsultations_hash.put(consultation.expert, 'q3');
                      break;
                    case month>=9 && month<12:
                      // OCT to DEC
                      self.completedConsultations_hash.put(consultation.expert, 'q4');
                      break;
                  }
                }
              });

              // Top 10 Experts
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true){
                    case month>=0 && month<3:
                      // JAN to Mar
                      self.top10Experts_hash.put(consultation.expert, 'q1');
                      break;
                    case month>=3 && month<6:
                      // APR to JUN
                      self.top10Experts_hash.put(consultation.expert, 'q2');
                      break;
                    case month>=6 && month<9:
                      // JUL to SEP
                      self.top10Experts_hash.put(consultation.expert, 'q3');
                      break;
                    case month>=9 && month<12:
                      // OCT to DEC
                      self.top10Experts_hash.put(consultation.expert, 'q4');
                      break;
                  }
                }
              });


            } else {

              // Monthly Projects
              _.each($scope.totalProjects, function(project) {
                // only project in this year will be included
                var projectYear = new Date(project.startDate).getFullYear();
                if (projectYear === year) {
                  // get the month
                  var month = new Date(project.startDate).getMonth();
                  switch(true) {
                    case month===0: // JAN
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'JAN');
                      });
                      break;
                    case month===1: // FEB
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'FEB');
                      });
                      break;
                    case month===2: // MAR
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'MAR');
                      });
                      break;
                    case month===3: // APR
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'APR');
                      });
                      break;
                    case month===4: // MAY
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'MAY');
                      });
                      break;
                    case month===5: // JUN
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'JUN');
                      });
                      break;
                    case month===6: // JUL
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'JUL');
                      });
                      break;
                    case month===7: // AUG
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'AUG');
                      });
                      break;
                    case month===8: // SEP
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'SEP');
                      });
                      break;
                    case month===9: // OCT
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'OCT');
                      });
                      break;
                    case month===10: // NOV
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'NOV');
                      });
                      break;
                    case month===11: // DEC
                      _.each(project.experts, function(expert){
                        self.totalProjects_hash.put(expert, 'DEC');
                      });
                      break;
                  };

                }
              });

              // Monthly Consultations
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true) {
                    case month===0: // JAN
                      self.completedConsultations_hash.put(consultation.expert, 'JAN'); break;
                    case month===1: // FEB
                      self.completedConsultations_hash.put(consultation.expert, 'FEB'); break;
                    case month===2: // MAR
                      self.completedConsultations_hash.put(consultation.expert, 'MAR'); break;
                    case month===3: // APR
                      self.completedConsultations_hash.put(consultation.expert, 'APR'); break;
                    case month===4: // MAY
                      self.completedConsultations_hash.put(consultation.expert, 'MAY'); break;
                    case month===5: // JUN
                      self.completedConsultations_hash.put(consultation.expert, 'JUN'); break;
                    case month===6: // JUL
                      self.completedConsultations_hash.put(consultation.expert, 'JUL'); break;
                    case month===7: // AUG
                      self.completedConsultations_hash.put(consultation.expert, 'AUG'); break;
                    case month===8: // SEP
                      self.completedConsultations_hash.put(consultation.expert, 'SEP'); break;
                    case month===9: // OCT
                      self.completedConsultations_hash.put(consultation.expert, 'OCT'); break;
                    case month===10: // NOV
                      self.completedConsultations_hash.put(consultation.expert, 'NOV'); break;
                    case month===11: // DEC
                      self.completedConsultations_hash.put(consultation.expert, 'DEC'); break;
                  };
                }
              });

              // Top 10 Clients
              _.each($scope.completedConsultations, function(consultation) {
                // only project in this year will be included
                var consultationYear = new Date(consultation.completedDate).getFullYear();
                if (consultationYear === year) {
                  // get the month
                  var month = new Date(consultation.completedDate).getMonth();
                  switch(true) {
                    case month===0: // JAN
                      self.top10Experts_hash.put(consultation.expert, 'JAN'); break;
                    case month===1: // FEB
                      self.top10Experts_hash.put(consultation.expert, 'FEB'); break;
                    case month===2: // MAR
                      self.top10Experts_hash.put(consultation.expert, 'MAR'); break;
                    case month===3: // APR
                      self.top10Experts_hash.put(consultation.expert, 'APR'); break;
                    case month===4: // MAY
                      self.top10Experts_hash.put(consultation.expert, 'MAY'); break;
                    case month===5: // JUN
                      self.top10Experts_hash.put(consultation.expert, 'JUN'); break;
                    case month===6: // JUL
                      self.top10Experts_hash.put(consultation.expert, 'JUL'); break;
                    case month===7: // AUG
                      self.top10Experts_hash.put(consultation.expert, 'AUG'); break;
                    case month===8: // SEP
                      self.top10Experts_hash.put(consultation.expert, 'SEP'); break;
                    case month===9: // OCT
                      self.top10Experts_hash.put(consultation.expert, 'OCT'); break;
                    case month===10: // NOV
                      self.top10Experts_hash.put(consultation.expert, 'NOV'); break;
                    case month===11: // DEC
                      self.top10Experts_hash.put(consultation.expert, 'DEC'); break;
                  };
                }
              });
            }
            self.refreshGraph();
          },

          // Setup the graph settings
          getGraphOptions: function() {
            var self = this;
            var options = {};
            options = {
              chart: {
                  margin: {
                    left: 120
                  },
                  type: 'multiBarHorizontalChart',
                  height: 450,
                  x: function(d){return d.name;},
                  y: function(d){return d.value;},
                  showControls: false,
                  showValues: true,
                  showLegend: false,
                  transitionDuration: 500,
                  xAxis: {
                      width: 200,
                      rotateYLabel: false
                  },
                  yAxis: {
                      axisLabelDistance: 100
                  },
                  tooltips: false
              }
            };
            if (self.status === 3) {
              options.title = {
                enable: true,
                text: 'All Time',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            } else if (self.status === 2) {
              options.title = {
                enable: true,
                text: 'Year to Date',
                css: {
                  'font-size': '12px',
                  'color': '#b2b2b2',
                  'letter-spacing': '1px'
                }
              };
            }
            self.options = options;
          },

          // Place the data according to related hashes
          getGraphData: function() {
            var self = this;
            var data = {};
            if(self.filter === 'Total Projects'){
              var project = self.totalProjects_hash.index();
              project = project.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Total Projects",
                    "color": "#75c3b3",
                    "values": project
                  }
              ];
            } else if(self.filter === 'Total Consultations'){
              var consultations = self.completedConsultations_hash.index();
              consultations = consultations.splice((self.currentPage-1)*10, 10);
              data = [
                  {
                    "key": "# of Total Consultations",
                    "color": "#75c3b3",
                    "values": consultations
                  }
              ];
            } else if (self.filter === 'Top 10 Experts') {

              var top10Experts;
              if (self.status === 2 || self.status === 3) {
                // ytd, all-time
                top10Experts = self.top10Experts_hash;
              }

              console.log('top10Experts', top10Experts);

              data = [
                {
                  "key": "Top 10 Experts",
                  "color": "#75c3b3",
                  "values": top10Experts
                }
              ];
            }
            self.data = data;
          },
          // refresh the graph when filter changed
          refreshGraph: function() {
            var self = this;
            self.getGraphData();
            self.getGraphOptions();
          }
        };
        $scope.ExpertTab.mapData();
      }
    }

    /**
     * Hash Map constructor and related functions
     */
    function HashTableGraph(prop) {
      this.prop = prop || '_id';

      this.hashes = {};
      this.put = function( key , value ) {
        if(this.get(key) === undefined){
          this.hashes[ key[this.prop] ] = {};
          if(value === undefined){
            this.hashes[ key[this.prop] ] = {name: key.name, value: 1};
          } else {
            this.hashes[ key[this.prop] ] = {name: key.name, value: value};
          }
        } else {
          if(value === undefined){
            this.hashes[ key[this.prop] ].value++;
          } else {
            this.hashes[ key[this.prop] ].value += value;
          }
        }
      };
      this.get = function( key ) {
        return this.hashes[ key[this.prop] ];
      };
      this.index = function() {
        var arr = [];
        for(var key in this.hashes){
          arr.push(this.hashes[key]);
        }
        return arr;
      }
    }

    function HashTableQuarter(prop) {
      this.prop = prop || '_id';

      this.hashes = {};
      this.put = function( key, quarter, value ){
        if(this.get(key) === undefined){
          this.hashes[ key[this.prop] ] = {name: key.name, q1:0, q2:0, q3:0, q4:0};
          if(value === undefined){
            this.hashes[ key[this.prop] ][quarter]++;
          } else {
            this.hashes[ key[this.prop] ][quarter] += value;
          }
        } else {
          if(value === undefined){
            this.hashes[ key[this.prop] ][quarter]++;
          } else {
            this.hashes[ key[this.prop] ][quarter] += value;
          }
        }
      };
      this.get = function( key ) {
        return this.hashes[ key[this.prop] ];
      };
      this.index = function() {
        var arr = [];
        for(var key in this.hashes){
          arr.push(this.hashes[key]);
        }
        return arr;
      };
    }

    function HashTableMonth(prop) {
      this.prop = prop || '_id';

      this.hashes = {};
      this.put = function( key, month, value ){
        if(this.get(key) === undefined){
          this.hashes[ key[this.prop] ] = {name: key.name, 'JAN':0, 'FEB':0, 'MAR':0, 'APR':0, 'MAY':0, 'JUN':0, 'JUL':0, 'AUG':0, 'SEP':0, 'OCT':0, 'NOV':0, 'DEC':0};
          if(value === undefined){
            this.hashes[ key[this.prop] ][month]++;
          } else {
            this.hashes[ key[this.prop] ][month] += value;
          }

        } else {
          if(value === undefined){
            this.hashes[ key[this.prop] ][month]++;
          } else {
            this.hashes[ key[this.prop] ][month] += value;
          }
        }
      };
      this.get = function( key ) {
        return this.hashes[ key[this.prop] ];
      };
      this.index = function() {
        var arr = [];
        for(var key in this.hashes){
          arr.push(this.hashes[key]);
        }
        return arr;
      };
      this.sortedIndex = function(column) {

      };
    }

    // Helper function to check if user is inside the project
    // Used in researcher tab
    function isInProject(members, user){
      for(var i = 0; i < members.length; i++){
        if(user._id === members[i]._id){
          return true;
        }
      }
      return false;
    }
    init();
  })
  .filter('startFrom', function() {
    return function(input, start) {
        if(input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
