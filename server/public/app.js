var app = angular.module('app', ['ui.router', 'ngSanitize', 'ngResource']);
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'public/partials/login.html',
            controller: 'LoginCtrl',
        })
        .state('register_visitor', {
            url: '/register_visitor',
            templateUrl: 'public/partials/register_visitor.html',
            controller: 'RegisterVisitorCtrl',
        })
        .state('register_owner', {
            url: '/register_owner',
            templateUrl: 'public/partials/register_owner.html',
            controller: 'RegisterOwnerCtrl',
        })
        .state('view_properties', {
            url: '/view_properties',
            templateUrl: 'public/partials/view_properties.html',
            controller: 'ViewPropertiesCtrl'
        })
        .state('view_property_detail', {
            url: '/view_property_detail/{propertyId}',
            params: {
                referrer: null
            },
            templateUrl: 'public/partials/view_property_detail.html',
            controller: 'ViewPropertyDetailCtrl'
        })
        .state('view_visit_history', {
            url: '/view_visit_history',
            templateUrl: 'public/partials/view_visit_history.html',
            controller: 'ViewVisitHistoryCtrl'
        })
        .state('owned_properties', {
            url: '/owned_properties',
            templateUrl: 'public/partials/owned_properties.html',
            controller: 'OwnedPropertiesCtrl'
        })
        .state('manage_owned_properties', {
            url: '/manage_owned_properties/{propertyId}',
            params: {
                referrer: null
            },
            templateUrl: 'public/partials/manage_owned_properties.html',
            controller: 'ManageOwnedPropertiesCtrl'
        })
        .state('owner_add_property', {
            url: '/owner_add_property',
            templateUrl: 'public/partials/owner_add_property.html',
            controller: 'OwnerAddPropertyCtrl'
        })
        .state('other_owner_properties', {
            url: '/other_owner_properties',
            templateUrl: 'public/partials/other_owner_properties.html',
            controller: 'OtherOwnerPropertiesCtrl'
        })
        .state('admin_home', {
            url: '/admin_home',
            templateUrl: 'public/partials/admin_home.html',
            controller: 'AdminHomeCtrl'
        })
        .state('admin_view_users', {
            url: '/admin_view_users',
            params: {
                account_type: null
            },
            templateUrl: 'public/partials/admin_view_users.html',
            controller: 'AdminViewUsersCtrl'
        })
        .state('admin_view_properties', {
            url: '/admin_view_properties',
            params: {
                is_confirmed: null
            },
            templateUrl: 'public/partials/admin_view_properties.html',
            controller: 'AdminViewPropertiesCtrl'
        });
}]);
