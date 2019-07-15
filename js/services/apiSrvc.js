app.service('apiSrvc', function ($http, $location, $rootScope) {
    //
    // configure hosts
    window.__env = window.__env || {};
    if ($location.host().toLowerCase() === 'diagnostics.appDemo2life.com') {
        // API url - url to the data services
        $rootScope.apiUrl = 'https://cloud.appDemo2life.com';
        $rootScope.ordersURL = 'https://orders.appDemo2life.com';
        $rootScope.cloudUrl = 'https://cloud.appDemo2life.com';
        $rootScope.contentUrl = 'https://cloud.appDemo2life.com';
        $rootScope.baseUrl = 'https://diagnostics.appDemo2life.com';

        // $rootScope.awsURL = 'https://appDemo2cdn.s3.amazonaws.com/';
        // $rootScope.awsURL = 'https://appDemo2cdns3.s3.amazonaws.com/';

    }
    else if($location.host().toLowerCase() === 'vpd-pd-sitefpo.com') {
      $rootScope.apiUrl = 'http://vpc-pd-.sitefpo.com';
      $rootScope.cloudUrl = 'http://vpc-pd-.sitefpo.com';
      $rootScope.contentUrl = 'http://vpc-pd-.sitefpo.com';
      $rootScope.baseUrl = 'http://vpd-pd-.sitefpo.com';

      // $rootScope.awsURL = 'https://appDemo2cdns3staging.s3.amazonaws.com/';
      // $rootScope.awsURL = 'https://s3Bucket-dev-upload.s3.amazonaws.com/';
    }
    else {
        // API url - url to the data services
        $rootScope.apiUrl = 'http://cloud.staging-appDemo2.sitefpo.com';
        $rootScope.ordersURL = 'http://orders.staging-appDemo2.sitefpo.com';
        $rootScope.cloudUrl = 'http://cloud.staging-appDemo2.sitefpo.com';
        $rootScope.contentUrl = 'http://cloud.staging-appDemo2.sitefpo.com';
        $rootScope.baseUrl = 'http://diagnostics.staging-appDemo2.sitefpo.com';

        // $rootScope.awsURL = 'https://s3Bucket-dev-upload.s3.amazonaws.com/';
        // $rootScope.awsURL = 'https://appDemo2cdns3staging.s3.amazonaws.com/';

    }
    // Enable cross domain calls
    $http.defaults.useXDomain = true;
    // Remove the header used to identify ajax call  that would prevent CORS from working
    delete $http.defaults.headers.common['X-Requested-With'];

    //*****************************
    this.getData = function (addonName, queryString) {
        if (queryString) {
            queryString = '?' + queryString;
            // queryString = 'index.aspx?' + queryString;
        } else {
            queryString = "";
        }
        return $http.get(addonName + queryString, { withCredentials: true })
            .then(function (result) {
                return result.data
            }, function (error) {
                console.error('Error: getData callback');
            })
    };

});


//***************************************************************************************
//* UPLOAD SERVICE
//***************************************************************************************
// NOTE: .success(function) is deprecated in Angular 1.6+
app.service('fileUpload', function ($http) {
    this.uploadFileToUrl = function (file, uploadUrl) {
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined },
            withCredentials: true
        })
            .then(function successCallback(response) {
            }
                , function errorCallback(response) {
                });
    }
});

//***************************************************************************************
//* UPLOAD DIRECTIVE
//***************************************************************************************
app.directive('fileModel', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope.$parent, element[0].files[0]);
                });
            });
        }
    };
});
