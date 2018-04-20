angular.module('app').controller('AdminViewPropertiesCtrl', function($http, $rootScope, $scope, $state, $stateParams) {
    $scope.obj = {};
    $scope.shownProperties = null;
    $scope.isConfirmed = $stateParams.is_confirmed;

    $scope.order = 'name';
    $scope.asc = false;

    $scope.obj = {};
    $scope.filterUnconfirmedOptions = ['name', 'size', 'owner_id'];
    $scope.filterConfirmedOptions = ['name', 'zip', 'type', 'approved_by_admin', 'avg_rating'];
    $scope.filterRangeOptions = ['avg_rating'];
    $scope.filterQuery = '';
    $scope.order = '';

    function loadProperties() {
        if (!$scope.isConfirmed) {
            $http({ method: 'GET', url: '/api/properties/unconfirmed'}).then(function success(res) {
                $scope.shownProperties = res.data;
            }, function error() {});
        } else {
            $http({ method: 'GET', url: '/api/properties/confirmed'}).then(function success(res) {
                $scope.shownProperties = res.data;
            }, function error() {});
        }
    }

    loadProperties();

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
        query = (query == undefined) ? '' : query;

        if (!attr) {
            return ret;
        }

        if (attr === 'size') {
            if (!query) {
                return '';
            }
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
        $http({ method: 'GET', url: '/api/properties/' + ($scope.isConfirmed ?  'confirmed' : 'unconfirmed')
            + buildURI(attr, query) }).then(function success(res) {
            $scope.shownProperties = res.data;
        }, function error() {

        });
    }

    $scope.viewPropertyDetail = function(id) {
        $state.go('view_property_detail', { propertyId: id, referrer: $state.current.name });
    }

    $scope.manageProperty = function(id) {
        $state.go('manage_owned_properties', { propertyId: id, referrer: $scope.isConfirmed });
    }

    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }
});
