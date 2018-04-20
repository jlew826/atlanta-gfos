angular.module('app').controller('ViewVisitHistoryCtrl', function($scope, $rootScope, $state, $stateParams, VisitHistoryFactory, PropertyFactory) {
    $scope.order = 'name';
    $scope.asc = false;

    $scope.visitHistory = null;
    $rootScope.currentUsername = ($rootScope.currentUser != undefined) ? $rootScope.currentUser.username : 'user123';
    $scope.currentUserType = ($rootScope.currentUser) ? $rootScope.currentUser.account_type : 'Visitor'; //TODO: remove fallback


    var vh = VisitHistoryFactory.getVisitHistory({ username: $rootScope.currentUsername}, function(data) {
        $scope.visitHistory = data;
    });


    $scope.viewPropertyDetailFromHistory = function(name) {
        var confirmedPropertiesRes = PropertyFactory.getConfirmedProperties({}, function(confirmedProperties) {
            for (var cp of confirmedProperties) {
                if (cp.name === name) {
                    $state.go('view_property_detail', { propertyId: cp.property_id });
                }
            }
            $scope.confirmedProperties = confirmedProperties;
        });
    }

    $scope.changeOrder = function(attr) {
        if (attr === $scope.order) {
            $scope.asc = !$scope.asc;
        } else {
            $scope.asc = true;
            $scope.order = attr;
        }
    }
});
