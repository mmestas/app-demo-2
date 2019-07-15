app.service('commonFnSrvc', function ($http, $location, $rootScope, apiSrvc, ModalService, $filter, $mdToast, $document, NgTableParams, Upload, upload, blockUI, $timeout) {

  //GETS
  this.getDashboardData = function(scope) {
    if(!scope.activeCasesData) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsStatusNotComplete').then(function (response) {
          scope.activeCasesData = response.data;
          scope.cases = response;
          var caseData = response.data;
          scope.casesData = caseData;
          scope.casesTable = new NgTableParams(
              {
                  count: response.data.length,
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.casesData
              }
          );
          scope.casesTable.sorting({ submittedDateSort: 'asc' });
      })

      this.tableFilters(scope);
    }
  };

  this.getCompletedCases = function(scope) {
    if(!scope.completedCases) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsStatusComplete').then(function (response) {
          scope.completedCases = response;
          var completedCaseData = response.data;
          scope.completedCasesData = completedCaseData;
          scope.completedCasesTable = new NgTableParams(
              {
                  count: response.data.length
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.completedCasesData
              }
          );
          scope.completedCasesTable.sorting({ casenumber: 'desc' });
      })
    }

    this.tableFilters(scope);
  };

  this.getRecentlyCompletedCases = function(scope) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsRecentlyCompletedCases').then(function (response) {
        if(response.errors.length > 0) {
        }
        else {
          scope.completedCases = response;
          var completedCaseData = response.data;
          scope.completedCasesData = completedCaseData;
          scope.completedCasesTable = new NgTableParams(
              {
                  count: response.data.length
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.completedCasesData
              }
          );
          scope.completedCasesTable.sorting({ casenumber: 'desc' });
        }
        scope.showAutocompleteDropdown = false;
      })
    this.tableFilters(scope);
  };

  this.getPatientsByAutocomplete = function(scope, input) {
    scope.showAutocompleteDropdown = true;
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsForAutocompleteSearch&input='+input).then(function (response) {
      scope.patientSearchDropdown = response.data;
    });
  };

  this.getCasesBySearch = function(scope, resultSelection) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsBySearch&patientId='+resultSelection.id).then(function (response) {
        if(response.errors.length > 0) {
        }
        else {
          scope.completedCases = response;
          var completedCaseData = response.data;
          scope.completedCasesData = completedCaseData;
          scope.completedCasesTable = new NgTableParams(
              {
                  count: response.data.length
              },
              {
                  filterOptions: {
                      filterLayout: "horizontal",
                      show: true
                  },
                  counts: [],
                  dataset: scope.completedCasesData
              }
          );
          scope.completedCasesTable.sorting({ casenumber: 'desc' });
        }
        scope.showAutocompleteDropdown = false;
      })
    this.tableFilters(scope);
  };

  this.getTreatmentCompletedCases = function(scope) {
      if(!scope.treatmentCompletedCasessData) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsStatusTreatmentCompleted').then(function (response) {
            var treatmentCompletedCasesData = response.data;
            scope.treatmentCompletedCasessData = treatmentCompletedCasesData;
            scope.treatmentCompletedCasessTable = new NgTableParams(
                {
                    count: response.data.length
                },
                {
                    filterOptions: {
                        filterLayout: "horizontal",
                        show: true
                    },
                    counts: [],
                    dataset: scope.treatmentCompletedCasessData
                }
            );
            scope.treatmentCompletedCasessTable.sorting({ casenumber: 'desc' });
        })

        this.tableFilters(scope);
      }


  };

  this.getProviderDashboardData = function(scope) {
    if(!scope.activeCasesData) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsStatusNotComplete').then(function (response) {
          var cases = response.data;
          scope.activeCasesData = response.data;
            apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsStatusComplete').then(function (response) {
                scope.completedCases = response.data;
                var cases2 = cases.concat(scope.completedCases);
                scope.casesData = cases2;
                scope.casesTable = new NgTableParams(
                    {
                        count: scope.casesData.length,
                    },
                    {
                        filterOptions: {
                            filterLayout: "horizontal",
                            show: true
                        },
                        counts: [],
                        dataset: scope.casesData
                    }
                );
                scope.casesTable.sorting({ submittedDateSort: 'asc' });

            })
      })
      this.tableFilters(scope);
    }
  };

  this.getCompletedCount = function(scope) {
    //NOTE: Completed is now "In-Treatment"
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsStatusCompleteCount').then(function (response) {
      scope.notHiddenCompletedCases = response.data.notHiddenCompletedCases;
      scope.statushiddenCompletedCases = response.data.hiddenCompletedCases;
    });
  };

  this.getTreatmentCompletedCount = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientsStatusTreatmentCompletedCount').then(function (response) {
      scope.notHiddenTreatmentCompletedCases = response.data.hiddenCompletedCases;
      scope.statushiddenTreatmentCompletedCases = response.data.notHiddenCompletedCases;
    });
  };

  this.getPatientDetails = function(scope, caseID) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientDetails&patientid=' + caseID).then(function (response) {
      scope.patientDetails = response.data;
      scope.patientDetailsImages = angular.copy(response.data);
      scope.newCasefile = angular.copy(response.data); //Needed for teeth charting svg files
      scope.currentAge = response.data.info.age;
      scope.currentAgeMonth = response.data.info.ageMonth;

    });
  };

  this.getPatientProfile = function(scope, caseID) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientProfile&patientid=' + caseID).then(function (response) {
      scope.patientDetails = response.data;
      scope.patientDetailsImages = angular.copy(response.data);
      scope.newCasefile = angular.copy(response.data); //Needed for teeth charting svg files
      scope.currentAge = response.data.info.age;
      scope.currentAgeMonth = response.data.info.ageMonth;
      scope.statusObj = {};
      scope.statusObj.status = scope.patientDetails.status;

      // For testing only
      // scope.patientDetails.info.ethnicity = {
      //   name: "Asian", guid: "{A32B2230-A93C-431E-8768-6851619A697A}"
      // }
    });
  };

  this.getAge = function (scope, birthdate) {
      var currentDate = new Date();
      var currentMonth = currentDate.getMonth() + 1;
      var dob = new Date(birthdate);
      var dobMonth = dob.getMonth() + 1;
      if (currentMonth < dobMonth) {
        var ageMonth = (currentMonth + 12) - dobMonth;
      }
      else {
        var ageMonth = (currentMonth - dobMonth);
      }
      var age = new Date(currentDate - dob).getFullYear() - 1970;
      if (isNaN(age)) {
        scope.patientAge = 'Patient Age';
      }
      else {
        scope.currentAge = age;
        scope.currentAgeMonth = ageMonth;
        scope.patientAge = age + ' yr(s),  ' + ageMonth + ' month(s) ';

        if(scope.patientDetails) {
          var dob = new Date(birthdate);
          birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
        }
      }
  };

  this.getAppliances = function(scope) {
    if(!scope.appliances) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetAppliances').then(function (response) {
            scope.appliances = response.data;
        });
    };
  };

  this.getTreatmentStages = function(scope, treatmentStatus) {
    if(treatmentStatus == 1) {
      scope.treatmentStages = [
        {id: 1, name: "Initial Treatment"},
        {id: 2, name: "Mid-Treatment"}
      ];
    }
    else {
      scope.treatmentStages = [
        {id: 2, name: "Mid-Treatment"}
      ];
    }

  };

  this.getTreatmentOptions = function(scope) {
    if(!scope.treatementOptions) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetTreatmentOptions').then(function (response) {
          scope.treatementOptions = response.data;
      });
    }

  };

  this.getContructionBite = function(scope) {
    if(!scope.constructionBite) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetConstructionBite').then(function (response) {
            scope.constructionBites = response.data;
            var selectNone = {
              guid: "",
              id: 0,
              name: "None"
            }
            scope.constructionBites.push(selectNone);
        });
    };
  };

  this.getappDemo2ApplianceSpecialists = function(scope) {
    if(!scope.appDemo2ApplianceSpecialists) {
        apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetApplianceSpecialists').then(function (response) {
            scope.appDemo2ApplianceSpecialists = response.data;
        });
    }
  };

  this.getappDemo2Guides = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetappDemo2Guides').then(function (response) {
      scope.appDemo2Guides = response.data.appDemo2Guides;
      scope.appDemo2UpperGuides = response.data.appDemo2UpperGuides;
      scope.appDemo2LowerGuides = response.data.appDemo2LowerGuides;
    });

  };

  this.getStates = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetStates').then(function (response) {
        scope.statesList = response.data;
    });
  };

  this.getCountries = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetCountries').then(function (response) {
        scope.countriesList = response.data;
    });
  };

  this.getStatesFromCountry = function(scope, countryId) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetStatesFromCountry&CountryId='+countryId).then(function (response) {
        scope.statesList = response.data;
    });
  };

  this.getPatientStatuses = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientProfileStatuses').then(function (response) {
        scope.statuses = response.data;
    })
  };

  this.getOnlinePaymentData = function(scope) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=GetOnlinePaymentData').then(function (response) {
      scope.paymentData = response;
    })
  }

  this.getCCMonths = function(scope) {
    scope.ccMonths = [
      {name: 'January', abbreviation: 'Jan', value: 1},
      {name: 'February', abbreviation: 'Feb', value: 2},
      {name: 'March', abbreviation: 'Mar', value: 3},
      {name: 'April', abbreviation: 'April', value: 4},
      {name: 'May', abbreviation: 'May', value: 5},
      {name: 'June', abbreviation: 'Jun', value: 6},
      {name: 'July', abbreviation: 'Jul', value: 7},
      {name: 'August', abbreviation: 'Aug', value: 8},
      {name: 'September', abbreviation: 'Sept', value: 9},
      {name: 'October', abbreviation: 'Oct', value: 10},
      {name: 'November', abbreviation: 'Nov', value: 11},
      {name: 'December', abbreviation: 'Dec', value: 12},
    ]
  };

  this.getCCYears = function(scope) {
    var d = new Date();
    var year = d.getFullYear();
    var years = [];
    var i;

    for(i = 0; i < 15; i++) {
      year = year + 1;
      years.push(year);
    }

    scope.ccYears = years;

  };

  this.getClasses = function(scope) {
      scope.classRelationships = [
      {id: 1, name: "Class I"},
      {id: 2, name: "Class II"},
      {id: 4, name: "Class II tendency"},
      {id: 3, name: "Class III"},
      {id: 5, name: "Class III tendency"}
      ];
  };

  this.getEthnicity = function (scope) {
      if(!scope.ethnicities) {
          apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetEthnicity').then(function (response) {
              scope.ethnicities = response.data;
          });
      };
  };
  //POSTS
    //Old patient profile/details page
  this.appDemo2SetPatient = function(scope, patientDetails) {
    var dob = new Date(patientDetails.info.birthdate);
    patientDetails.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
    scope.formUpload = true;
    if(patientDetails.statusModifiedDate) {
        delete patientDetails.statusModifiedDate;
    }
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatient&RequestBinary=true',
        method: 'POST',
        data: {
            jsonData: JSON.stringify(patientDetails),
        },
        withCredentials: true
    })
      .then(function (response) {
          // JC 7/11/2017
          blockUI.start("Saving ... ");
          $timeout(function () {
              blockUI.stop();
          }, 2000);

      });
  };

    //New patient profile page
  this.appDemo2SetPatientProfile = function(scope, patientDetails) {
    var dob = new Date(patientDetails.info.birthdate);
    patientDetails.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
    scope.patientDetails.info.birthdate = patientDetails.info.birthdate;

    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientProfile&RequestBinary=true',
        method: 'POST',
        data: {
            PatientProfileId: patientDetails.caseFile,
            jsonData: JSON.stringify(patientDetails)
        },
        withCredentials: true
    })
      .then(function (response) {
        blockUI.start("Saving ... ");
        if(response.data.data.errors.length > 0) {
          $timeout(function () {
              blockUI.stop();
          });
          var modalData = {
            modalTitle: 'Error',
            modalBody: 'Something went wrong when saving.'
          }
          globalModal(modalData);
        }
        else {
          $timeout(function () {
              blockUI.stop();
          }, 2000);
          scope.patientDetails = response.data.data;
        }

      });
  };

  //Is this being used??
  // this.appDemo2SubmitPrescription = function(scope, patientDetails) {
  //   var dob = new Date(patientDetails.info.birthdate);
  //   patientDetails.info.birthdate = ((dob.getMonth() + 1) + '/' + dob.getDate() + '/' + dob.getFullYear());
  //   scope.formUpload = true;
  //   upload({
  //       url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatient&prescription=1&RequestBinary=true',
  //       method: 'POST',
  //       data: {
  //           jsonData: JSON.stringify(patientDetails),
  //       },
  //       withCredentials: true
  //   })
  //     .then(function (response) {
  //         response.data.data.errors = [{test: true}];
  //
  //         if(response.data.data.errors.length > 0) {
  //           $timeout(function () {
  //               blockUI.stop();
  //           });
  //           var modalData = {
  //             modalTitle: 'Error',
  //             modalBody: 'Something went wrong when saving.'
  //           }
  //           globalModal(modalData);
  //         }
  //         else {
  //           scope.patientDetails = response.data.data;
  //             // JC 7/11/2017
  //             blockUI.start("Saving ... ");
  //             $timeout(function () {
  //                 blockUI.stop();
  //             }, 2000);
  //         }
  //
  //
  //     });
  // };

  //Other functions
  this.updateAge = function(scope, birthdate) {
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth() + 1;
    var dob = new Date(birthdate);
    var dobMonth = dob.getMonth() + 1;
    if (currentMonth < dobMonth) {
      var ageMonth = (currentMonth + 12) - dobMonth;
    }
    else {
      var ageMonth = (currentMonth - dobMonth);
    }
    var age = new Date(currentDate - dob).getFullYear() - 1970;
    if (isNaN(age)) {
      scope.patientAge = 'Patient Age';
    }
    else {
      scope.currentAge = age;
      scope.casefile.info.age = age;
      scope.currentAgeMonth = ageMonth;
      scope.casefile.info.ageMonth = ageMonth;
      scope.patientAge = age + ' yr(s),  ' + ageMonth + ' month(s) ';
    }
  };

  this.tableFilters = function(scope) {
    //This formats the date so it's filterable
    scope.byFormattedDateFilter = function(datarow) {
      var returnStatus = true;
      var simpleDate = new Date(datarow.paymentCompletedDate);
      var simpleDate2 = new Date(datarow.submittedDate);
      var simpleDate3 = new Date(datarow.statusCompletedDate);
      var simpleDateOriginal = new Date(datarow.originalSubmittedDate);

      simpleDate = $filter('date')(simpleDate);
      simpleDate2 = $filter('date')(simpleDate2);
      simpleDate3 = $filter('date')(simpleDate3);
      simpleDateOriginal = $filter('date')(simpleDateOriginal);

      datarow.paymentCompletedDate = simpleDate;
      datarow.submittedDate = simpleDate2;
      datarow.statusCompletedDate = simpleDate3;
      datarow.originalSubmittedDate = simpleDateOriginal;

      datarow.submittedDate.toString();
      datarow.originalSubmittedDate.toString();

      if(typeof datarow.submittedDate !== 'string') {
        datarow.submittedDate = 'N/A';
      }

      if(typeof datarow.originalSubmittedDate !== 'string') {
        datarow.originalSubmittedDate = 'N/A';
      }

      return returnStatus;
    }
    scope.firstLastNameFilter = {
        'info.firstname': {
            id: "text",
            placeholder: "First Name"
        },
        'info.lastname': {
            id: "text",
            placeholder: "Last Name"
        }
    };

  };

  this.hoverIn = function(tooth, allowChanges) {
      if(allowChanges) {
        angular.element('#'+tooth).addClass('highlightMatch');
      }
  };
  this.hoverOut = function(tooth, allowChanges) {
    if(allowChanges) {
      angular.element('#'+tooth).removeClass('highlightMatch');
    }
  };

  this.errorToast = function(toastLocation, message, toastPosition, scope) {
    if(!toastPosition) {
      toastPosition = 'top';
    }
    scope.toastMsg = message;
     $mdToast.show({
     hideDelay   : false,
     position    : toastPosition,
     parent : $document[0].querySelector(toastLocation),
     scope:scope,
     preserveScope:true,
     controller  : toastCtrl,
     template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">{{toastMsg}}</div> &nbsp; <button class="mr-10 btn teal" ng-click="dismissToast()">Okay</button></md-toast>'
     });
    function toastCtrl(scope, $rootScope, apiSrvc, $mdToast) {
      scope.dismissToast = function() {
        $mdToast.cancel()
      }
    }
  };

  this.globalModal = function(modalData) {
    ModalService.showModal({
        templateUrl: '/views/modals/globalModal.html',
        controller: function ($element, close) {
          this.modalTitle = modalData.modalTitle;
          this.modalBody =  modalData.modalBody;
          this.closeModal = function () {
               $element.modal('hide');
               close(true);
          }
        },
        controllerAs: "modalCtrl"
    })
    .then(function (modal) {
            modal.element.modal();
            modal.close.then(function(result) {});
    });
  };

  var globalModal = this.globalModal;

  this.teethTranslate = function(teethArray, functionToGetCalled) {
    teethArray.sort(function(a, b){return a-b});
    var modifiedTeethArray = [];
    var teethAsStringArray = [];
    angular.forEach(teethArray, function(toothMark) {
      var roundUp = Math.round(toothMark)
      var roundDown = Math.floor(toothMark);
      var newMark = roundDown+'-'+roundUp;
      teethAsStringArray.push(newMark);
      modifiedTeethArray.push(roundDown);
      modifiedTeethArray.push(roundUp);
    })
    functionToGetCalled(modifiedTeethArray, teethAsStringArray);
  }




}); //End of Service
