app.controller('archivePatientCtrl', function($scope, $rootScope, apiSrvc, upload, patientId, close) {

  $scope.dismissModal = function(result) {
  	close(result, 200);
  };

  $scope.getReasonsForArchive = function() {
    apiSrvc.getData($rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2GetReasonsForArchive').then(function (response) {
      $scope.reasonsForArchive = response.data;
    });
  }
  $scope.getReasonsForArchive();

  $scope.patientArchive = {};

  $scope.archiveCase = function(patientArchive) {
    patientArchive.patientId = patientId;

    upload({
        url: $rootScope.apiUrl + '/Default.aspx?remotemethodaddon=appDemo2SetPatientReasonsForArchive&RequestBinary=true',
        method: 'POST',
        data: {
            jsonData: JSON.stringify(patientArchive),
        },
        withCredentials: true
    })
        .then(function (response) {
          if(response.errors.length > 0) {
            $scope.dismissModal(false);
          }
          else {
            $scope.dismissModal(response.data);
          }
        })

  };

});
