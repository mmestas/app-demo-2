app.controller('rescueGuideModalCtrl', function($scope, close) {

  $scope.checkbox = {
    iAgree: false
  }

  $scope.dismissModal = function(result) {
    result = false;
  	close(result, 200);
  };

  $scope.continueToRescueGuideOrder = function() {
    close(true)
  }

});
