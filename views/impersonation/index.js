app.controller('impersonationCtrl', function ($rootScope, $scope, $state, $stateParams, $location, apiSrvc, commonFnSrvc, Upload, upload, $http, $timeout, $interval, $filter, blockUI, authSrvc, $q) {

  $scope.showAutocompleteDropdown = false;
  $scope.searchFields = {
    input: "",
    email: "",
    firstName: "",
    guid: "",
    lastName: ""
   };
   $scope.selectedUser = {
     input: "",
     email: "",
     firstName: "",
     guid: "",
     lastName: ""
   };
  $scope.autocompleteField = 'ex. John Smith';
  $scope.getUsersForAutocomplete = function(input) {
    if(input.length > 2) {
      $scope.showAutocompleteDropdown = true;
      var objectToPost = {
        keyword: input
      };
      upload({
          url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetImpersonateUsers&RequestBinary=true',
          method: 'POST',
          data: {
              jsonData: JSON.stringify(objectToPost),
          },
          withCredentials: true
      }).then(function(response) {
          $scope.userImpersonationDropdown = response.data.data;
      })
    }
  };
  $scope.selectUserToImpersonate = function(user) {
    $scope.selectedUser = user;
    $scope.searchFields = {
      input: "",
      email: "",
      firstName: "",
      guid: "",
      lastName: ""
    };
    $scope.autocompleteSelected = true;
    $scope.autocompleteField = user.firstName + ' ' + user.lastName ;
    $scope.showAutocompleteDropdown = false;
  };

  $scope.impersonateUser = function() {
    var guid = $scope.selectedUser.guid
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2ProcessImpersonateUser&appDemo2Key='+guid).then(function (response) {
      $rootScope.userInfo = response.data;
      authSrvc.redirectUser(response.data);
    });

  };

  $scope.restoreSession = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2RestoreFromImpersonateUser').then(function (response) {
      $rootScope.userInfo = response.data;
      authSrvc.redirectUser(response.data);
    });
  };


});
