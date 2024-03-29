app.controller('needMoreInfoModalCtrl', function($scope, $rootScope, apiSrvc, upload, patientDetails, statusObject, close) {

  $scope.patientDetails = patientDetails;
  $scope.statusObject = statusObject;

  $scope.saveMoreInfoNotes = function(patientDetails) {
    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientProfileNeedsMoreInfoStatus&RequestBinary=true',
        method: 'POST',
        data: {
          PatientProfileGuid: patientDetails.guid,
          needsMoreInfo: patientDetails.needsMoreInfo
        },
        withCredentials: true
    }).then(function (response) {
        if(response.data.errors.length > 0) {
          close(false);
        }
        else {
          close(statusObject, 200);
        }
      });
  };

  $scope.dismissModal = function() {
    statusObject = patientDetails.status;
  	close(statusObject, 200);
  };

});
