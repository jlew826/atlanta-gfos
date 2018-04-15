angular.module('app').controller('ViewPropertyDetailCtrl', function($scope, $rootScope, PropertyDetailFactory,
    VisitLoggerFactory, $state, $stateParams) {
    $scope.property = null;
    $scope.score = {
        "selected": null
    };
    $scope.options = [
        {id: 1, value: 1},
        {id: 2, value: 2},
        {id: 3, value: 3},
        {id: 4, value: 4},
        {id: 5, value: 5}
    ];
    $scope.logError = false;
    $scope.currentUserType = ($rootScope.currentUser) ? $rootScope.currentUser.account_type : 'Visitor'; //TODO: remove fallback

    $rootScope.currentUsername = ($rootScope.currentUser != undefined) ? $rootScope.currentUser.username : 'user123';
    $stateParams.propertyId = $stateParams.propertyId || '5';
    $scope.property_id = $stateParams.propertyId;

    var property = PropertyDetailFactory.getVisitorViewOfProperty({ visitor_id: $rootScope.currentUsername, property_id:  $stateParams.propertyId }, function(data) {
        $scope.property = data;
    });

    $scope.unlogVisit = function() {
        var unlogVisitRes = VisitLoggerFactory.unlogVisit({
                username: $rootScope.currentUsername,
                property_id: $scope.property_id
            }, function(data) {
                console.log(data);
                $state.transitionTo($state.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
        });
    }

    $scope.logVisit = function() {
        if (!$scope.score.selected) {
            $scope.logError = true;
        } else {
            var logVisitRes = VisitLoggerFactory.logVisit({
                    username: $rootScope.currentUsername,
                    property_id:  $stateParams.propertyId,
                    score: $scope.score.selected
                }, function(data) {
                    $state.transitionTo($state.current, $stateParams, {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
            });
        }
    }
});
