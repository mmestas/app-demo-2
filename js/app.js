
var app = angular.module('appDemo2Diagnostics', ['ui.router', 'ngTable', 'ngFileUpload', 'lr.upload', 'ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'blockUI', 'angularModalService', 'ngSanitize', 'imageCropper'], function () { });

// app.directive('stringToNumber', function () {
//     return {
//         require: 'ngModel',
//         link: function (scope, element, attrs, ngModel) {
//             ngModel.$parsers.push(function (value) {
//                 return '' + value;
//             });
//             ngModel.$formatters.push(function (value) {
//                 return parseFloat(value);
//             });
//         }
//     };
// });
