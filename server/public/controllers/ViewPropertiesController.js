angular.module('app').controller('ViewPropertiesCtrl', function($scope, $rootScope, $state, PropertyFactory) {
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
    var confirmedProperties = PropertyFactory.getConfirmedProperties({}, function(data) {
        $scope.confirmedProperties = data;
    });

    $scope.viewPropertyDetail = function(id) {
        $state.go('view_property_detail', {propertyId: id});
    }
});
