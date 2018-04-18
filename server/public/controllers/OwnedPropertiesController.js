angular.module('app').controller('OwnedPropertiesCtrl', function($scope, $rootScope, $state, $stateParams, OwnedPropertyFactory) {
    $scope.ownedProperties = null;
    $scope.query = '';
    $scope.order = 'name';
    $scope.asc = false;

    $scope.obj = {};
    $scope.filterOptions = ['name', 'city', 'type', 'num_visits', 'avg_rating'];
    $scope.selectedFilter = 'name';
    $scope.filterQuery = '';

    $rootScope.currentUser = $rootScope.currentUser ? $rootScope.currentUser : {
        username: "robert123",
        email: "robert123@gmail.com",
    };

    $scope.search = function(property) {
        var query = $scope.query.toLowerCase(),
        fullname = property.name.toLowerCase() + ' ' + property.st_address.toLowerCase() + ' '
            + property.city.toLowerCase() + ' ' + property.zip + ' ' + property.type.toLowerCase() + ' ' + property.property_id.toString().toLowerCase();

        if (fullname.indexOf(query) != -1) {
            return true;
        }
        return false;
    };

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

    $scope.query = '';
    $scope.search = function(property) {
        var query = $scope.query.toLowerCase(),
        fullname = property.name.toLowerCase() + ' ' + property.st_address.toLowerCase() + ' '
            + property.city.toLowerCase() + ' ' + property.zip + ' ' + property.type.toLowerCase() + ' ' + property.property_id.toString().toLowerCase();

        if (fullname.indexOf(query) != -1) {
            return true;
        }
        return false;
    };

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
