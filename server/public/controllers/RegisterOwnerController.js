angular.module('app').controller('RegisterOwnerCtrl', function($scope, $rootScope, RegisterOwnerFactory, FarmItemFactory) {
    $scope.obj = {};

    $scope.propertyOptions = ['Garden', 'Orchard', 'Farm'];
    $scope.animalOptions = null;
    $scope.cropOptions = null;
    $scope.isPublicOptions = [true, false];
    $scope.isCommercialOptions = [true, false];

    $scope.confirmErrors = false;
    $scope.nullErrors = false;
    $scope.otherErrors = null;
    $scope.success = false;

    FarmItemFactory.animals.getAnimals({}, function(data) {
        $scope.animalOptions = data;
    });

    FarmItemFactory.crops.getCrops({}, function(data) {
        $scope.cropOptions = data;
    });

    $scope.register = function() {
        if ($scope.obj.username && $scope.obj.password && $scope.obj.email && $scope.obj.selectedProperty
            && $scope.obj.selectedAnimal && $scope.obj.selectedCrop && $scope.obj.selectedPublic && $scope.obj.selectedCommercial
                && $scope.obj.streetAddress && $scope.obj.city && $scope.obj.zip && $scope.obj.size) {

            if ($scope.password !== $scope.confirmPassword) {
                $scope.confirmErrors = true;
            } else {
                $scope.confirmErrors = false;
                $scope.nullErrors = false;
                var res = RegisterOwnerFactory.registerOwner({
                    owner: {
                        username: $scope.obj.username,
                        email: $scope.obj.email,
                        password: $scope.obj.password
                    },
                    property: {
                        name: $scope.obj.propertyName,
                        is_commercial: $scope.obj.selectedCommercial,
                        is_public: $scope.obj.selectedPublic,
                        size: $scope.obj.size,
                        st_address: $scope.obj.streetAddress,
                        city: $scope.obj.city,
                        zip: $scope.obj.zip,
                        type: $scope.obj.selectedProperty,
                        animal: $scope.obj.selectedAnimal.name,
                        crop: $scope.obj.selectedCrop.name
                    }
                }, function() {
                    $scope.success = true;
                    $scope.otherErrors = null;
                }, function(err) {
                    $scope.success = false;
                    $scope.otherErrors = err;
                });
            }
        } else {
            $scope.nullErrors = true;
        }
    }

});
