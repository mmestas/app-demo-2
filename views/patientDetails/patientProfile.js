app.controller('patientProfileCtrl', function ($rootScope, $scope, $state, $stateParams, $location, $window, apiSrvc, authSrvc, commonFnSrvc, NgTableParams, fileUpload, $http, $timeout, $interval, $compile, $mdToast, $document, Upload, upload, $filter, blockUI, ModalService, $anchorScroll) {

  $scope.getPatientProfile = function() {
    var url = $location.path().split('/');
    var caseId = url[2];
    var selectedTile = url[3];
    $scope.caseId = caseId;
    $scope.selectedTile = selectedTile;
    if($scope.selectedTile === '') {
       $scope.selectedTile = 1;
    }
    commonFnSrvc.getPatientProfile($scope, caseId);
    $scope.getPatientPrescriptions(caseId);
    $scope.getPatientStatuses();
  };

  $scope.getPatientPrescriptions = function(caseId) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientPrescriptions&patientid=' + caseId).then(function(response) {
      $scope.patientPrescriptions = response.data;

      $scope.RxTreatmentStage = 1;   // Force the Rx Treatment Stage to 1: Initial, or 2:Mid (This value gets passed in the URL)
      $scope.hasAnAppliance = 1; // 1 = does not have appliance, 2 = has purchased appliance (This value gets passed in the URL)

      if($scope.patientPrescriptions.length > 0) { //If there is more than 1 Rx
        if($scope.patientPrescriptions[0].prescriptionSubmittedDate)
        { //If the first Rx has been submitted
          $scope.RxTreatmentStage = 2 // 2 = Mid Treatment
        }

        var keepGoing = true; //Avoid unecessary loops (stop the loop when value is false)
        var freeGuidePurchased = false; //Default to false
        $scope.freeGuideCredit = false; //Default to false.  If true, user can still get a free appDemo2 Guide

        var firstRx = $scope.patientPrescriptions.length - 1; //I believe this is to find the last Rx Date
        var initalPrescriptionDate = $scope.patientPrescriptions[firstRx].prescriptionSubmittedDate;
        if(initalPrescriptionDate) {$scope.isInActiveTreatment = true;};
        var today = new Date();
        var startOfTreatment = new Date(initalPrescriptionDate);

        var msPerDay = 1000 * 60 * 60 * 24;
        var msPerMonth = 1000 * 60 * 60 * 24 * 30;
        var msPerYear = 1000 * 60 * 60 * 24 * 365;
        var utc1 = Date.UTC(startOfTreatment.getFullYear(), startOfTreatment.getMonth(), startOfTreatment.getDate());
        var utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

        var daysDiff = Math.floor((utc2 - utc1) / msPerDay);
        var monthDiff = Math.floor((utc2 - utc1) / msPerMonth);
        var yearDiff = Math.floor((utc2 - utc1) / msPerYear);

        if(monthDiff > 12) {
          monthDiff =  Math.floor(monthDiff / 12);
        }
        if(daysDiff > 30) {
          daysDiff =  Math.floor(daysDiff / 30);
        }

        $scope.totalTimeInActiveTreatment =  yearDiff + ' years ' + monthDiff + ' months ' + daysDiff + ' days ';

        var lastPrescriptionIndex = $scope.patientPrescriptions.length - 1;
        $scope.lastPrescription = $scope.patientPrescriptions[lastPrescriptionIndex];

        $scope.createNewRx = true;

        angular.forEach($scope.patientPrescriptions, function(rx, index) {
          if(rx.applianceSystem.appDemo2GuideForUpperSystem.guid && rx.applianceSystem.appDemo2GuideForUpperSystem.invoiced) { //if a free guide was "purchased" with an appliance on the first order
            freeGuidePurchased = true; //Value to be used below
          }
          if(rx.isFreeGuide) {
            freeGuidePurchased = true;
          }

          if(keepGoing) {

            if(rx.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid && (rx.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid !== "{5db38949-748f-4c89-942a-86f946945f2c}")) {
              //This is to check if the patient has ever had an Rx for an appliance.  If not, they are to be treated as an initial Rx and charged the full price for the appliance
              //1 = no appliance, 2 = has an appliance  This # gets sent in the URL to the Create Rx page

              if(index > 0) {
                keepGoing = false;
                $scope.hasAnAppliance = 2;
              }

            }
          }

          if(rx.prescriptionId && rx.prescriptionSubmittedDate) {
            rx.editable = false;
            if(rx.status.guid === '{3D36742C-55DC-47D3-A742-65338BBF8FE5}') {
              rx.editable = true;
            }
            else {
              if(rx.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') {
                if(rx.applianceSystem.appDemo2Guides.length < 4) {
                  rx.editable = true;
                }
                if(rx.applianceSystem.appDemo2Guides[3]) {
                  if(rx.applianceSystem.appDemo2Guides[3].invoiced === false) {
                    rx.editable = true;
                  }
                }
              }
            }
          }
          else {
            rx.editable = true;
            $scope.createNewRx = false;
          }
        })
        //Check to see if the patient is eligible for a free guide.
        // is eligible if the FIRST Rx was an appliance and they did not get a free guide then, and it is within 2 years of the appliance (first Rx) purchase date.
        if($scope.patientPrescriptions[0].healthHistory.sleepTestInfo.treatmentStage === 1) { //If the first Rx was an initial treatment (Doctor can chose to select mid (2) for existing patients who are using the app system for the first time)
          if($scope.patientPrescriptions[0].initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid && ($scope.patientPrescriptions[0].initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid !== "{5db38949-748f-4c89-942a-86f946945f2c}")) {
            // if the first Rx was an appliance (not a appDemo2 guide)
            if(!freeGuidePurchased) { //If no free guide was ever purchased
              var today = new Date();
              var purchaseDate = new Date($scope.patientPrescriptions[0].prescriptionSubmittedDate);
              var diffTime = Math.abs(purchaseDate.getTime() - today.getTime());
              var daysSincePurchaseDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if(daysSincePurchaseDate <= 200) { //If it has not been more than 200 days since the first Rx
                $scope.freeGuideCredit = true;
              }
            }
          }
        }
      }
      else { //There has never been an Rx created
        $scope.createNewRx = true;
      }

    });
  };

  $scope.savePatientProfile = function(patientDetails) {
    // Only send the necessary fields
    var info = {
      firstname: patientDetails.info.firstname,
      lastname: patientDetails.info.lastname,
      birthdate: patientDetails.info.birthdate,
      age: $scope.currentAge,
      ageMonth: $scope.currentAgeMonth,
      gender: patientDetails.info.gender
    }
    var patientObj = {
      caseFile: patientDetails.caseFile,
      caseNumber: patientDetails.caseNumber,
      info: info
    }

    var setPatient = function() {
      commonFnSrvc.appDemo2SetPatientProfile($scope, patientObj);
    }
    authSrvc.getAuthenticationForClicks(setPatient);
  };

  $scope.editInfo = function(patientDetails) {
    $scope.getEthnicity();
    // copy fields to edit in case editing canceled
    $scope.patientDetailsEdit = angular.copy(patientDetails);

  };

  $scope.cancelEditInfo = function(patientDetails) {
    // reset editing fields
    $scope.patientDetailsEdit = {};
    $scope.currentAge = patientDetails.info.age;
    $scope.currentAgeMonth = patientDetails.info.ageMonth;
  };

  $scope.getAge = function(birthdate) {
    commonFnSrvc.getAge($scope, birthdate);
  };

  $scope.getPatientStatuses = function() {
    commonFnSrvc.getPatientStatuses($scope);
  };

  //Create New Prescription (only if there are no open prescriptions)
  $scope.createPatientPrescription = function(caseId, selectedTile) {
    var createNewRx = function() {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2CreatePatientPrescription&patientid=' + caseId).then(function (response) {
        if(response.errors.length > 0) {
          var modalData = {
            modalTitle: 'Error',
            modalBody: '<div>Something went wrong.</div>'
          }
          commonFnSrvc.globalModal(modalData);
        }
        else {
          var prescriptionGuid = response.data.guid;
          $state.go('createRx', {id: caseId, selectedTile: $scope.selectedTile, prescriptionGuid: prescriptionGuid, RxTreatmentStage: $scope.RxTreatmentStage, hasAppliance: $scope.hasAnAppliance, freeGuide:0});
        }
      });
    }
    // If a patient is mid-treatement (already has a Rx) and the provider clicks to create a new Rx - prompt the provider if they want to update the treatemtnt plan for this patient.
    if($scope.patientPrescriptions.length > 0) {
      $scope.toastMsg = 'Would you like to update the treatment plan for this case before creating a new Rx?'
        $mdToast.show({
        hideDelay   : false,
        position    : 'left',
        parent : $document[0].querySelector('#createRxToast'),
        scope:$scope,
        preserveScope:true,
        controller  : toastCtrl,
        template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">{{toastMsg}}</div>  &nbsp; <button class="mr-2 btn btn-warning" ng-click="updateTreatmentPlan()">Yes</button><button class="btn btn-secondary" ng-click="goStraitToRx()">No</button></md-toast>'
        });
       function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
         $scope.updateTreatmentPlan = function() {
           $mdToast.cancel();
           $scope.showTreatmentPlanningSection = true;
           $scope.getTreatmentPlanningTabs();
           $scope.getAppliances();
           $scope.getTreatmentOptions();
         };
         $scope.goStraitToRx = function() {
          $mdToast.cancel();
           createNewRx();
         };
       }
    }
    else {
      createNewRx();
    }
  };

  $scope.editPatientPrescription = function(caseId, selectedTile, prescription) {
    var prescriptionGuid = prescription.guid;
      $state.go('createRx', {id: caseId, selectedTile: selectedTile, prescriptionGuid: prescriptionGuid, RxTreatmentStage: $scope.RxTreatmentStage, hasAppliance: $scope.hasAnAppliance, freeGuide:0});
  };

  $scope.viewPatientPrescription = function(caseId, selectedTile, prescription) {
    var prescriptionGuid = prescription.guid;
    $state.go('createRx', {id: caseId, selectedTile: selectedTile, prescriptionGuid: prescriptionGuid, RxTreatmentStage: $scope.RxTreatmentStage, hasAppliance: $scope.hasAnAppliance, freeGuide:0});
  };

  $scope.openPatientRecords = function() {
    $scope.showPatientRecordsSection = true;
    $scope.getPatientRecordTabs();
    $scope.getTreatmentStages();
    $location.hash('patientRecords');
    $anchorScroll();
  };

  $scope.openTreatmentPlanning = function() {
    $scope.showTreatmentPlanningSection = true;
    $scope.getTreatmentPlanningTabs();
    $scope.getAppliances();
    $scope.getTreatmentOptions();
    $location.hash('treatmentPlanning');
    $anchorScroll();
  };

  // Rescue Guide
  $scope.createPatientPrescriptionRescueGuide = function(caseId, selectedTile) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2CreatePatientPrescriptionRescueGuide&patientid=' + caseId).then(function (response) {
      if(response.errors.length > 0) {
        var modalData = {
          modalTitle: 'Error',
          modalBody: '<div>Something went wrong.</div>'
        }
        commonFnSrvc.globalModal(modalData);
      }
      else {
        var prescriptionGuid = response.data.guid;
        $state.go('createRx', {id: caseId, selectedTile: $scope.selectedTile, prescriptionGuid: prescriptionGuid, RxTreatmentStage: $scope.RxTreatmentStage, hasAppliance: $scope.hasAnAppliance, freeGuide:0});
      }
    });
  };

  //Free Guide
  $scope.createPatientPrescriptionFreeGuide = function(caseId, selectedTile) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2CreatePatientPrescriptionFreeGuide&patientid=' + caseId).then(function (response) {
      if(response.errors.length > 0) {
        var modalData = {
          modalTitle: 'Error',
          modalBody: '<div>Something went wrong.</div>'
        }
        commonFnSrvc.globalModal(modalData);
      }
      else {
        var prescriptionGuid = response.data.guid;
        $state.go('createRx', {id: caseId, selectedTile: $scope.selectedTile, prescriptionGuid: prescriptionGuid, RxTreatmentStage: $scope.RxTreatmentStage, hasAppliance: $scope.hasAnAppliance, freeGuide:1});
      }
    });

  }

  //********************** TREATMENT COMPLETED CASE **********************/
    //Are we using this anymore?
  // var openConfirmChangeStatusToTreatmentCompleted = function() {
  //   ModalService.showModal({
  //       templateUrl: 'confirmTreatmentCompleted.html',
  //       controller: function ($element) {
  //           this.data = $scope.casefile;
  //           this.user = $scope.userInfo;
  //           $scope.data = this.data;
  //           $scope.user = this.user;
  //           this.completeTreatment = function (caseStatus) {
  //               caseStatus.status.status = 'Treatment Completed';
  //               caseStatus.status.ccGuid = '{FB196E76-2923-45F7-ACCD-D9080124A17C}';
  //               caseStatus.status.id = 10;
  //               caseStatus.status.name = 'Treatment Completed';
  //               upload({
  //                   url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatient&RequestBinary=true',
  //                   method: 'POST',
  //                   data: {
  //                       jsonData: JSON.stringify(caseStatus),
  //                   },
  //                   withCredentials: true
  //               })
  //                   .then(function (response) {})
  //           }
  //           this.areYouSure = function () {
  //               if (confirm('You are about to close without saving.  Proceed?') === true) {
  //                    $element.modal('hide');
  //               }
  //               else {
  //               }
  //           }
  //       },
  //       controllerAs: "modalCtrl"
  //   })
  //       .then(function (modal) {
  //           modal.element.modal();
  //           modal.close.then(function(result) {});
  //       });
  // };

  //Are we using this anymore?
  // $scope.confirmTreatmentCompletedModal = function (casefile) {
  //   $scope.casefile = casefile;
  //   var mySrvc = authSrvc.getAuthenticationForClicks(openConfirmChangeStatusToTreatmentCompleted);
  // };

  //******************** END TREATMENT COMPLETED CASE ********************/
  // TREATMENT PLANNING //************************/
  $scope.getTreatmentPlanningTabs = function() {
    var patientId = $scope.caseId;

    if($scope.treatmentPlanningTabs) {}
    else {
      blockUI.start("Loading... ");
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientProfileTreatmentPlannings&PatientId='+patientId).then(function(response) {
        blockUI.done(function() {});
        blockUI.stop();
        if(response.errors.length > 0) {}
        else {
          $scope.treatmentPlanningTabs = response.data;
          var last = $scope.treatmentPlanningTabs.length - 1;
          $scope.tpTabSelected = last;
          // Need to create an appliance object in order to edit the field
          if($scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance.length === 0) {
            $scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance[0] =
            {
               appliance: {
                name: "",
                guid: ""
                },
                monthsInUse: 0,
                hoursWornPerDay: 0,
                monthsOfPassiveUse: 0
            };
          }
          //If the last treament has been submitted, the user can create a new treatement plan, otherwise, he/she can only edit the current plan
          if($scope.treatmentPlanningTabs[last].submited) {
            $scope.addNewTreatmentPlanTab = true;
            $scope.submitNTBtnTitle = 'Update Treatment Plan';
          }
          else {
            $scope.addNewTreatmentPlanTab = false;
            $scope.submitNTBtnTitle = 'Create Treatment Plan';
          }
          //User can edit the record date, but if it doesn't exist default to Date Created/Added
          // Possibly not needed here - only needed under addNewTreatmentPlanTab()
          angular.forEach($scope.treatmentPlanningTabs, function(tp) {
            if(!tp.recordDate) {
              tp.recordDate = tp.DateAdded;
            }
          })
          //User can only edit a treatment plan for up to 30 days after creation date/date added
          $scope.defineEditableTreatmentPlanning(last);
        }
      })
    }
  };

  $scope.showTPTabContent = function(tab, index) {
    $scope.tpTabSelected = index;
  };

  $scope.getTreatmentPlanning = function(tab) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientProfileTreatmentPlanning&guid='+tab.guid).then(function(response)
     {})
  };

  $scope.setTreatmentPlanning = function(tab, toastContainer, index, submitted) {
    toastContainer = toastContainer+index;
    if(submitted) {
      tab.submited = submitted;
      var submittedVal = 1;
      $scope.toastMsg = 'Your Treatment Plan has been submitted.';
    }
    else {
      tab.submited = false;
      var submittedVal = 0;
      $scope.toastMsg = 'Your data has been saved!';
    }
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientProfileTreatmentPlanning&RequestBinary=true&submited='+submittedVal,
        method: 'POST',
        data: {
            jsonData: JSON.stringify(tab)
        },
        withCredentials: true
    }).then(function (response) {

            if(response.data.errors.length > 0) {
            }
            else {
              if(response.data.data.submited) {
                $scope.addNewTreatmentPlanTab = true;
                $scope.submitNTBtnTitle = 'Update Treatment Plan';
              }
              else {
                $scope.addNewTreatmentPlanTab = false;
                $scope.submitNTBtnTitle = 'Create Treatment Plan';
              }
              $mdToast.show({
              hideDelay   : false,
              position    : 'right',
              parent : $document[0].querySelector(toastContainer),
              scope:$scope,
              preserveScope:true,
              controller  : toastCtrl,
              template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">{{toastMsg}}</div>  &nbsp; <button class="mr-2 btn btn-warning" ng-click="dismissToast()">Okay</button></md-toast>'
              });
             function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
               $scope.dismissToast = function() {
                 $mdToast.cancel()
               }
             }

            }
        });
  };

  $scope.addNewTreatmentPlanning = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2AddPatientProfileTreatmentPlanning&PatientId='+$scope.caseId).then(function(response)
     {
       if(response.errors.length > 0) {}
       else {
         var newTab = response.data;
         $scope.treatmentPlanningTabs.push(newTab);
         var noLongerEditable = $scope.treatmentPlanningTabs.length - 2;
         $scope.treatmentPlanningTabs[noLongerEditable].editable = false;
         var last =  $scope.treatmentPlanningTabs.indexOf(newTab);
         $scope.tpTabSelected = last;
         if($scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance.length === 0) {
           $scope.treatmentPlanningTabs[last].estimatedTreatmentTime.appliance[0] =
           {
              appliance: {
               name: "",
               guid: ""
               },
               monthsInUse: 0,
               hoursWornPerDay: 0,
               monthsOfPassiveUse: 0
           };
         }
         //User can edit the record date, but if it doesn't exist default to Date Created/Added
         if(!$scope.treatmentPlanningTabs[last].recordDate) {
           $scope.treatmentPlanningTabs[last].recordDate = $scope.treatmentPlanningTabs[last].DateAdded;
         }
         $scope.defineEditableTreatmentPlanning(last);
         $scope.addNewTreatmentPlanTab = false;
         $scope.submitNTBtnTitle = 'Create Treatment Plan';
       }

     })
  };

  $scope.defineEditableTreatmentPlanning = function(last) {
    var lastTab = $scope.treatmentPlanningTabs[last];
    var today = new Date();
    var lastTabDateAdded = new Date(lastTab.DateAdded);
    var msPerDay = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(lastTabDateAdded.getFullYear(), lastTabDateAdded.getMonth(), lastTabDateAdded.getDate());
    var utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    var daysDiff = Math.floor((utc2 - utc1) / msPerDay);

    if(daysDiff > 30) {
      $scope.treatmentPlanningTabs[last].editable = false;
      $scope.addNewTreatmentPlanTab = true;
    }
    else if(daysDiff <= 30) {
      $scope.treatmentPlanningTabs[last].editable = true;
    }

  };

  $scope.calculateDiscrepancy = function(archAnalysis) {
      var a = archAnalysis.schwarzIndex;
      var b = a + 9;
      var c = b + 9;
      var b1 = a + 9;
      var c1 = b + 9;

      archAnalysis.upperFirstPremolars.discrepancy =  archAnalysis.upperFirstPremolars.measurement - b;
      archAnalysis.upperFirstMolars.discrepancy =  archAnalysis.upperFirstMolars.measurement - c;
      archAnalysis.lowerFirstPremolars.discrepancy =  archAnalysis.lowerFirstPremolars.measurement - b1;
      archAnalysis.lowerFirstMolars.discrepancy =  archAnalysis.lowerFirstMolars.measurement - c1;
  };

  // PATIENT RECORDS //************************/
  $scope.getPatientRecordTabs = function() {
    var patientId = $scope.caseId;
    $scope.resubmitClass = false;
    if($scope.patientRecordTabs) {}
    else {
      blockUI.start("Loading... ");
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientProfilePatientRecords&PatientId='+patientId).then(function(response) {
        if(response.errors.length > 0) {}
        else {
        blockUI.done(function() {});
        blockUI.stop();
        $scope.patientRecordTabs = response.data;
        var last = $scope.patientRecordTabs.length - 1;
        $scope.prTabSelected = last;
        $scope.prTabReportSelected = last;


        if($scope.navProv && $scope.patientDetails.status.guid === '{742720D2-A583-4A9F-B716-0827FCDCF184}') {
          $scope.addNewPRTab = false;
          $scope.submitPRBtnTitle = 'Resubmit';
          $scope.resubmitClass = true;
        }
        else {
          //If the last treament has been submitted, the user can create a new treatement plan, otherwise, he/she can only edit the current plan
          if($scope.patientRecordTabs[last].submited) {
            $scope.addNewPRTab = true;
            $scope.submitPRBtnTitle = 'Update Patient Record';
          }
          else {
            $scope.addNewPRTab = false;
            $scope.submitPRBtnTitle = 'Submit Patient Record';
          }
        }


        //User can edit the record date, but if it doesn't exist default to Date Created/Added
        // Possibly not needed here - only needed under addNewPatientRecord()
        angular.forEach($scope.patientRecordTabs, function(pr) {
          if(!pr.recordDate) {
            pr.recordDate = pr.DateAdded;
          }
        })
        $scope.defineEditablePatientRecord(last);
        }
      })
    }
  };

  $scope.showPRTabContent = function(tab, index) {
    $scope.prTabSelected = index;
  };

  $scope.getPatientRecord = function(tab) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientProfilePatientRecord&guid='+tab.guid).then(function(response)
     {})
  };

  function savePatientRecord(tab, toastContainer, index, submittedVal) {
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientProfilePatientRecord&RequestBinary=true&providerSubmitted='+submittedVal,
        method: 'POST',
        data: {
            jsonData: JSON.stringify(tab),
        },
        withCredentials: true
    }).then(function (response) {
            if(response.data.errors.length > 0) {
              var modalData = {
                modalTitle: 'Error',
                modalBody: 'Something went wrong.'
              }
              commonFnSrvc.globalModal(modalData);
            }
            else {
              function showSavedToast() {
                $mdToast.show({
                hideDelay   : false,
                position    : 'right',
                parent : $document[0].querySelector(toastContainer),
                scope:$scope,
                preserveScope:true,
                controller  : toastCtrl2,
                template :  '<md-toast class="md-warning-toast-theme"><div class="md-toast-text flex">{{toastMsg}}</div>  &nbsp; <button class="mr-2 btn btn-warning" ng-click="dismissToast()">Okay</button></md-toast>'
                });
              function toastCtrl2($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
               $scope.dismissToast = function() {
                 $mdToast.cancel();
                 }
               }
              };

              if($scope.patientDetails.status.guid === '{742720D2-A583-4A9F-B716-0827FCDCF184}') {
                if(submittedVal === 1) {
                  $scope.addNewPRTab = true;
                  $scope.submitPRBtnTitle = 'Update Patient Record';
                  $scope.resubmitClass = false;
                  commonFnSrvc.getPatientProfile($scope, $scope.patientDetails.id);
                }
                else {
                  $scope.addNewPRTab = false;
                  $scope.submitPRBtnTitle = 'Resubmit';
                  $scope.resubmitClass = true;
                }
              }
              else {
                if(submittedVal === 1) {
                  $scope.addNewPRTab = true;
                  $scope.submitPRBtnTitle = 'Update Patient Record';
                  $scope.resubmitClass = false;
                  commonFnSrvc.getPatientProfile($scope, $scope.patientDetails.id);
                }
                else {
                  if(response.data.data.submited) {
                     $scope.addNewPRTab = true;
                     $scope.submitPRBtnTitle = 'Update Patient Record';
                   }
                   else {
                     $scope.addNewPRTab = false;
                     $scope.submitPRBtnTitle = 'Submit Patient Record';
                   }
                }
              }

              showSavedToast();

            }

        });
  }

  $scope.setPatientRecord = function(tab, toastContainer, index, submitted) {
    toastContainer = toastContainer+index;
    if(submitted) {
      tab.submited = submitted;
      var submittedVal = 1;
      $scope.toastMsg = 'Your Patient Record has been submitted.';
    }
    else {
      tab.submited = false;
      var submittedVal = 0;
      $scope.toastMsg = 'Your data has been saved!';
    }

    savePatientRecord(tab, toastContainer, index, submittedVal);

  };

  $scope.addNewPatientRecord = function(tab) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2AddPatientProfilePatientRecord&PatientId='+$scope.caseId).then(function(response) {
       if(response.errors.length > 0) {}
       else {
         var newTab = response.data;
         $scope.patientRecordTabs.push(newTab);
         var noLongerEditable = $scope.patientRecordTabs.length - 2;
         $scope.patientRecordTabs[noLongerEditable].editable = false;
         var last = $scope.patientRecordTabs.indexOf(newTab);
         $scope.prTabSelected = last;
         //User can edit the record date, but if it doesn't exist default to Date Created/Added
         if(!$scope.patientRecordTabs[last].recordDate) {
           $scope.patientRecordTabs[last].recordDate = $scope.patientRecordTabs[last].DateAdded;
         }
         $scope.defineEditablePatientRecord(last);
         $scope.addNewPRTab = false;
         $scope.submitPRBtnTitle = 'Submit Patient Record';
       }
     })
  };

  $scope.defineEditablePatientRecord = function(last) {
    $scope.patientRecordTabs[last].editable = true;
  };

  $scope.uploadPatientProfileRecordImage = function(prTab, file, field) {
    var tabIndex = $scope.patientRecordTabs.indexOf(prTab);
    Upload.upload({
       url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientRecordFile&RequestBinary=true',
       method: 'POST',
       data: {
           imageFilename: file,
           PatientRecordId: prTab.id,
           FieldName: field
       },
       withCredentials: true

    })
     .then(function (response) {
       if(response.data.errors.length > 0) {
         var toastPosition = 'top';
         var message = 'There was an error uploading this file.';
         var toastLocation = '#airwayToastHolder';
         commonFnSrvc.errorToast(toastLocation, message, toastPosition, $scope);

       }
       else {
         prTab = response.data.data;
         //hack to replace images with correct url
         $scope.patientRecordTabs[tabIndex].patientImages = response.data.data.patientImages;
         $scope.patientRecordTabs[tabIndex].patientOcclussions.digitalImpression = response.data.data.patientOcclussions.digitalImpression;
         $scope.patientRecordTabs[tabIndex].patientOcclussions.stoneModels = response.data.data.patientOcclussions.stoneModels;
         $scope.patientRecordTabs[tabIndex].miscellaneousDocuments = response.data.data.miscellaneousDocuments;
         $scope.patientRecordTabs[tabIndex].files = response.data.data.files;
         $scope.patientRecordTabs[tabIndex].faciometricPosturalImages = response.data.data.faciometricPosturalImages;
         $scope.patientRecordTabs[tabIndex].cbct = response.data.data.cbct;
         $scope.patientRecordTabs[tabIndex].patientHealthHistory.sleepTestInfo.sleepstudy = response.data.data.patientHealthHistory.sleepTestInfo.sleepstudy;
         $scope.patientRecordTabs[tabIndex].editable = true;
       }


     });
  };

  $scope.deletePatientRecordFile = function(prTab, file, field, index) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2DeletePatientRecordFile&PatientRecordId='+prTab.id+'&FieldName='+field).then(function(response) {
      if(response.errors.length > 0) {
        // Not tested
        var modalData = {
          modalTitle: 'Error',
          modalBody: 'Something went wrong when deleting this record.'
        }
        commonFnSrvc.globalModal(modalData);
      }
      else {
        prTab = response.data; //doesn't work,I believe  Need below
        $scope.patientRecordTabs[index] = response.data;
        var last = $scope.patientRecordTabs.length - 1;
        $scope.defineEditablePatientRecord(last);
      }
    });
  };

  $scope.getTreatmentStages = function() {
    commonFnSrvc.getTreatmentStages($scope);
  };

  $scope.getTreatmentOptions = function() {
    commonFnSrvc.getTreatmentOptions($scope)
  };

  $scope.getAppliances = function() {
    commonFnSrvc.getAppliances($scope);
  };

  $scope.addNewTreatmentOption = function(applianceArray, tab) {
      $scope.showNAErrorMsg = false;
      var lastInArray = (applianceArray.length - 1);
      if(!applianceArray[lastInArray].appliance.name) {
          $scope.showNAErrorMsg = true;
          $scope.newApplianceErrorMsg = 'Please select an appliance before adding an new one.'
      }
      else if((applianceArray[lastInArray].appliance.guid === '{C9C9726A-F542-40B8-9674-DD48E2C7AB22}') && !applianceArray[lastInArray].appliance.other) {
              $scope.showNAErrorMsg = true;
              $scope.newApplianceErrorMsg = 'Please fill out a name for the appliance.'
      }
      else {
          var applianceOption = {
            appliance: {
              name: "",
              guid: ""
              },
              monthsInUse: 0,
              hoursWornPerDay: 0,
              monthsOfPassiveUse: 0
          };
          tab.estimatedTreatmentTime.appliance.push(applianceOption);
      }
  };

  $scope.checkIfApplianceIsSelected = function(appliance) {
      $scope.noApplianceSelected = false;
      $scope.showErrorMsg = false;
      if(appliance === null) {
          $scope.noApplianceSelected = true;
          $scope.showErrorMsg = true;
          $scope.errorMsg = 'Please select an appliance before adding an new one.'
      }
  };

  $scope.allowChanges = true; //temp for testing

  $scope.hoverIn = function(tooth, tab) {
    commonFnSrvc.hoverIn(tooth, $scope.allowChanges);
  };

  $scope.hoverOut = function(tooth, tab) {
    commonFnSrvc.hoverOut(tooth, $scope.allowChanges);
  };

  $scope.selectedModel = 1; //this is for teeth charting

  $scope.processZipFile = function(tab) {
    var appDemo2SetPatientRecordZipFile = function() {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientRecordZipFile&PatientRecordId='+tab.id).then(function (response) {
        if(response.errors.length > 0) {
          var modalData = {
            modalTitle: 'Error',
            modalBody: 'Something went wrong downloading this zip file.'
          }
          commonFnSrvc.globalModal(modalData);
        }
        else {
          tab = response.data;
          var fileUrl = tab.files.patientRecordReport;
          $window.open(fileUrl)
        }

      });
    }
    authSrvc.getAuthenticationForClicks(appDemo2SetPatientRecordZipFile);
  };

  $scope.getClasses = function() {
      commonFnSrvc.getClasses($scope);
  };

  $scope.getEthnicity = function () {
      commonFnSrvc.getEthnicity($scope);
  };

  // PATIENT RECORDS - Airway Intelligence Reports **************************/
  $scope.showprTabReportContents = function(tab, index) {
    $scope.prTabReportSelected = index;
  };

  $scope.downloadReport = function(url) {
    var openReportLink = function() {
      $window.open(url);
    }
    authSrvc.getAuthenticationForClicks(openReportLink);
  };

  //********************** Change Status **********************/

  var statusChangeFunction = function() {
    var statusObject = $scope.statusObject;
    var patientDetails = $scope.patientDetails;
    if (statusObject.guid === '{742720D2-A583-4A9F-B716-0827FCDCF184}') {
        $scope.needsMoreInfoModal(patientDetails, statusObject);
    }
    else {
        $scope.confirmStatusChangeModal(patientDetails, statusObject);
    }
  };
  $scope.changeStatus = function (patientDetails, statusObj) {
    $scope.isProvider = false;
    $scope.statusObject = statusObj;
    $scope.patientDetails = patientDetails;
    authSrvc.getAuthenticationForClicks(statusChangeFunction);
  };

  //********************** Resubmit **********************/
  $scope.resubmitPatientRecord = function() {

  };
  //**************************** MODALS ****************************/
  $scope.showArchivePatientModal = function(patientId) {
    ModalService.showModal({
      templateUrl: "/views/patientDetails/modals/archivePatient.html",
      controller: "archivePatientCtrl",
      preClose: (modal) => { modal.element.modal('hide'); },
      inputs: {
        patientId : patientId
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        if(result) {
          $state.go('providerDash');
        }
        else {
          var modalData = {
            modalTitle: 'Error',
            modalBody: 'Something went wrong when trying to delete the patient.'
          }
          commonFnSrvc.globalModal(modalData);
        }
      });
    });
  };

  $scope.showTransferPatientModal = function() {
    ModalService.showModal({
      templateUrl: "/views/patientDetails/modals/transferPatient.html",
      controller: "transferPatientCtrl"
    }).then(function(modal2) {
      modal2.element.modal();
      modal2.close.then(function(result) {
      });
    });
  };

  $scope.confirmStatusChangeModal = function(patientDetails, statusObject) {
    ModalService.showModal({
        templateUrl: '/views/modals/admin/confirmStatusChange.html',
        controller: 'confirmStatusChangeModalCtrl',
        preClose: (modal) => { modal.element.modal('hide'); },
        inputs: {
          patientDetails : patientDetails,
          statusObject : statusObject,
          isProvider : $scope.isProvider
        }
    })
      .then(function (modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            if(result) {
              $scope.statusObj.status = result;
              $scope.patientDetails.status = result;
            }
            else {
              var modalData = {
                modalTitle: 'Error',
                modalBody: 'Something went wrong and the patient\'s status was not changed.'
              }
              commonFnSrvc.globalModal(modalData);
            }

          });
      });
  };

  $scope.needsMoreInfoModal = function(patientDetails, statusObject) {
    ModalService.showModal({
        templateUrl: '/views/modals/admin/needMoreInfo.html',
        controller: 'needMoreInfoModalCtrl',
        preClose: (modal) => { modal.element.modal('hide'); },
        inputs: {
          patientDetails : patientDetails,
          statusObject : statusObject
        }
    })
      .then(function (modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            if(result) {
              $scope.statusObj.status = result;
              $scope.patientDetails.status = result;
              $scope.resubmitClass = false;
            }
            else {
              var modalData = {
                modalTitle: 'Error',
                modalBody: 'Something went wrong and the patient\'s status was not changed.'
              }
              commonFnSrvc.globalModal(modalData);
            }

          });
      });
  };

  $scope.openRescueGuideModal = function(caseId, selectedTile) {
    ModalService.showModal({
        templateUrl: '/views/patientDetails/modals/rescueGuide.html',
        controller: 'rescueGuideModalCtrl',
        preClose: (modal) => { modal.element.modal('hide'); }
    })
      .then(function (modal) {
          modal.element.modal();
          modal.close.then(function(result) {
            if(result) {
              $scope.createPatientPrescriptionRescueGuide(caseId, selectedTile);
            }
          });
      });
  };

}); //End of Controller
