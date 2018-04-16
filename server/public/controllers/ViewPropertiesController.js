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
    $scope.publicConfirmedProperties = null;
    var publicConfirmedPropertiesRes = PropertyFactory.getConfirmedProperties({}, function(publicConfirmedProperties) {
        console.log("hello");
        $scope.publicConfirmedProperties = publicConfirmedProperties;
    });

    $scope.viewPropertyDetail = function(id) {
        $state.go('view_property_detail', { propertyId: id });
    }

    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }
});
