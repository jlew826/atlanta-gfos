angular.module('app').controller('RegisterCtrl', function($scope, $rootScope, RegisterFactory) {
    $scope.greeting = 'hello';
    $scope.username = '';
    $scope.email = '';
    $scope.password = '';
    $scope.types = ['Visitor', 'Owner', 'User'];
    $scope.selectedType = '';

    $scope.register = function() {
        if ($scope.username !== null && $scope.password !== null && $scope.email !== null) {
            if ($scope.selectedType == 'Visitor') {
                var res = RegisterFactory.registerVisitor({
                    username: $scope.username,
                    email: $scope.email,
                    password: $scope.password
                });
            }
        }
    }
});
