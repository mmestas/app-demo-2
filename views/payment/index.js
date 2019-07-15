app.controller('paymentFormCtrl', function ($rootScope, $scope, $state, $stateParams, $location, $window, apiSrvc, authSrvc, commonFnSrvc, paymentFormSrvc,  NgTableParams, fileUpload, $http, $timeout, $interval, $compile, Upload, upload, $filter, blockUI, ModalService, $mdToast, $document) {

  $scope.paymentFormFields = paymentFormSrvc;

  function init() {
    $scope.getOnlinePaymentData();
    $scope.paymentFormFields.onDemandMethodTypeId = 1;
    $scope.paymentFormFields.saveCardToAccount = 1;
  };

  $scope.getOnlinePaymentData = function() {
    commonFnSrvc.getOnlinePaymentData($scope);
    commonFnSrvc.getCCMonths($scope);
    commonFnSrvc.getCCYears($scope);
  };

  init();

});
