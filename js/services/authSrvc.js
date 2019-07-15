app.service('authSrvc', function ($http, $location, $state, $rootScope, apiSrvc, commonFnSrvc,  $q, ModalService) {

  function redirectUser(user) {
    if($location.$$path === '/') {
      if (user.userRole.ccGuid === "{9e997bf7-596a-4a90-9b4b-5c7d9aeb8742}") {
          $state.go('providerDash');
      }
      else if (user.userRole.ccGuid === "{7496ea19-b7e4-4805-8c8e-7c22bf483cbc}") {
          $state.go('clinicianDash');
      }
      else if (user.userRole.ccGuid === "{35196A22-7C2C-4F91-A25C-7CD783D28CCC}") {
          $state.go('finalReviewerDash');

      }
      else if (user.userRole.ccGuid === "{fbc16991-fd1b-43db-89c8-9c2906281eb3}") {
          $state.go('techDash');
      }
      else if (user.userRole.ccGuid === "{11a538f5-dbab-47a8-a959-bc1b6b93b5d5}") {
          $state.go('adminDash');
      }
      else {
          window.location = $rootScope.cloudUrl;
          $scope.loggedInNav = false;
      }
    }
    if (user.userRole.ccGuid === "{9e997bf7-596a-4a90-9b4b-5c7d9aeb8742}") {
      //doctor
      $rootScope.navTech = false;
      $rootScope.navDiag = false;
      $rootScope.navAdmin = false;
      $rootScope.navProv = true;
    }
    else if (user.userRole.ccGuid === "{7496ea19-b7e4-4805-8c8e-7c22bf483cbc}") {
      //diagnostician
      $rootScope.navTech = false;
      $rootScope.navDiag = true;
      $rootScope.navAdmin = false;
      $rootScope.navProv = false;
      $rootScope.uiid = user.id;
    }
    else if (user.userRole.ccGuid === "{35196A22-7C2C-4F91-A25C-7CD783D28CCC}") {
      //final reviewer
      $rootScope.navTech = false;
      $rootScope.navDiag = true;
      $rootScope.navAdmin = false;
      $rootScope.navProv = false;
      $rootScope.uiid = user.id;
    }
    else if (user.userRole.ccGuid === "{fbc16991-fd1b-43db-89c8-9c2906281eb3}") {
      //technician
      $rootScope.navTech = true;
      $rootScope.navDiag = false;
      $rootScope.navAdmin = false;
      $rootScope.navProv = false;
    }
    else if (user.userRole.ccGuid === "{11a538f5-dbab-47a8-a959-bc1b6b93b5d5}") {
      //admin
      $rootScope.navTech = false;
      $rootScope.navDiag = false;
      $rootScope.navAdmin = true;
      $rootScope.navProv = false;
    }
  }

  this.redirectUser = function(user) {
    $state.go('default');
    // redirectUser(user);
  };

  this.getUserRole = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetUserInformation').then(function (response) {
      var user = response.data;
      if (response.errors.length > 0) {
          $rootScope.userInfo = {};
          window.location = $rootScope.cloudUrl;
          $rootScope.loggedInNav = false;
          return false;
      } else {
          $rootScope.userInfo = response.data;
          if (response.data.isInUSDoctorGroup) {
              $rootScope.portalAuthenticated = true;
              $rootScope.portalIntl = false;
              $rootScope.portal = true;
          }
          else if (response.data.isInInternationalDoctorGroup) {
              $rootScope.portalAuthenticated = true;
              $rootScope.portalIntl = true;
              $rootScope.portal = false;
          }
          else {
              $rootScope.portalAuthenticated = false;
              $rootScope.portalIntl = false;
              $rootScope.portal = false;
          }
          $rootScope.loggedInNav = true;
      }
      redirectUser(user);

    });
  };

  var autoLogoutModal = function() {
    ModalService.showModal({
        templateUrl: 'autoLogout.html',
        controller: function ($element) {
            this.redirectToLogin = function () {
                 $element.modal('hide');
                window.location = $rootScope.cloudUrl;
            }
        },
        controllerAs: "modalCtrl"
    })
    .then(function (modal) {
            modal.element.modal();
            modal.close.then(function(result) {});
    });
  };

  this.getAuthenticationForClicks = function(functionToGetCalled) {
      apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetUserInformation').then(function (response) {
          var myBoolean = null;
          if (response.errors.length > 0) {
              myBoolean = false;
              autoLogoutModal();
          }
          else {
              myBoolean = true;
              functionToGetCalled();
          }
          return myBoolean;
      });
  };

  this.goToPatientDetails = function(casefile, selectedTile) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetUserInformation').then(function (response) {
        if (response.errors.length > 0) {
            autoLogoutModal();
        }
        else {
          $state.go('patientProfile', {id: casefile.id, selectedTile: selectedTile});

        }
    });
  };

  this.goToProviderPatientDetails = function(casefile, selectedTile) {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetUserInformation').then(function (response) {
        if (response.errors.length > 0) {
            autoLogoutModal();
        }
        else {
          if(casefile.status.id === 1) {
            $state.go('new-case.step-1', {id: casefile.id, selectedTile: selectedTile});
          }

          else {
            $state.go('patientProfile', {id: casefile.id, selectedTile: selectedTile}); //USE FOR REAL
          }

        }
    });
  };

}); //End of Service
