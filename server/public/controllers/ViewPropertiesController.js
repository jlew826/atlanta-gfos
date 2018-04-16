angular.module('app').controller('ViewPropertiesCtrl', function($scope, $rootScope, $state, PropertyFactory, PropertyDetailFactory) {
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
    $scope.confirmedProperties = null;
    var confirmedPropertiesRes = PropertyFactory.getConfirmedProperties({}, function(confirmedProperties) {
        //make separate visitor view queries to get the number of visits since they aren't available in the initial query
        for (var cp of confirmedProperties) {
            var property = PropertyDetailFactory.getVisitorViewOfProperty({
                visitor_id: $rootScope.currentUser.username,
                property_id:  cp.property_id
            }, function(data) {
                cp.num_visits = property.num_visits;
                $scope.property = data;
            });
        }
        $scope.confirmedProperties = confirmedProperties;
    });

    $scope.viewPropertyDetail = function(id) {
        $state.go('view_property_detail', { propertyId: id });
    }

    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }
});
