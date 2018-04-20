angular.module('app').controller('ViewPropertiesCtrl', function($http, $scope, $rootScope, $state, PropertyFactory) {
    $scope.order = 'name';
    $scope.asc = false;

    $scope.obj = {};
    $scope.filterOptions = ['name', 'city', 'type', 'num_visits', 'avg_rating'];
    $scope.filterRangeOptions = ['num_visits', 'avg_rating'];
    $scope.filterQuery = '';

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

    function buildURI(attr, query) {
        var ret = '';
        query = (query === undefined) ? '' : query;

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
                if (attr === 'avg_rating' && $scope.minFil == 0 && $scope.maxFil == 5) {
                    return '';
                }
                ret += '?filter=' + attr + ':' + $scope.minFil + '-' + $scope.maxFil;
            }
        }
        return ret;
    }

    $scope.filterBy = function(attr, query) {
        $http({ method: 'GET', url: '/api/visitors/properties' + buildURI(attr, query) }).then(function success(res) {
            $scope.publicConfirmedProperties = res.data;
        }, function error() {

        });
    }


    $scope.publicConfirmedProperties = null;
    var publicConfirmedPropertiesRes = PropertyFactory.getConfirmedProperties({}, function(publicConfirmedProperties) {
        for (let cf of publicConfirmedProperties) {
            cf.avg_rating = cf.avg_rating ? cf.avg_rating : 0;
        }
        $scope.publicConfirmedProperties = publicConfirmedProperties;
    });

    $scope.viewPropertyDetail = function(id) {
        $state.go('view_property_detail', { propertyId: id, referrer: $state.current.name });
    }

    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }
});
