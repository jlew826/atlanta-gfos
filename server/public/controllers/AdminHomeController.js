angular.module('app').controller('AdminHomeCtrl', function($rootScope, $scope, $state) {
    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }

    $scope.viewUsers = function(type) {
        $state.go('admin_view_users', { account_type: type });
    }

    $scope.viewProperties = function(isConfirmed) {
        $state.go('admin_view_properties', { is_confirmed: isConfirmed });
    }
});
