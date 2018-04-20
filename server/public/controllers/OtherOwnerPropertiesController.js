angular.module('app').controller('OtherOwnerPropertiesCtrl', function($scope, $http, $rootScope, $state, $stateParams, OtherOwnerPropertiesFactory) {
    $scope.otherProperties = null;
    $scope.query = '';
    $scope.order = 'name';
    $scope.asc = false;

    $scope.obj = {};
    $scope.filterOptions = ['name', 'city', 'is_public', 'num_visits', 'avg_rating'];
    $scope.filterRangeOptions = ['num_visits', 'avg_rating'];
    $scope.filterQuery = '';

    $rootScope.currentUser = $rootScope.currentUser ? $rootScope.currentUser : {
        username: "robert123",
        email: "robert123@gmail.com",
    };

    function buildURI(attr, query) {
        var ret = '';
        query = (query === undefined) ? '' : query;

        if (!attr) {
            return ret;
        }

        if (attr === 'size') {
            if (!query) {
                return '';
            }
        }
        if (!$scope.filterRangeOptions.includes(attr)) {
            if (attr === 'is_public') {
                query = (query[0].toLowerCase() === 't') ? 1 : 0;
            }
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
        $http({ method: 'GET', url: '/api/owners/' + $scope.currentUser.username + '/other_properties' + buildURI(attr, query) }).then(function success(res) {
            $scope.otherProperties = res.data;
        }, function error() {

        });
    }

    $scope.avgRatingFilter = function (property) {
        return (property.avg_rating <= $scope.maxAvgRating && property.avg_rating >= $scope.minAvgRating);
    };

    $scope.numVisitsFilter = function (property) {
        return (property.num_visits <= $scope.maxNumVisits && property.num_visits >= $scope.minNumVisits);
    };

    $scope.changeOrder = function(attr) {
        if (attr === $scope.order) {
            $scope.asc = !$scope.asc;
        } else {
            $scope.asc = true;
            $scope.order = attr;
        }
    }

    OtherOwnerPropertiesFactory.getProperties({
        owner_id: $rootScope.currentUser.username
    }, function (data) {
        for (let p of data) {
            p.avg_rating = p.avg_rating ? p.avg_rating : 0;
        }
        $scope.otherProperties = data;
    });

    $scope.viewPropertyDetails = function(id) {
        $state.go('view_property_detail', { propertyId: id, referrer: $state.current.name });
    }

    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }
});
