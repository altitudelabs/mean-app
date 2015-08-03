'use strict';

angular.module('lynkApp')
  .controller('MainCtrl', function ($scope, $http, Auth) {

    /*
    Global Stats:
    /api/analytics/totalProjectByGlobal
    /api/analytics/completedConsultationsByGlobal
    /api/analytics/cancelledConsultationsByGlobal
    /api/analytics/projectYieldByGlobal
    /api/analytics/responseTimeByGlobal
    /api/analytics/firstProfileSentByGlobal
    */

    /*
    My Stats:
    - check role of logged in user

    AM
    - /api/analytics/totalProjectsByAM/:userId
    - /api/analytics/completed/cancelledConsultationsByAM/:userId
    - /api/analytics/projectYieldByAM
    - /api/analytics/revenueByAM (TBD)
    - /api/analytics/responseTimeByAM/:userId
    - /api/analytics/firstProfileSentByAM/:userId

    Researcher
    - /api/analytics/totalProjectsByResearcher/:userId
    - /api/analytics/completed/cancelledConsultationByResearcher/:userId
    - /api/analytics/projectYieldByResearcher
    - /api/analytics/revenueByResearcher (TBD)
    - /api/analytics/responseTimeByResearcher/:userId
    - /api/analytics/firstProfileSentByResearcher/:userId

    Client

    Expert

    */

    /**
     * Get all the data first
     */
    function refreshData() {
      var itemsUpdated = 0;
      // TODO: Add different API call for different status
      $http.get('/api/analytics/totalProjectsByAll')
        .then(function(result) {
          $scope.totalProjects = result.data;
          itemsUpdated++;
          initScope(itemsUpdated);
        });
      $http.get('/api/analytics/completedConsultationsByAll')
        .then(function(result) {
          $scope.completedConsultations = result.data;
          itemsUpdated++;
          initScope(itemsUpdated);
        });
      $http.get('/api/analytics/cancelledConsultationsByAll')
        .then(function(result) {
          $scope.cancelledConsultations = result.data;
          itemsUpdated++;
          initScope(itemsUpdated);
        });
      $http.get('/api/analytics//projectYieldByAll')
        .then(function(result) {
          $scope.projectYield = result.data;
          itemsUpdated++;
          initScope(itemsUpdated);
        });
      $http.get('/api/analytics/responseTimeByAll')
        .then(function(result) {
          $scope.responseTime = result.data;
          itemsUpdated++;
          initScope(itemsUpdated);
        });
      $http.get('/api/analytics/firstProfileSentByAll/')
        .then(function(result) {
          $scope.firstProfileSent = result.data;
          itemsUpdated++;
          initScope(itemsUpdated);
        });
    }

    // init function for the views
    function init() {
      // User Roles checking functions
      $scope.isAdmin = Auth.isAdmin;
      $scope.isAccountManager = Auth.isAccountManager;
      $scope.isResearcher = Auth.isResearcher;
      refreshData();
    }

    // init scope tabs only when all items updated
    function initScope(itemLength) {
      if(itemLength!==6) { // change if # of data updated change
        return;
      } else {
        /**
         * Data and controls for the global stats
         */
        $scope.globalTab = {
          // status for the tab
          // 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
          status: 0,

          // values in this tab
          totalProjects: 0,
          completedConsultations: 0,
          cancelledConsultations: 0,
          projectYield: 0,
          revenue: 0,
          responseTime: 0,
          firstProfileSent: 0,
          consultationCount: 0,
          projectCount: 0,
          ranking: 0,

          /**
           * Selects single consultation
           * @consultation: consultation object
           * @toState: boolean; if defined, set selected state
           */
          select: function (index) {
            var self = this;
            self.status = index
            console.log('Select Global Tab', this.status);
            self.mapData();
          },
          mapData: function () {
            var self = this;
            // clear all values first
            self.totalProjects = 0;
            self.completedConsultations = 0;
            self.cancelledConsultations = 0;
            self.projectYield = 0;
            self.consultationCount = 0;
            self.projectCount = 0;
            self.revenue = 0;
            self.responseTime = 0;
            self.firstProfileSent = 0;
            // set values used for mapping
            var thisYear = new Date().getFullYear();
            var thisMonth = new Date().getMonth();
            var thisQuarter = 0;
            switch(thisMonth){
              case 0: thisQuarter = 1; break;
              case 1: thisQuarter = 1; break;
              case 2: thisQuarter = 1; break;
              case 3: thisQuarter = 2; break;
              case 4: thisQuarter = 2; break;
              case 5: thisQuarter = 2; break;
              case 6: thisQuarter = 3; break;
              case 7: thisQuarter = 3; break;
              case 8: thisQuarter = 3; break;
              case 9: thisQuarter = 4; break;
              case 10: thisQuarter = 4; break;
              case 11: thisQuarter = 4; break;
            }
            // start mapping data
            // Total Projects
            _.each($scope.totalProjects, function(project){
              var projectDate = new Date(project.startDate);
              if(self.status === 0){
                // only projects in this year and this month
                if(projectDate.getFullYear() === thisYear && projectDate.getMonth() === thisMonth){
                  self.totalProjects++;
                }
              } else if (self.status === 1){
                // only projects in this year and this quarter
                if(projectDate.getFullYear() === thisYear){
                  var projectMonth = projectDate.getMonth();
                  switch(thisQuarter){
                    case 1:
                      if(projectMonth === 0 | projectMonth === 1 | projectMonth === 2){
                        self.totalProjects++;
                      }
                      break;
                    case 2:
                      if(projectMonth === 3 | projectMonth === 4 | projectMonth === 5){
                        self.totalProjects++;
                      }
                      break;
                    case 3:
                      if(projectMonth === 6 | projectMonth === 7 | projectMonth === 8){
                        self.totalProjects++;
                      }
                      break;
                    case 4:
                      if(projectMonth === 9 | projectMonth === 10 | projectMonth === 11){
                        self.totalProjects++;
                      }
                      break;
                  }
                }
              } else if (self.status === 2) {
                if(projectDate.getFullYear() === thisYear){
                  self.totalProjects++;
                }
              } else if (self.status === 3) {
                self.totalProjects++;
              }
            });
            // Completed Consultations
            _.each($scope.completedConsultations, function(consultation){
              var consultationDate = new Date(consultation.completedDate);
              if(self.status === 0){
                // only in this year and this month
                if(consultationDate.getFullYear() === thisYear && consultationDate.getMonth() === thisMonth){
                  self.completedConsultations++;
                }
              } else if(self.status === 1){
                // only projects in this year and this quarter
                if(consultationDate.getFullYear() === thisYear){
                  var consultationMonth = consultationDate.getMonth();
                  switch(thisQuarter){
                    case 1:
                      if(consultationMonth === 0 | consultationMonth === 1 | consultationMonth === 2){
                        self.completedConsultations++;
                      }
                      break;
                    case 2:
                      if(consultationMonth === 3 | consultationMonth === 4 | consultationMonth === 5){
                        self.completedConsultations++;
                      }
                      break;
                    case 3:
                      if(consultationMonth === 6 | consultationMonth === 7 | consultationMonth === 8){
                        self.completedConsultations++;
                      }
                      break;
                    case 4:
                      if(consultationMonth === 9 | consultationMonth === 10 | consultationMonth === 11){
                        self.completedConsultations++;
                      }
                      break;
                  }
                }
              } else if(self.status === 2){
                if(consultationDate.getFullYear() === thisYear){
                  self.completedConsultations++;
                }
              } else if(self.status === 3){
                self.completedConsultations++;
              }
            });
            // Cancelled Consultations
            _.each($scope.cancelledConsultations, function(consultation){
              var consultationDate = new Date(consultation.completedDate);
              if(self.status === 0){
                // only in this year and this month
                if(consultationDate.getFullYear() === thisYear && consultationDate.getMonth() === thisMonth){
                  self.cancelledConsultations++;
                }
              } else if(self.status === 1){
                // only projects in this year and this quarter
                if(consultationDate.getFullYear() === thisYear){
                  var consultationMonth = consultationDate.getMonth();
                  switch(thisQuarter){
                    case 1:
                      if(consultationMonth === 0 | consultationMonth === 1 | consultationMonth === 2){
                        self.cancelledConsultations++;
                      }
                      break;
                    case 2:
                      if(consultationMonth === 3 | consultationMonth === 4 | consultationMonth === 5){
                        self.cancelledConsultations++;
                      }
                      break;
                    case 3:
                      if(consultationMonth === 6 | consultationMonth === 7 | consultationMonth === 8){
                        self.cancelledConsultations++;
                      }
                      break;
                    case 4:
                      if(consultationMonth === 9 | consultationMonth === 10 | consultationMonth === 11){
                        self.cancelledConsultations++;
                      }
                      break;
                  }
                }
              } else if(self.status === 2){
                if(consultationDate.getFullYear() === thisYear){
                  self.cancelledConsultations++;
                }
              } else if(self.status === 3){
                self.cancelledConsultations++;
              }
            });
            // Project Yield
            _.each($scope.projectYield, function(project){
              var projectDate = new Date(project.startDate);
              if(self.status === 0){
                if(projectDate.getFullYear() === thisYear && projectDate.getMonth() === thisMonth){
                  self.consultationCount += project.consultations.length;
                  self.projectCount++;
                }
              } else if(self.status === 1){
                // only projects in this year and this quarter
                if(projectDate.getFullYear() === thisYear){
                  var projectMonth = projectDate.getMonth();
                  switch(thisQuarter){
                    case 1:
                      if(projectMonth === 0 | projectMonth === 1 | projectMonth === 2){
                        self.consultationCount += project.consultations.length;
                        self.projectCount++;
                      }
                      break;
                    case 2:
                      if(projectMonth === 3 | projectMonth === 4 | projectMonth === 5){
                        self.consultationCount += project.consultations.length;
                        self.projectCount++;
                      }
                      break;
                    case 3:
                      if(projectMonth === 6 | projectMonth === 7 | projectMonth === 8){
                        self.consultationCount += project.consultations.length;
                        self.projectCount++;
                      }
                      break;
                    case 4:
                      if(projectMonth === 9 | projectMonth === 10 | projectMonth === 11){
                        self.consultationCount += project.consultations.length;
                        self.projectCount++;
                      }
                      break;
                  }
                }
              } else if(self.status === 2){
                if(projectDate.getFullYear() === thisYear){
                  self.consultationCount += project.consultations.length;
                  self.projectCount++;
                }
              } else if(self.status === 3){
                self.consultationCount += project.consultations.length;
                self.projectCount++;
              }
            });
            self.projectYield = (self.consultationCount / self.projectCount) || 0;
          }
        };
        $scope.globalTab.mapData();


        /**
         * Data and controls for the account stats
         */
        $scope.selfTab = {
          // user stats
          user: Auth.getCurrentUser(),
          // status for the tab
          // 0: This Month, 1: This Quarter, 2: Year to Date, 3: All Time
          status: 0,

          // values in this tab
          totalProjects: 0,
          completedConsultations: 0,
          cancelledConsultations: 0,
          projectYield: 0,
          revenue: 0,
          responseTime: 0,
          firstProfileSent: 0,
          ranking_hash: {},
          ranking: 0,

          /**
           * Selects single consultation
           * @consultation: consultation object
           * @toState: boolean; if defined, set selected state
           */
          select: function (index) {
            var self = this;
            self.status = index
            console.log('Select Self Tab', this.status);
            self.mapData();
          },
          mapData: function() {
            var self = this;
            // clear all values first
            self.totalProjects = 0;
            self.completedConsultations = 0;
            self.cancelledConsultations = 0;
            self.projectYield = 0;
            self.consultationCount = 0;
            self.projectCount = 0;
            self.revenue = 0;
            self.responseTime = 0;
            self.firstProfileSent = 0;
            self.ranking_hash = {};
            self.ranking = 0;
            // set values used for mapping
            var thisYear = new Date().getFullYear();
            var thisMonth = new Date().getMonth();
            var thisQuarter = 0;
            switch(thisMonth){
              case 0: thisQuarter = 1; break;
              case 1: thisQuarter = 1; break;
              case 2: thisQuarter = 1; break;
              case 3: thisQuarter = 2; break;
              case 4: thisQuarter = 2; break;
              case 5: thisQuarter = 2; break;
              case 6: thisQuarter = 3; break;
              case 7: thisQuarter = 3; break;
              case 8: thisQuarter = 3; break;
              case 9: thisQuarter = 4; break;
              case 10: thisQuarter = 4; break;
              case 11: thisQuarter = 4; break;
            }
            self.ranking_hash = new HashTableGraph();
            // start mapping data
            // Total Projects
            _.each($scope.totalProjects, function(project){
              // only map if user is a member in this project
              if(isInProject(project.members, self.user)){
                var projectDate = new Date(project.startDate);
                if(self.status === 0){
                  // only projects in this year and this month
                  if(projectDate.getFullYear() === thisYear && projectDate.getMonth() === thisMonth){
                    self.totalProjects++;
                  }
                } else if (self.status === 1){
                  // only projects in this year and this quarter
                  if(projectDate.getFullYear() === thisYear){
                    var projectMonth = projectDate.getMonth();
                    switch(thisQuarter){
                      case 1:
                        if(projectMonth === 0 | projectMonth === 1 | projectMonth === 2){
                          self.totalProjects++;
                        }
                        break;
                      case 2:
                        if(projectMonth === 3 | projectMonth === 4 | projectMonth === 5){
                          self.totalProjects++;
                        }
                        break;
                      case 3:
                        if(projectMonth === 6 | projectMonth === 7 | projectMonth === 8){
                          self.totalProjects++;
                        }
                        break;
                      case 4:
                        if(projectMonth === 9 | projectMonth === 10 | projectMonth === 11){
                          self.totalProjects++;
                        }
                        break;
                    }
                  }
                } else if (self.status === 2) {
                  if(projectDate.getFullYear() === thisYear){
                    self.totalProjects++;
                  }
                } else if (self.status === 3) {
                  self.totalProjects++;
                }
              }
            });
            // Completed Consultations
            _.each($scope.completedConsultations, function(consultation){
              // only if the project of this consultation is involved
              if(isInProject(consultation.project.members, self.user)){
                var consultationDate = new Date(consultation.completedDate);
                if(self.status === 0){
                  // only in this year and this month
                  if(consultationDate.getFullYear() === thisYear && consultationDate.getMonth() === thisMonth){
                    self.completedConsultations++;
                  }
                } else if(self.status === 1){
                  // only projects in this year and this quarter
                  if(consultationDate.getFullYear() === thisYear){
                    var consultationMonth = consultationDate.getMonth();
                    switch(thisQuarter){
                      case 1:
                        if(consultationMonth === 0 | consultationMonth === 1 | consultationMonth === 2){
                          self.completedConsultations++;
                        }
                        break;
                      case 2:
                        if(consultationMonth === 3 | consultationMonth === 4 | consultationMonth === 5){
                          self.completedConsultations++;
                        }
                        break;
                      case 3:
                        if(consultationMonth === 6 | consultationMonth === 7 | consultationMonth === 8){
                          self.completedConsultations++;
                        }
                        break;
                      case 4:
                        if(consultationMonth === 9 | consultationMonth === 10 | consultationMonth === 11){
                          self.completedConsultations++;
                        }
                        break;
                    }
                  }
                } else if(self.status === 2){
                  if(consultationDate.getFullYear() === thisYear){
                    self.completedConsultations++;
                  }
                } else if(self.status === 3){
                  self.completedConsultations++;
                }
              }
            });
            // Cancelled Consultations
            _.each($scope.cancelledConsultations, function(consultation){
              // only count if user involve in the project of consultation
              if(isInProject(consultation.project.members, self.user)){
                var consultationDate = new Date(consultation.completedDate);
                if(self.status === 0){
                  // only in this year and this month
                  if(consultationDate.getFullYear() === thisYear && consultationDate.getMonth() === thisMonth){
                    self.cancelledConsultations++;
                  }
                } else if(self.status === 1){
                  // only projects in this year and this quarter
                  if(consultationDate.getFullYear() === thisYear){
                    var consultationMonth = consultationDate.getMonth();
                    switch(thisQuarter){
                      case 1:
                        if(consultationMonth === 0 | consultationMonth === 1 | consultationMonth === 2){
                          self.cancelledConsultations++;
                        }
                        break;
                      case 2:
                        if(consultationMonth === 3 | consultationMonth === 4 | consultationMonth === 5){
                          self.cancelledConsultations++;
                        }
                        break;
                      case 3:
                        if(consultationMonth === 6 | consultationMonth === 7 | consultationMonth === 8){
                          self.cancelledConsultations++;
                        }
                        break;
                      case 4:
                        if(consultationMonth === 9 | consultationMonth === 10 | consultationMonth === 11){
                          self.cancelledConsultations++;
                        }
                        break;
                    }
                  }
                } else if(self.status === 2){
                  if(consultationDate.getFullYear() === thisYear){
                    self.cancelledConsultations++;
                  }
                } else if(self.status === 3){
                  self.cancelledConsultations++;
                }
              }
            });
            // Project Yield
            _.each($scope.projectYield, function(project){
              // only calcuate if this project is related to user
              if(isInProject(project.members, self.user)){
                var projectDate = new Date(project.startDate);
                if(self.status === 0){
                  if(projectDate.getFullYear() === thisYear && projectDate.getMonth() === thisMonth){
                    self.consultationCount += project.consultations.length;
                    self.projectCount++;
                  }
                } else if(self.status === 1){
                  // only projects in this year and this quarter
                  if(projectDate.getFullYear() === thisYear){
                    var projectMonth = projectDate.getMonth();
                    switch(thisQuarter){
                      case 1:
                        if(projectMonth === 0 | projectMonth === 1 | projectMonth === 2){
                          self.consultationCount += project.consultations.length;
                          self.projectCount++;
                        }
                        break;
                      case 2:
                        if(projectMonth === 3 | projectMonth === 4 | projectMonth === 5){
                          self.consultationCount += project.consultations.length;
                          self.projectCount++;
                        }
                        break;
                      case 3:
                        if(projectMonth === 6 | projectMonth === 7 | projectMonth === 8){
                          self.consultationCount += project.consultations.length;
                          self.projectCount++;
                        }
                        break;
                      case 4:
                        if(projectMonth === 9 | projectMonth === 10 | projectMonth === 11){
                          self.consultationCount += project.consultations.length;
                          self.projectCount++;
                        }
                        break;
                    }
                  }
                } else if(self.status === 2){
                  if(projectDate.getFullYear() === thisYear){
                    self.consultationCount += project.consultations.length;
                    self.projectCount++;
                  }
                } else if(self.status === 3){
                  self.consultationCount += project.consultations.length;
                  self.projectCount++;
                }
              }
            });
            self.projectYield = (self.consultationCount / self.projectCount) || 0;
            // Ranking for self tab
            _.each($scope.completedConsultations, function(consultation){
              var consultationDate = new Date(consultation.completedDate);
              if(self.status === 0){
                // only in this year and this month
                if(consultationDate.getFullYear() === thisYear && consultationDate.getMonth() === thisMonth){
                  _.each(consultation.project.members, function(member){
                    // check member role
                    if(member.role === self.user.role){
                      // place them in ranking only if same role with user
                      self.ranking_hash.put(member);
                    }
                  });
                }
              } else if(self.status === 1){
                // only projects in this year and this quarter
                if(consultationDate.getFullYear() === thisYear){
                  var consultationMonth = consultationDate.getMonth();
                  switch(thisQuarter){
                    case 1:
                      if(consultationMonth === 0 | consultationMonth === 1 | consultationMonth === 2){
                        _.each(consultation.project.members, function(member){
                          // check member role
                          if(member.role === self.user.role){
                            // place them in ranking only if same role with user
                            self.ranking_hash.put(member);
                          }
                        });
                      }
                      break;
                    case 2:
                      if(consultationMonth === 3 | consultationMonth === 4 | consultationMonth === 5){
                        _.each(consultation.project.members, function(member){
                          // check member role
                          if(member.role === self.user.role){
                            // place them in ranking only if same role with user
                            self.ranking_hash.put(member);
                          }
                        });
                      }
                      break;
                    case 3:
                      if(consultationMonth === 6 | consultationMonth === 7 | consultationMonth === 8){
                        _.each(consultation.project.members, function(member){
                            // check member role
                            if(member.role === self.user.role){
                              // place them in ranking only if same role with user
                              self.ranking_hash.put(member);
                            }
                          });
                      }
                      break;
                    case 4:
                      if(consultationMonth === 9 | consultationMonth === 10 | consultationMonth === 11){
                        _.each(consultation.project.members, function(member){
                          // check member role
                          if(member.role === self.user.role){
                            // place them in ranking only if same role with user
                            self.ranking_hash.put(member);
                          }
                        });
                      }
                      break;
                  }
                }
              } else if(self.status === 2){
                if(consultationDate.getFullYear() === thisYear){
                  _.each(consultation.project.members, function(member){
                    // check member role
                    if(member.role === self.user.role){
                      // place them in ranking only if same role with user
                      self.ranking_hash.put(member);
                    }
                  });
                }
              } else if(self.status === 3){
                _.each(consultation.project.members, function(member){
                  // check member role
                  if(member.role === self.user.role){
                    // place them in ranking only if same role with user
                    self.ranking_hash.put(member);
                  }
                });
              }
            });
            // sort the ranking
            var ranking = _.sortBy(self.ranking_hash.index(), ['value'], ['asc'], null).reverse();
            var ranking_list = [];
            _.each(ranking, function(rank){
              ranking_list.push(rank.value);
            });
            ranking_list = _.uniq(ranking_list);
            console.log(ranking_list);
            self.ranking = _.findIndex(ranking_list, function(chr) {
              var index = _.findIndex(ranking, function(chr) {
                return chr.name === self.user.name;
              });
              return chr === ranking[index].value;
            });
            console.log(ranking);
          }
        };
        $scope.selfTab.mapData();
      }
    }

    // Helper function to check if a user is in the project member
    function isInProject(members, user){
      for(var i = 0; i < members.length; i++){
        if(user._id === members[i]._id){
          return true;
        }
      }
      return false;
    }
    init();


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
  })
  // Cache the expert when user logged in
  .run(function ($rootScope, $http, $sessionStorage, Auth) {
    Auth.isLoggedInAsync(function(loggedIn) {
      // Only cache expert if logged In
      if(loggedIn){
        console.log('Start caching experts to sessionStorage');
        $rootScope.$storage = $sessionStorage;
        $http({
              method: 'GET',
              url: '/api/experts'
            }).success(function(data) {
              console.log(data.length + ' experts GET!');
              var newData = [];
              for(var i = 0; i < data.length; i++){
                var element = { name: data[i].name,
                                _id: data[i]._id,
                                objectId: data[i].objectId} ;
                newData.push(element);
              }
              console.log(newData.length + ' experts successful cached!');
              $rootScope.$storage.experts = newData;
            });
        }
    })
});
