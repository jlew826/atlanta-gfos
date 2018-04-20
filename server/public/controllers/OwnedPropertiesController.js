angular.module('app').controller('OwnedPropertiesCtrl', function($http, $scope, $rootScope, $state, $stateParams, OwnedPropertyFactory) {
    $scope.ownedProperties = null;
    $scope.query = '';
    $scope.order = 'name';
    $scope.asc = false;

    $scope.obj = {};
    $scope.filterOptions = ['name', 'city', 'type', 'num_visits', 'avg_rating'];
    $scope.filterQuery = '';

    $rootScope.currentUser = $rootScope.currentUser ? $rootScope.currentUser : {
        username: "robert123",
        email: "robert123@gmail.com",
    };

    $scope.avgRatingFilter = function (property) {
        return (property.avg_rating <= $scope.maxAvgRating && property.avg_rating >= $scope.minAvgRating);
    };

    $scope.numVisitsFilter = function (property) {
        return (property.num_visits <= $scope.maxFil && property.num_visits >= $scope.minFil);
    };

    $scope.changeOrder = function(attr) {
        if (attr === $scope.order) {
            $scope.asc = !$scope.asc;
        } else {
            $scope.asc = true;
            $scope.order = attr;
        }
    }

    function buildURI(attr, query) {
        var ret = '';
        if (!attr) {
            return ret;
        }
        if (!$scope.filterRangeOptions.includes(attr)) {
            ret += '?filter=' + attr + ':' + query;
        } else {
            if ($scope.minFil != null && $scope.maxFil != null) {
                if (attr === 'num_visits') {
                    $scope.minFil = Math.floor($scope.minFil);
                    $scope.maxFil = Math.floor($scope.maxFil);
                }
                ret += '?filter=' + attr + ':' + $scope.minFil + '-' + $scope.maxFil;
            }
        }
        return ret;
    }

    $scope.filterBy = function(attr, query) {
        $http({ method: 'GET', url: '/api/owners/' + $scope.currentUser.username + '/own_properties' + buildURI(attr, query) }).then(function success(res) {
            $scope.ownedProperties = res.data;
        }, function error() {

        });
    }

    OwnedPropertyFactory.getProperties({
        owner_id: $rootScope.currentUser.username
    }, function (data) {
        for (let p of data) {
            p.avg_rating = p.avg_rating ? p.avg_rating : 0;
        }
        $scope.ownedProperties = data;
    });

    $scope.manageProperty = function(id) {
        $state.go('manage_owned_properties', { propertyId: id });
    }

    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }
});
