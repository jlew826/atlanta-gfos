angular.module('app').controller('RegisterVisitorCtrl', function($scope, $rootScope, RegisterVisitorFactory) {
    $scope.username = '';
    $scope.email = '';
    $scope.password = '';
    $scope.confirmPassword = '';
    $scope.selectedType = '';
    $scope.confirmErrors = false;
    $scope.success = false;

    $scope.register = function() {
        if ($scope.username !== null && $scope.password !== null && $scope.email !== null) {
            if ($scope.password !== $scope.confirmPassword) {
                $scope.confirmErrors = true;
            } else {
                $scope.confirmErrors = false;
                var res = RegisterVisitorFactory.registerVisitor({
                    username: $scope.username,
                    email: $scope.email,
                    password: $scope.password
                }, function() {
                    $scope.success = true;
                });
            }
        }
    }

});
