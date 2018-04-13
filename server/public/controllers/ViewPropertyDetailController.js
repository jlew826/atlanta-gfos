angular.module('app').controller('ViewPropertyDetailCtrl', function($scope, PropertyDetailFactory, $stateParams) {
    $scope.property = null;
    console.log($stateParams);
    var property = PropertyDetailFactory.getPropertyById({ property_id:  $stateParams.propertyId }, function(data) {
        $scope.property = data;
        console.log(data);
    });
});
