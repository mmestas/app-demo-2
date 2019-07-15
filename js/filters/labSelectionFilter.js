app.filter('labFilter', function() {
  return function (array, expression) {
    if(array) {
      if(expression) {
        if(expression.prescriptionId) {
          var appDemo2LabOption = [];
          var labOptions = [];
          angular.forEach(array, function(lab) {
              if(lab.guid  === '{cfe70a68-ca83-4020-b9e6-0b622d74e309}' ) {
                appDemo2LabOption.push(lab);
              }
              else {
                labOptions.push(lab);
              }
          })

          if(expression.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') {
            //appDemo2 Lab - only return appDemo2 Lab
            return appDemo2LabOption;
          }
          else {
            return labOptions;
          }

        }
        else {
          return array;
        }
      }
    }
  }
});


app.filter('labFinalReviewFilter', function() {
  return function (array, expression) {
    if(array) {
      if(expression) {
          var appDemo2LabOption = [];
          var labOptions = [];
          angular.forEach(array, function(lab) {
              if(lab.guid  === '{cfe70a68-ca83-4020-b9e6-0b622d74e309}' ) {
                appDemo2LabOption.push(lab);
              }
              else {
                labOptions.push(lab);
              }
          })

          if(expression.initialTreatmentPlan.suggestedApplianceTreatmentSystem.guid === '{5db38949-748f-4c89-942a-86f946945f2c}') {
            //appDemo2 Lab - only return appDemo2 Lab
            return appDemo2LabOption;
          }
          else {
            return labOptions;
          }

      }
    }
  }
})
