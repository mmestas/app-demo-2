app.controller('createRxCtrl', function ($rootScope, $scope, $state, $stateParams, $location, $window, apiSrvc, authSrvc, commonFnSrvc, paymentFormSrvc,  NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService, $mdToast, $document) {

  $scope.paymentFields = paymentFormSrvc;

  $scope.createRxInit = function() {
    var url = $location.path().split('/');
    var caseId = url[2];
    var tileId = url[3];
    var prescriptionGuid = url[4];
    var rxTreatmentStage = url[5];
    var hasAnAppliance = url[6];
    var freeGuide = url[7];
    var freeGuideInt = parseInt(freeGuide, 10);

    $scope.caseId = caseId;
    $scope.tileId = tileId;
    $scope.prescriptionGuid = prescriptionGuid;
    $scope.RxTreatmentStage = parseInt(rxTreatmentStage, 10);
    $scope.hasAnAppliance = parseInt(hasAnAppliance, 10);
    if(freeGuideInt === 1) {
      $scope.freeGuideOrder = true;
    }
    else {
      $scope.freeGuideOrder = false;
    }

    $scope.getPatientPrescriptionDetails(prescriptionGuid);
    $scope.getGuides();
  };

  //******************************** Check if Individual Sections are Complete *****************************/
  $scope.checkIfLabSelectionIsComplete = function(prescription, newCasefile, externalLink, step) {
    $scope.labSectionComplete = false;
    if(prescription.isRescueGuide) {
      $scope.labSectionComplete = true;
    }
    else {
      if(prescription.labs.lab && prescription.labs.productionTime) {
        $scope.labSectionComplete = true;
      }
      if(step) {
        if($scope.labSectionComplete) {
          $scope.savePatientPrescriptionDetails(prescription, newCasefile, externalLink, step)
        }
        else {
          var toastLocation = '#toastLab';
          var message = 'Please select both a lab and production time to continue';
          var toastPosition = 'top right';
          commonFnSrvc.errorToast(toastLocation, message, toastPosition, $scope);
        }
      }
    }
  };

  $scope.checkIfTeethSelectionIsComplete = function(prescription, newCasefile, externalLink, step) {
    if($scope.labSectionComplete) {
      $scope.teethChartedSectionComplete = true;
    }
    if(step) {
      if($scope.teethChartedSectionComplete) {
        $scope.savePatientPrescriptionDetails(prescription, newCasefile, externalLink, step);
      }
    }
  };

  $scope.checkIfApplianceConstructionIsComplete = function(prescription, newCasefile, externalLink, step) {
    $scope.applianceSystemComplete = false;
    var toastLocation = '#toastAppliances';
    var message = 'Please fill out all required fields to continue';
    var toastPosition = 'top right';
    if(prescription.healthHistory.sleepTestInfo.treatmentStage > 0) {
      var us = prescription.applianceSystem.upperSystem;
      var ls = prescription.applianceSystem.lowerSystem;
      if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem && prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid) {

        var claspsUpperExists = false;
        var claspsLowerExists = false;
        if(prescription.applianceSystem.upperSystem.clasps.adams.length > 0) {claspsUpperExists = true}
        if(prescription.applianceSystem.upperSystem.clasps.arrow.length > 0) {claspsUpperExists = true}
        if(prescription.applianceSystem.upperSystem.clasps.ball.length > 0) {claspsUpperExists = true}
        if(prescription.applianceSystem.upperSystem.clasps.c.length > 0) {claspsUpperExists = true}
        if(prescription.applianceSystem.lowerSystem.clasps.adams.length > 0) {claspsLowerExists = true}
        if(prescription.applianceSystem.lowerSystem.clasps.arrow.length > 0) {claspsLowerExists = true}
        if(prescription.applianceSystem.lowerSystem.clasps.ball.length > 0) {claspsLowerExists = true}
        if(prescription.applianceSystem.lowerSystem.clasps.c.length > 0) {claspsLowerExists = true}

        if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{9303A641-E32C-43DF-9F18-03C551FD99F3}') {
          $scope.guideSystemSelected = false;
          if(!claspsUpperExists) {message = 'Please select numbers on at least one clasp type to continue';}
          //DNA Upper
            if(
            (us.base) &&
            (us.screw) &&
            (us.bow) &&
            (claspsUpperExists)
          ) {$scope.applianceSystemComplete = true;}
        }
        if((prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{AEC9E99B-1D7E-4466-A4DC-744162A005AB}') || (prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{476D52E7-4783-4D40-8BA6-E00471F7B13B}')) {
          $scope.guideSystemSelected = false;
          if(!claspsUpperExists || !claspsLowerExists) {message = 'Please select numbers on at least one clasp type on both the upper and lower systems to continue';}
          //Upper Lower / RNA
          if(
            (us.base) &&
            (us.screw) &&
            (us.bow) &&
            (ls.base) &&
            (ls.bow) &&
            (claspsUpperExists) &&
            (claspsLowerExists)
          ) {$scope.applianceSystemComplete = true;}
        }
        if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{17854ec2-83be-4967-9442-edd568aad472}') {
          $scope.guideSystemSelected = false;
          if(!claspsLowerExists) {message = 'Please select numbers on at least one clasp type to continue';}
          //DNA Lower
          if(
            (ls.base) &&
            (ls.bow) &&
            (claspsLowerExists)
          ) {$scope.applianceSystemComplete = true;}
        }
        if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') {
          $scope.guideSystemSelected = true;
          // This sets the exception for guides to pass the modal source section
          if(step) {
            step = 31;
          }
          //Guide System
          if(prescription.applianceSystem.appDemo2Guides.length > 0) {
            var keepGoing = true;
            angular.forEach(prescription.applianceSystem.appDemo2Guides, function(guide) {
              if(keepGoing) {
                $scope.applianceSystemComplete = false;
                //These guides require sizes
                if((guide.guid === '{9d871633-96d2-47d4-bdec-b6217f1c5373}') || (guide.guid === '{24d324ca-8f29-4ae6-981c-f178fadd922c}')) {
                  if(guide.size) {
                    $scope.applianceSystemComplete = true;
                  }
                  else {
                      message = 'Please select a size for the guide(s) you selected';
                      keepGoing = false;
                  }
                }
                else {
                  $scope.applianceSystemComplete = true;
                }
              }

            })
          }
          else {
            $scope.needToSelectGuide = true;
            if(step) {
              message = 'Please select a guide';
            }
          }
        }
      }
    }

    if(step) {
      if($scope.applianceSystemComplete) {
        $scope.savePatientPrescriptionDetails(prescription, newCasefile, externalLink, step);
      }
      else {
        var toastLocation = '#toastAppliances';
        commonFnSrvc.errorToast(toastLocation, message, toastPosition, $scope);
      }
    }
  };

  $scope.checkIfModelSourceIsComplete = function(prescription, newCasefile, externalLink, step) {
    $scope.modelSourceComplete = false;
    $scope.showErrorMsgModelSrc = false;
    $scope.errorMsg = '';
    var message = 'Please fill out all required fields to continue';
    var sm = prescription.studyModels;
    var smp = prescription.photos.studymodels;

    if(prescription.isRescueGuide) {
      if($scope.applianceSystemComplete) {
        $scope.modelSourceComplete = true;
      }
    }
    else {
      if(prescription.labs.mailInStoneModels) {
        if($scope.patientPrescriptionDetails.labs.mailInConstructionBite) {
          if(!sm.constructionBite || !sm.constructionBite.guid) {
            $scope.modelSourceComplete = false;
             message = 'Please Select a Construction Bite Type';
          }
          else {
            if(sm.constructionBite.guid === '{45ad21c5-2038-4d5c-80e4-1cf0643bfc6d}') {
              if(sm.constructionBiteOther) {
                $scope.modelSourceComplete = true;
              }
              else {
                $scope.modelSourceComplete = false;
                message = 'Please write in "Other" Construction Bite.';
              }
            }
            else {
              $scope.modelSourceComplete = true;
            }
          }
        }
        else {
            $scope.modelSourceComplete = true;
        }
      }

      if(prescription.labs.uploadStoneModels) {
        if(smp.impression3D && smp.lowerArch3Dimpression) {
          //could combine following ifs in ||  possibly?
          if(smp.constructedBite3Dimpression) {
            if(!sm.constructionBite || !sm.constructionBite.guid) {
              $scope.modelSourceComplete = false;
               message = 'Please Select a Construction Bite Type';
            }
            else {
              if(sm.constructionBite.guid === '{45ad21c5-2038-4d5c-80e4-1cf0643bfc6d}') {
                if(sm.constructionBiteOther) {
                  $scope.modelSourceComplete = true;
                }
                else {
                  $scope.modelSourceComplete = false;
                  message = 'Please write in "Other" Construction Bite.';
                }
              }
              else {
                $scope.modelSourceComplete = true;
              }
            }
          }
          if(smp.naturalBite3Dimpression) {
            if($scope.patientPrescriptionDetails.labs.mailInConstructionBite) {
              if(!sm.constructionBite || !sm.constructionBite.guid) {
                $scope.modelSourceComplete = false;
                 message = 'Please Select a Construction Bite Type';
              }
              else {
                if(sm.constructionBite.guid === '{45ad21c5-2038-4d5c-80e4-1cf0643bfc6d}') {
                  if(sm.constructionBiteOther) {
                    $scope.modelSourceComplete = true;
                  }
                  else {
                    $scope.modelSourceComplete = false;
                    message = 'Please write in "Other" Construction Bite.';
                  }
                }
                else {
                  $scope.modelSourceComplete = true;
                }
              }
            }
            else {
              $scope.modelSourceComplete = true;
            }
          }
        }
        else {
          message = 'Please upload both Upper Arch and a Lower Arch digital models.';
        }
      }

      if($scope.guideSystemSelected) {
        $scope.modelSourceComplete = true;
      }

      if(step) {
        if($scope.modelSourceComplete) {
          $scope.savePatientPrescriptionDetails(prescription, newCasefile, externalLink, step);
        }
        else {
          var toastLocation = '#toastModelSrc';

          var toastPosition = 'top right';
          commonFnSrvc.errorToast(toastLocation, message, toastPosition, $scope);
        }
      }
    }

  };

  $scope.checkIfFinalReviewIsComplete = function(prescription, newCasefile, externalLink, step) {
    $scope.finalReviewSectionComplete = false;
    $scope.speakToVAS = false;
    var fr = prescription.labs;

    // appDemo2 Guides
    if(prescription.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') { //Show Guide Shipping Methods Required
      if(fr.guideShippingMethod > 0) {
        if(fr.shipToAddress.guid) {
          if(fr.speakToappDemo2ApplianceSpecialist) { //If speak to a VAS has been checked
            $scope.speakToVAS = true;
            if(fr.applianceSpecialist.id > 0) { //a VAS has been selected because a VAS ID exists
              $scope.finalReviewSectionComplete = true;
            }
          }
          else {
            $scope.finalReviewSectionComplete = true;
          }
        }

      }
    }
    else { //All Other Appliances
      if(fr.applianceShippingMethod > 0) { //If a shipping method has been selected
        if(fr.shipToAddress.guid) { //If a ship to address exists
          $scope.guideShippingMethodRequired = false;
          $scope.guideShippingMethodSelected = false;

            //No longer necessary as we are not using lower system - only upper
            if(prescription.applianceSystem.appDemo2GuideForLowerSystem.guid) { //Guide Shipping Methods Required
              $scope.guideShippingMethodRequired = true;
              if(fr.guideShippingMethod > 0) {
                $scope.guideShippingMethodSelected = true;
              }
            }

            // We are only using this - upper now
            if(prescription.applianceSystem.appDemo2GuideForUpperSystem.guid) { //Guide Shipping Methods Required
              $scope.guideShippingMethodRequired = true;
              if(fr.guideShippingMethod > 0) {
                $scope.guideShippingMethodSelected = true;
              }
            }

          if($scope.guideShippingMethodRequired) {
            if($scope.guideShippingMethodSelected) {
              if(fr.speakToappDemo2ApplianceSpecialist) { //If speak to a VAS has been checked
                $scope.speakToVAS = true;
                if(fr.applianceSpecialist.id > 0) { //a VAS has been selected because a VAS ID exists
                  $scope.finalReviewSectionComplete = true;
                }
              }
              else {
                $scope.finalReviewSectionComplete = true;
              }
            }
          }
          else {
            if(fr.speakToappDemo2ApplianceSpecialist) { //If speak to a VAS has been checked
              $scope.speakToVAS = true;
              if(fr.applianceSpecialist.id > 0) { //a VAS has been selected because a VAS ID exists
                $scope.finalReviewSectionComplete = true;
              }
            }
            else {
              $scope.finalReviewSectionComplete = true;
            }
          }

        }

      }

    }


    if(step) {
      if($scope.finalReviewSectionComplete) {
        $scope.savePatientPrescriptionDetails(prescription, newCasefile, externalLink, step);
      }
      else {
          var toastLocation = '#toastFinalReview';
          var message = 'Please complete all required fields to continue';
          var toastPosition = 'top right';
          commonFnSrvc.errorToast(toastLocation, message, toastPosition, $scope);
      }
    }







  };

  function closeAllSections() {
      $scope.labSelectionSection = false;
      $scope.teethChartingSection = false;
      $scope.applianceConstructionSection = false;
      $scope.modelSourceSection = false;
      $scope.finalReviewSection = false;
      $scope.paymentSection = false;
  };

  function checkSections(step) {
    if(step === 1) {
      $scope.labSectionComplete = true;
      $scope.openTeethCharting();
      document.getElementById("labSelection").classList.remove("errorField");
    }
    else if(step === 2) {
      $scope.teethChartedSectionComplete = true;
      $scope.openApplianceConstruction();
    }
    else if(step === 3) {
      $scope.applianceSystemComplete = true;
      $scope.openModelSource();
    }
    else if(step === 31) { //unique for guides only
      $scope.applianceSystemComplete = true;
      $scope.modelSourceComplete = true;
      $scope.openFinalReview();
    }
    else if(step === 4) {
      $scope.modelSourceComplete = true;
      $scope.openFinalReview();
    }
    else if(step === 5) {
      $scope.finalReviewSectionComplete = true;
      $scope.openPayment();
    }
  };

  //**************** Open / Close Sections **********************//
  // Lab Selection
  $scope.openLabSelection = function() {
    closeAllSections();
    if($scope.allowChanges) {
      $scope.labSectionComplete = false;
    }
    $scope.labSelectionSection = true; $scope.getLabs();
  }
  $scope.closeLabSelection = function() {$scope.labSelectionSection = false;}

  // Teeth Charting
  $scope.openTeethCharting = function() {
    closeAllSections();
    if($scope.allowChanges) {
      $scope.teethChartedSectionComplete = false;
    }
    // $scope.teethChartedSectionComplete = false;
    if($scope.labSectionComplete) {
      $scope.teethChartingSection = true;
    }
  }
  $scope.closeTeethCharting = function() {$scope.teethChartingSection = false;}

  // Appliance Construction
  $scope.openApplianceConstruction = function() {
    closeAllSections();
    // $scope.applianceSystemComplete = false;
    if($scope.allowChanges) {
      $scope.applianceSystemComplete = false;
    }
    if($scope.labSectionComplete && $scope.teethChartedSectionComplete) {
      $scope.applianceConstructionSection = true; $scope.getApplianceData(); $scope.removeSelectedappDemo2Guides();
    }
  }
  $scope.closeApplianceConstruction = function() {$scope.applianceConstructionSection = false;}

  // Model Source
  $scope.openModelSource = function() {
    closeAllSections();
    // $scope.modelSourceComplete = false;
    if($scope.allowChanges) {
      $scope.modelSourceComplete = false;
    }
    if($scope.labSectionComplete && $scope.teethChartedSectionComplete && $scope.applianceSystemComplete) {
      $scope.modelSourceSection = true; $scope.getConstructionBites(); $scope.getShippingMethods();
    }
  }
  $scope.closeModelSource = function() { $scope.modelSourceSection = false;}

  // Final Review
  $scope.openFinalReview = function() {
    closeAllSections();
    if($scope.allowChanges) {
      $scope.finalReviewSectionComplete = false;
    }
    // $scope.finalReviewSectionComplete = false;
    if($scope.labSectionComplete && $scope.teethChartedSectionComplete && $scope.applianceSystemComplete && $scope.modelSourceComplete) {
      $scope.finalReviewSection = true;  $scope.getShippingMethods(); $scope.getappDemo2GuideShippingMethods(); $scope.getApplianceSpecialists();  $scope.getLabs(true);$scope.getShippingAddress();
    }
    $scope.today = new Date();
  }
  $scope.closeFinalReview = function() {$scope.finalReviewSection = false;}

  // Payment Section
  $scope.openPayment = function() {
    closeAllSections();
    if($scope.labSectionComplete && $scope.teethChartedSectionComplete && $scope.applianceSystemComplete && $scope.modelSourceComplete && $scope.finalReviewSectionComplete) {
      $scope.paymentSection = true; $scope.getPrescriptionInvoiceValues();
      // $scope.getOnlinePaymentData();
    }
  }
  $scope.closePayment = function() {$scope.paymentSection = false;}

  //********* Save Functions *************/
  $scope.submitRx = function(prescription, paymentFields) {
    var serializedData = '';
    if(paymentFields) {
      angular.forEach(paymentFields, function(field, key) {
        serializedData = serializedData.concat('&'+key+'='+field);
      })
    }

    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2ProcessPatientPrescriptionInvoice&RequestBinary=true'+serializedData,
        method: 'POST',
        data: {
            jsonData: JSON.stringify(prescription),
        },
        withCredentials: true
    })
      .then(function (response) {
        if(response.data.errors.length > 0) {
          var toastLocation = '#paymentToast';
          var message = response.data.errors[0].userMsg;
          var toastPosition = 'bottom left';
          commonFnSrvc.errorToast(toastLocation, message, toastPosition, $scope);
        }
        else {
          var rx = response.data.data;
          prescriptionDetails(rx);

          if(rx.isFreeGuide) {
            var toastLocation = '#freeGuideOrderToast';
          }
          else {
            var toastLocation = '#paymentToast';
          }
          var message = 'Order successfully submitted!';
          var toastPosition = 'bottom left';
          // commonFnSrvc.errorToast(toastLocation, message, toastPosition, $scope); //Possiblyy use later

        }
      });
  };

  //Not sure if the following function saveAndCreatePrescription() is being used anymore (deprecated - now submitRx())
  // $scope.saveAndCreatePrescription = function(prescription, newCasefile) {
  //   if($scope.allowChanges) {
  //     prescription.teethCharting = newCasefile.teethCharting;
  //   }
  //   var setPatient = function() {
  //     upload({
  //         url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientPrescription&RequestBinary=true',
  //         method: 'POST',
  //         data: {
  //             jsonData: JSON.stringify(prescription),
  //             prescription: 1
  //         },
  //         withCredentials: true
  //     }).then(function (response) {
  //
  //         blockUI.start("Saving ... ");
  //         response.data.data.errors = [{error: true}];
  //         if(response.data.data.errors.length > 0) {
  //           $timeout(function () {
  //               blockUI.stop();
  //           });
  //           var modalData = {
  //             modalTitle: 'Error',
  //             modalBody: 'Something went wrong when saving.'
  //           }
  //           commonFnSrvc.globalModal(modalData);
  //         }
  //         else {
  //           $timeout(function () {
  //               blockUI.stop();
  //           }, 2000);
  //
  //           $mdToast.show({
  //           hideDelay   : false,
  //           position    : 'top',
  //           parent : $document[0].querySelector('#toastHolder'),
  //           scope:$scope,
  //           preserveScope:true,
  //           controller  : toastCtrl,
  //           template :  '<md-toast class="md-success-toast-theme"><div class="md-toast-text flex">Your Rx is submitted and is "in Design." When fabrication begins, you will receive an invoice and the Rx status will update to, "In Fabrication".</div>  &nbsp; <button class="mr-10 btn teal" ng-click="goToPatientProfile()">Okay</button></md-toast>'
  //           });
  //          function toastCtrl($scope, $rootScope, apiSrvc, $mdDialog, $mdToast) {
  //          }
  //
  //         }
  //
  //       });
  //   }
  //   authSrvc.getAuthenticationForClicks(setPatient);
  // };

  $scope.savePatientPrescriptionDetails = function(patientPrescriptionDetails, newCasefile, externalLink, step) {
    if($scope.allowChanges) {
      patientPrescriptionDetails.teethCharting = newCasefile.teethCharting;
    }
    var setPatientPrescription = function() {
      $scope.formUpload = true;
      upload({
          url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientPrescription&RequestBinary=true',
          method: 'POST',
          data: {
              jsonData: JSON.stringify(patientPrescriptionDetails),
          },
          withCredentials: true
      })
        .then(function (response) {
          if(response.data.errors.length > 0) {

          }
          else {
            $scope.patientPrescriptionDetails = response.data.data;
            $scope.newCasefile = angular.copy(response.data.data);
            $scope.checkIfLabSelectionIsComplete($scope.patientPrescriptionDetails);
            $scope.checkIfTeethSelectionIsComplete($scope.patientPrescriptionDetails);
            $scope.checkIfApplianceConstructionIsComplete($scope.patientPrescriptionDetails);
            $scope.checkIfModelSourceIsComplete($scope.patientPrescriptionDetails);
            $scope.checkIfFinalReviewIsComplete($scope.patientPrescriptionDetails);
            checkSections(step);

            blockUI.start("Saving ... ");
            $timeout(function () {
                blockUI.stop();
            }, 2000);

            if(externalLink) {
              $scope.externalLink = externalLink;
            }
          }

        });
    };

    setPatientPrescription();

  };

  $scope.uploadFiles = function (file, field) {
    if($scope.allowChanges) {
      Upload.upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientFile&RequestBinary=true',
         method: 'POST',
         data: {
             imageFilename: file,
             PatientId: $scope.caseId,
             FieldName: field,
         },
         withCredentials: true
      })
       .then(function (response) {
         Upload.upload({
            url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientPrescriptionFile&RequestBinary=true',
            method: 'POST',
            data: {
                imageFilename: file,
                FieldName: field,
                PatientPrescriptionGuid: $scope.patientPrescriptionDetails.guid
            },
            withCredentials: true
         })
          .then(function (response) {
            if(response.data.errors.length > 0) {
              var modalData = {
                modalTitle: 'Error',
                modalBody: 'Something went wrong when saving.'
              }
              commonFnSrvc.globalModal(modalData);
            }
            {
              $scope.patientPrescriptionDetailsImages = response.data.data;
            }

          });
       });
    }


  };

  $scope.saveAndReturn = function(patientPrescriptionDetails, newCasefile) {
    $scope.savePatientPrescriptionDetails(patientPrescriptionDetails, newCasefile);
    $state.go('patientProfile', {id: $scope.caseId, selectedTile: $scope.tileId});
  };

  $scope.goToVasLink = function(patientPrescriptionDetails, newCasefile) {
    if(patientPrescriptionDetails.labs.speakToappDemo2ApplianceSpecialist && patientPrescriptionDetails.labs.applianceSpecialist) {
      var externalLink = patientPrescriptionDetails.labs.applianceSpecialist.scheduleURL;
      $scope.savePatientPrescriptionDetails(patientPrescriptionDetails, newCasefile, externalLink);
    }
  };

  // $scope.submitPatientPrescriptionFreeGuide = function(patientPrescriptionDetails) {
  //     $scope.formUpload = true;
  //     upload({
  //         url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientPrescription&RequestBinary=true',
  //         method: 'POST',
  //         data: {
  //             jsonData: JSON.stringify(patientPrescriptionDetails),
  //         },
  //         withCredentials: true
  //     })
  //       .then(function (response) {
  //         if(response.data.errors.length > 0) {
  //
  //         }
  //         else {
  //           $scope.patientPrescriptionDetails = response.data.data;
  //           $scope.newCasefile = angular.copy(response.data.data);
  //           $scope.submitRx($scope.patientPrescriptionDetails);
  //         }
  //       });
  // };

  //not a save function
  $scope.goToPatientProfile = function() {
    $mdToast.cancel();
    $state.go('patientProfile', {id: $scope.caseId, selectedTile: $scope.tileId});
  };

  //********* Get Functions *************/

  // translate Teeth for Doctor's understanding
  function setUpperSystemClaspsBall(modifiedTeethArray, teethAsStringArray) {
    $scope.upperSystemClaspsBall = teethAsStringArray;
  }
  function setUpperSystemClaspsArrow(modifiedTeethArray, teethAsStringArray) {
    $scope.upperSystemClaspsArrow = teethAsStringArray;
  }
  function setLowerSystemClaspsBall(modifiedTeethArray, teethAsStringArray) {
    $scope.lowerSystemClaspsBall = teethAsStringArray;
  }
  function setLowerSystemClaspsArrow(modifiedTeethArray, teethAsStringArray) {
    $scope.lowerSystemClaspsArrow = teethAsStringArray;
  }

  function prescriptionDetails(rx) {

    if($scope.freeGuideOrder) {
      rx.initialTreatmentPlan.suggestedApplianceTreatmentSystem = {
        guid: "{5db38949-748f-4c89-942a-86f946945f2c}",
        id: 5,
        name: "appDemo2 Guide System"
      };
      $scope.patientPrescriptionDetails = rx;
      $scope.showSections = true;
    }
    else {
      // sort arrays as requested by Todd 6.12.19
      // array.sort(function(a, b){return a-b});
        rx.applianceSystem.upperSystem.occusalAcrylicCoverage.sort(function(a, b){return a-b});

        // translate Teeth for Doctor's understanding
        commonFnSrvc.teethTranslate(rx.applianceSystem.upperSystem.clasps.ball, setUpperSystemClaspsBall);
        commonFnSrvc.teethTranslate(rx.applianceSystem.upperSystem.clasps.arrow, setUpperSystemClaspsArrow);
        commonFnSrvc.teethTranslate(rx.applianceSystem.lowerSystem.clasps.ball, setLowerSystemClaspsBall);
        commonFnSrvc.teethTranslate(rx.applianceSystem.lowerSystem.clasps.arrow, setLowerSystemClaspsArrow);

        var birthdate = rx.patient.patientDOB;
        $scope.patientPrescriptionDetails = rx;
        $scope.showSections = true;
        $scope.newCasefile = angular.copy(rx);
        $scope.patientPrescriptionDetailsImages = angular.copy(rx);

        commonFnSrvc.getAge($scope, birthdate);

        $scope.allowChanges = false; //Changes can be made to Rx and Saved - For New Rx Only (not submitted)
        $scope.allowSave = false; //Rx can be saved
        $scope.allowAddGuide = false; //Can Add a Free Guide

        $scope.agreeToPay = {agree: false};

        if(rx.prescriptionId) {
          if(rx.isRescueGuide) {
            rx.healthHistory.sleepTestInfo.treatmentStage = 1;
            $scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage = 1;
            rx.labs.lab.guid = '{cfe70a68-ca83-4020-b9e6-0b622d74e309}';
            rx.initialTreatmentPlan.suggestedApplianceTreatmentSystem = {
              guid: "{5db38949-748f-4c89-942a-86f946945f2c}",
              id: 5,
              name: "appDemo2 Guide System"
            };
            if(!rx.prescriptionSubmittedDate) {
              $scope.allowChanges = true;
              $scope.allowSave = true;
              $scope.allowAddGuide = true;
            }
          }
          else {
            if(rx.status.guid === '{6CB6C5DD-21E4-4D24-B403-BAFF5988873A}') { //In Fabrication [no changes allowed] - Lockdown!
              $scope.allowChanges = false;
              $scope.allowAddGuide = false;
              $scope.allowSave = false;
            }
            else if(rx.status.guid === '{3D36742C-55DC-47D3-A742-65338BBF8FE5}') { //In Design Review - [limited changes can be made]
              $scope.allowChanges = true;
              $scope.allowSave = true;
              if(rx.orderId) {//appDemo2 Guide and shipping was ordered and paid for
                $scope.allowAddGuide = false;
              }
              else {
                $scope.allowAddGuide = true;
              }
            }
          }

        }
        else { // New Rx never submitted  [all changes allowed]
          $scope.allowChanges = true;
          $scope.allowAddGuide = true;
          $scope.allowSave = true;

          //Sets requirements for stone models by default if neither is selected
          if(!$scope.patientPrescriptionDetails.labs.mailInStoneModels && !$scope.patientPrescriptionDetails.labs.uploadStoneModels) {
            if(
              $scope.patientPrescriptionDetails.photos.studymodels.constructedBite3Dimpression ||
              $scope.patientPrescriptionDetails.photos.studymodels.impression3D ||
              $scope.patientPrescriptionDetails.photos.studymodels.lowerArch3Dimpression ||
              $scope.patientPrescriptionDetails.photos.studymodels.naturalBite3Dimpression ||
              $scope.patientPrescriptionDetails.photos.studymodels.upperArch3Dimpression
            ) {
              $scope.patientPrescriptionDetails.labs.uploadStoneModels = true;
            }
            else {
              $scope.patientPrescriptionDetails.labs.mailInStoneModels = true;
            }
          }

          //Sets the treatment stage defaults only if new Rx
          if($scope.patientPrescriptionDetails.prescriptionNumber === 0) {
            if($scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage <= 1) {
              if($scope.patientPrescriptionDetails.labs.lab.guid !== '{cfe70a68-ca83-4020-b9e6-0b622d74e309}') {
                //If this is the first time a person is ordering an appliance, make treatment stage Initial
                $scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage = $scope.hasAnAppliance;
              }
              else {
                $scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage = $scope.RxTreatmentStage;
              }

            }



          }

        }


        $scope.checkIfLabSelectionIsComplete($scope.patientPrescriptionDetails, $scope.newCasefile);
        $scope.checkIfTeethSelectionIsComplete($scope.patientPrescriptionDetails, $scope.newCasefile);
        $scope.checkIfApplianceConstructionIsComplete($scope.patientPrescriptionDetails, $scope.newCasefile);
        $scope.checkIfModelSourceIsComplete($scope.patientPrescriptionDetails, $scope.newCasefile);
        $scope.checkIfFinalReviewIsComplete($scope.patientPrescriptionDetails, $scope.newCasefile);

        closeAllSections();
    }

  }

  $scope.getPatientPrescriptionDetails = function(prescriptionGuid) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientPrescriptionDetails&patientPrescriptionGuid=' + prescriptionGuid).then(function (response) {
      var rx = response.data;
      prescriptionDetails(rx);

    });
  };

  $scope.getAge = function(birthdate) {
    commonFnSrvc.getAge($scope, birthdate);
  };

  $scope.getLabs = function(finalReviewSection) {
    if(!$scope.labSelections) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetLabSelections').then(function (response) {
        $scope.labSelections = response.data;
        if(finalReviewSection) {
          $scope.finalRevieLlabSelections = $filter('labFinalReviewFilter')($scope.labSelections, $scope.patientPrescriptionDetails);
        }
        else {
          $scope.labSelections = $filter('labFilter')($scope.labSelections, $scope.patientPrescriptionDetails);
        }
      });
    }
    else {
      if(finalReviewSection) {
        $scope.finalRevieLlabSelections = $filter('labFinalReviewFilter')($scope.labSelections, $scope.patientPrescriptionDetails);
      }
    }

  };

  $scope.productionTime = [
      {id: 0, name: "Please Select"},
      {id: 1, name: "Standard"},
      {id: 2, name: "Rush"}
  ];

  $scope.getApplianceData = function() {
    commonFnSrvc.getAppliances($scope);
    if($scope.patientPrescriptionDetails.labs.lab.guid !== '{cfe70a68-ca83-4020-b9e6-0b622d74e309}') {
       $scope.RxTreatmentStage = $scope.hasAnAppliance;
    }

    $scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage = $scope.RxTreatmentStage;
    commonFnSrvc.getTreatmentStages($scope, $scope.RxTreatmentStage);


  };

  $scope.getConstructionBites = function() {
    commonFnSrvc.getContructionBite($scope);
  };

  $scope.getShippingMethods = function() {
    $scope.shippingMethods = [
      {name: "Standard", value: 1, price: 20},
      {name: "Expeditited", value: 2, price: 40},
    ];
  };

  $scope.getappDemo2GuideShippingMethods = function() {
    $scope.guideShippingMethods = [
      {name: "Standard", value: 1, price: 0},
      {name: "Expeditited", value: 2, price: 40},
    ];
  };

  $scope.getApplianceSpecialists = function() {
      commonFnSrvc.getappDemo2ApplianceSpecialists($scope);

  };

  $scope.getGuides = function() {
    commonFnSrvc.getappDemo2Guides($scope);
  };

  $scope.getShippingAddress = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetShippingAddresses').then(function (response) {
        $scope.shippingAddresses = response.data;
        var other = {
          id: 0,
          guid: "",
          isPrimary: false,
          firstName: "",
          lastName: "",
          company: "",
          addressLine1: "Add New",
          addressLine2: "",
          city: "",
          zipPostalCode: "",
          stateProvince: "",
          country: ""
        }
        $scope.shippingAddresses.push(other);

        if(!$scope.patientPrescriptionDetails.labs.shipToAddress.guid) {
          // If a shipping address has not been selected
          angular.forEach($scope.shippingAddresses, function(address) {
            if(address.lastUsed) {
              // Default to the last used
                $scope.patientPrescriptionDetails.labs.shipToAddress = address;
            }
            else {
              if(address.isPrimary) {
                // If there isn't a last used, default to primary
                $scope.patientPrescriptionDetails.labs.shipToAddress = address;
              }
            }
          })
        }


    });
  };

  $scope.getPrescriptionInvoiceValues = function() {
    var prescription = $scope.patientPrescriptionDetails;

    function openPrescription() {
      upload({
          url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientPrescriptionInvoiceValues&RequestBinary=true',
          method: 'POST',
          data: {
              jsonData: JSON.stringify(prescription),
          },
          withCredentials: true
      }).then(function (response) {
        $scope.feesDueNow = response.data.data.feesDueNow;
        $scope.systemFeeItems = response.data.data.systemFeeItems;
        $scope.totalDueNow = 0;
        $scope.totalToBeCharged = 0;
        angular.forEach($scope.feesDueNow, function(fee) {
          $scope.totalDueNow = $scope.totalDueNow + fee.unitPrice;
        });
        angular.forEach($scope.systemFeeItems, function(fee) {
          $scope.totalToBeCharged = $scope.totalToBeCharged + fee.unitPrice;
        });
      });
    };

    function paidPrescription() {
      upload({
          url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetPatientPrescriptionPaidInvoiceValues&RequestBinary=true',
          method: 'POST',
          data: {
              jsonData: JSON.stringify(prescription),
          },
          withCredentials: true
      }).then(function (response) {
        $scope.feesDueNow = response.data.data.feesDueNow;
        $scope.systemFeeItems = response.data.data.systemFeeItems;
        $scope.totalDueNow = 0;
        $scope.totalToBeCharged = 0;
        angular.forEach($scope.feesDueNow, function(fee) {
          $scope.totalDueNow = $scope.totalDueNow + fee.unitPrice;
        });
        angular.forEach($scope.systemFeeItems, function(fee) {
          $scope.totalToBeCharged = $scope.totalToBeCharged + fee.unitPrice;
        });
      });
    };

    if(prescription.orderId) {
      paidPrescription();
    }
    else {
      openPrescription();
    }

  };

  $scope.deleteRx = function(rx) {
    if(!rx.prescriptionSubmittedDate) {
      ModalService.showModal({
          templateUrl: '/views/createRx/deleteRxModal.html',
          controller: function ($element, close) {
              this.confirmDeleteRx = function () {
                $element.modal('hide');
                close(true);
              }
          },
          controllerAs: "modalCtrl"
      })
      .then(function (modal) {
              modal.element.modal();
              modal.close.then(function(result) {
                if(result) {
                  apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2DeletePatientPrescription&guid='+rx.guid).then(function (response) {
                    if(response.errors.length > 0) {
                      // not tested
                      var modalData = {
                        modalTitle: 'Error',
                        modalBody: 'Something went wrong.'
                      }
                      commonFnSrvc.globalModal(modalData);
                    }
                    else {
                      $state.go('patientProfile', {id: $scope.caseId, selectedTile: $scope.tileId});
                    }
                  });
                }
              });
      });

    }

  }

  //************* Teeth Charting ************/
  $scope.allDiagram = true;

  $scope.selectModel = function(num) {
    $scope.missingTeethDiagram = false;
    $scope.bridgeDiagram = false;
    $scope.crownDiagram = false;
    $scope.implantsDiagram = false;
    $scope.impactedDiagram = false;
    $scope.deciduousDiagram = false;
    $scope.allDiagram = false;

    if(num === 1) {
      $scope.missingTeethDiagram = true;
    }
    if(num === 2) {
      $scope.bridgeDiagram = true;
    }
    else if(num === 3) {
      $scope.crownDiagram = true;
    }
    else if(num === 4) {
      $scope.implantsDiagram = true;
    }
    else if(num === 5) {
      $scope.impactedDiagram = true;
    }
    else if(num === 6) {
      $scope.deciduousDiagram = true;
    }
    else if(num === 7) {
      $scope.allDiagram = true;
    }
  };

  //**************************/
  $scope.checkLab = function(labs) {
    if(labs.lab) {
      if(labs.lab.guid === '{cfe70a68-ca83-4020-b9e6-0b622d74e309}') {
        $scope.patientPrescriptionDetails.initialTreatmentPlan.suggestedApplianceTreatmentSystem = {
          guid: "{5db38949-748f-4c89-942a-86f946945f2c}",
          id: 5,
          name: "appDemo2 Guide System"
        };
      }
      else {
        if($scope.patientPrescriptionDetails.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === "{5db38949-748f-4c89-942a-86f946945f2c}") {
          //I believe this checks to see if there was formerly a appDemo2 Guide selected as the suggestedApplianceTreatmentSystem and resets it upon lab selection change
          $scope.patientPrescriptionDetails.initialTreatmentPlan.suggestedApplianceTreatmentSystem = {
            guid: "",
            id: 0,
            name: ""
          }
        }
        // if($scope.hasAnAppliance === 1) {
          $scope.patientPrescriptionDetails.healthHistory.sleepTestInfo.treatmentStage = $scope.hasAnAppliance;
        // }

      }
      labs.productionTime = 0;
      $scope.disableProductionTimeSelection = false;
      if(labs.lab && (!labs.lab.allowRush)) {
        labs.productionTime = 1;
        $scope.disableProductionTimeSelection = true;
      }
      else {
        labs.productionTime = 1;
      }
    }

  };

  $scope.showModelSource = false;

  $scope.removeSelectedappDemo2Guides = function() {
      //This will splice the appDemo2 guides from the already selected guides
    // NOTE: Do Not Delete! This is in case they want the number of guides to decrease upon selection
    // angular.forEach($scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides, function(selectedGuide) {
    //   angular.forEach($scope.appDemo2Guides, function(appDemo2Guide, index) {
    //     if(selectedGuide.id === appDemo2Guide.id) {
    //       $scope.appDemo2Guides.splice(index, 1);
    //     }
    //   });
    // });
  };

  $scope.guideSelect = {};

  $scope.selectGuid = function(selectedGuide) {
    if(selectedGuide) {
      //New - hack for changes (originally done on save and return)
      selectedGuide.invoiced = false;

      $scope.showErrorMsg = true;
      $scope.errorMsg = '';
      // NOTE: Do Not Delete! This is in case they want the number of guides to decrease upon selection
      if(!$scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides) {
        $scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides = [];
      }

      if($scope.patientPrescriptionDetails.isRescueGuide) {
        if($scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides.length < 1) {
         $scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides.push(selectedGuide);
       }
      }
      else {
        if($scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides.length < 4) {
         $scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides.push(selectedGuide);
         // NOTE: Do Not Delete! This is in case they want the number of guides to decrease upon selection
         // angular.forEach($scope.appDemo2Guides, function(appDemo2Guide, index) {
         //   if(selectedGuide.id === appDemo2Guide.id) {
         //     $scope.appDemo2Guides.splice(index, 1);
         //   }
         // });
         if($scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides.length === 4) {
           $scope.showErrorMsg = true;
           $scope.errorMsg = 'You have reached the maximum number of guides';
         }
        }
        else {
         $scope.showErrorMsg = true;
         $scope.errorMsg = 'You have reached the maximum number of guides';
        }
      }


    }
  };

  $scope.addSize = function(size, selectedGuide) {
    selectedGuide.size = size;
  };

  $scope.removeGuide = function(selectedGuide, index) {
    $scope.appDemo2Guides.push(selectedGuide);
    $scope.patientPrescriptionDetails.applianceSystem.appDemo2Guides.splice(index, 1);
    $scope.showErrorMsg = true;
    $scope.errorMsg = '';
  };

  $scope.addNewShipping = function(address) {
    if(address && (address.id === 0)) {
      var emptyAddress = address;
      ModalService.showModal({
            templateUrl: 'views/createRx/addNewAddressModal.html',
            controller: 'addNewShippingModalCtrl',
            preClose: (modal) => { modal.element.modal('hide'); },
            inputs: {
              addressFields: emptyAddress,
              shippingAddresses: $scope.shippingAddresses
            }
        })
          .then(function (modal) {
              var newAddress = {
                id: 0,
                guid: "",
                isPrimary: false,
                firstName: "",
                lastName: "",
                company: "",
                addressLine1: "Add New",
                addressLine2: "",
                city: "",
                zipPostalCode: "",
                stateProvince: "",
                country: ""
              };
              modal.element.modal();
              modal.close.then(function(result) {
                var last = result.length - 1;
                if(result[last].addressLine1 === 'Add New') {
                  //Ensures that this will throw an error if submitted
                  $scope.patientPrescriptionDetails.labs.shippingMethod = null;
                  address.id = '';
                  address.guid = '';
                }
                else {
                  //Sets the ng-model to the newly created address
                  $scope.patientPrescriptionDetails.labs.shippingMethod = result[last];
                  address.id = result[last].id;
                  address.guid = result[last].guid;

                  $scope.shippingAddresses = result;
                   $scope.shippingAddresses.push(newAddress);
                }
              });
          });
    }
  };

  //******************************** MODALS *****************************/
  //Teeth Selection Modals
  $scope.openTeethSelectionModal = function (num) {
    if($scope.allowChanges) {
      var onlyBetween = false;
      var applianceSystem = $scope.patientPrescriptionDetails.applianceSystem.upperSystem;
      if(num === 1) {var selectedModel = applianceSystem.clasps.adams;}
      if(num === 2) {var selectedModel = applianceSystem.clasps.ball; onlyBetween = true;}
      if(num === 3) {var selectedModel = applianceSystem.clasps.c; }
      if(num === 4) {var selectedModel = applianceSystem.clasps.arrow; onlyBetween = true;}
      if(num === 5) {var selectedModel = applianceSystem.stops.mesidal;}
      if(num === 6) {var selectedModel = applianceSystem.stops.distal;}
      if(num === 7) {var selectedModel = applianceSystem.stops.occusal;}
      if(num === 8) {var selectedModel = applianceSystem.occusalAcrylicCoverage;}
      if(num === 9) {var selectedModel = applianceSystem.axialSprings;}
      if(num === 10) {var selectedModel = applianceSystem.eruptionFriendly;}
      if(num === 11) {var selectedModel = applianceSystem.cLoops;}
      if(num === 12) {var selectedModel = applianceSystem.ySplitCutsDistal;}
      if(num === 13) {var selectedModel = applianceSystem.cruciformCutsDistal;}
      if(num === 14) {var selectedModel = applianceSystem.facemaskHooks;}
      if(num === 15) {var selectedModel = applianceSystem.partialOcclusalAcrylicCoverage;}

      ModalService.showModal({
            templateUrl: 'views/createRx/teethSelectionModal.html',
            controller: 'teethSelectionCtrl',
            preClose: (modal) => { modal.element.modal('hide'); },
            inputs: {
              editSelectedModel: selectedModel,
              applianceSystem: applianceSystem,
              num: num,
              onlyBetween: onlyBetween,
              showUpper: true,
              showLower: false
            }
        })
          .then(function (modal) {
              modal.element.modal();
              modal.close.then(function(result) {
                if(num === 1) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.adams = result;}
                if(num === 2) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.ball = result;commonFnSrvc.teethTranslate(result, setUpperSystemClaspsBall);}
                if(num === 3) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.c = result;}
                if(num === 4) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.clasps.arrow = result;commonFnSrvc.teethTranslate(result, setUpperSystemClaspsArrow);}
                if(num === 5) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.stops.mesidal = result;}
                if(num === 6) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.stops.distal = result;}
                if(num === 7) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.stops.occusal = result;}
                if(num === 8) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.occusalAcrylicCoverage = result;}
                if(num === 9) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.axialSprings = result;}
                if(num === 10) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.eruptionFriendly = result;}
                if(num === 11) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.cLoops = result;}
                if(num === 12) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.ySplitCutsDistal = result;}
                if(num === 13) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.cruciformCutsDistal = result;}
                if(num === 14) {$scope.patientPrescriptionDetails.applianceSystem.upperSystem.facemaskHooks = result;}
                if(num === 15) {$scope.patientPrescriptionDetails.applianceSystem.partialOcclusalAcrylicCoverage = result;}
              });

          });
    }
  };

  $scope.openLowerArchTeethSelectionModal = function (num) {
    if($scope.allowChanges) {
      var onlyBetween = false;
      var applianceSystem = $scope.patientPrescriptionDetails.applianceSystem.lowerSystem;
      if(num === 1) {var selectedModel = applianceSystem.clasps.adams;}
      if(num === 2) {var selectedModel = applianceSystem.clasps.ball; onlyBetween = true;}
      if(num === 3) {var selectedModel = applianceSystem.clasps.c; }
      if(num === 4) {var selectedModel = applianceSystem.clasps.arrow; onlyBetween = true;}
      if(num === 5) {var selectedModel = applianceSystem.stops.mesidal;}
      if(num === 6) {var selectedModel = applianceSystem.stops.distal;}
      if(num === 7) {var selectedModel = applianceSystem.stops.occusal;}
      if(num === 8) {var selectedModel = applianceSystem.occusalAcrylicCoverage;}
      if(num === 9) {var selectedModel = applianceSystem.axialSprings;}
      if(num === 10) {var selectedModel = applianceSystem.eruptionFriendly;}
      if(num === 11) {var selectedModel = applianceSystem.cLoops;}
      if(num === 12) {var selectedModel = applianceSystem.partialOcclusalAcrylicCoverage;}
      ModalService.showModal({
            templateUrl: 'views/createRx/teethSelectionModal.html',
            controller: 'teethSelectionCtrl',
            preClose: (modal) => { modal.element.modal('hide'); },
            inputs: {
              editSelectedModel: selectedModel,
              applianceSystem: applianceSystem,
              num: num,
              onlyBetween: onlyBetween,
              showUpper: false,
              showLower: true
            }
        })
          .then(function (modal) {
              modal.element.modal();
              modal.close.then(function(result) {
                if(num === 1) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.adams = result;}
                if(num === 2) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.ball = result;commonFnSrvc.teethTranslate(result, setLowerSystemClaspsBall);}
                if(num === 3) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.c = result;}
                if(num === 4) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.clasps.arrow = result;commonFnSrvc.teethTranslate(result, setLowerSystemClaspsArrow);}
                if(num === 5) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.stops.mesidal = result;}
                if(num === 6) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.stops.distal = result;}
                if(num === 7) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.stops.occusal = result;}
                if(num === 8) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.occusalAcrylicCoverage = result;}
                if(num === 9) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.axialSprings = result;}
                if(num === 10) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.eruptionFriendly = result;}
                if(num === 11) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.cLoops = result;}
                if(num === 12) {$scope.patientPrescriptionDetails.applianceSystem.lowerSystem.partialOcclusalAcrylicCoverage = result;}
              });
          });
    }

  };

  //TEETH SELECTION - duplicate from new-case-steps/index.js
  $scope.hoverIn = function(tooth) {
    if($scope.allowChanges) {
      angular.element('#'+tooth).addClass('highlightMatch');
    }
  };
  $scope.hoverOut = function(tooth) {
    if($scope.allowChanges) {
      angular.element('#'+tooth).removeClass('highlightMatch');
    }
  };

}); //End of Controller
