angular.module('app').controller('OwnedPropertiesCtrl', function($scope, $rootScope, $state, $stateParams, OwnedPropertyFactory) {
    $scope.ownedProperties = null;

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
