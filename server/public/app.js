var app = angular.module('app', ['ui.router', 'ngResource']);
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'public/partials/login.html',
            controller: 'LoginCtrl',
        })

        .state('register', {
            url: '/register',
            templateUrl: 'public/partials/register.html',
            controller: 'RegisterCtrl',
        })

        .state('view_properties', {
            url: '/view_properties',
            templateUrl: 'public/partials/view_properties.html',
            controller: 'ViewPropertiesCtrl'
        })

        .state('view_property_detail', {
            url: '/view_property_detail/{propertyId}',
            params : {
                obj : null
            },
            templateUrl: 'public/partials/view_property_detail.html',
            controller: 'ViewPropertyDetailCtrl'
        });
}]);
