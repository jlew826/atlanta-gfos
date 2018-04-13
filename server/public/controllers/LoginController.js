angular.module('app').controller('LoginCtrl', function($scope, $rootScope, $state, LoginFactory) {
    $scope.email = '';
    $scope.username = '';
    $scope.password = '';
    $scope.loginErrors = false;
    $rootScope.currentUser = null;

    $scope.login = function() {
        if ($scope.username !== null && $scope.password !== null) {
            var user = LoginFactory.login(JSON.stringify({ email: $scope.email, password: $scope.password }), function() {
                if (user.account_type) {
                    $rootScope.currentUser = user;
                    $scope.loginErrors = false;

                    if (user.account_type === 'Visitor') {
                        $state.go('view_properties');
                    }
                }
            }, function() {
                $scope.loginErrors = true;
            });
        }
    }
});