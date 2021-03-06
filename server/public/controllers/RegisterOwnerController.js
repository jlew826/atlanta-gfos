angular.module('app').controller('RegisterOwnerCtrl', function($scope, $http, $rootScope, RegisterOwnerFactory, FarmItemFactory) {
    $scope.obj = {};

    $scope.animalOptions = null;
    $scope.cropOptions = null;
    $scope.isPublicOptions = [true, false];
    $scope.isCommercialOptions = [true, false];

    $scope.confirmErrors = false;
    $scope.nullErrors = false;
    $scope.otherErrors = null;
    $scope.success = false;

    $scope.propertyOptions = ['Garden', 'Orchard', 'Farm'];
    $scope.cropTypeOptions = {
        Garden: ['Vegetable', 'Flower'],
        Orchard: ['Fruit', 'Nut'],
        Farm: ['Vegetable', 'Flower', 'Fruit', 'Nut']
    };

    $scope.availableCrops = {
        Garden: [],
        Orchard: [],
        Farm: []
    };

    function loadCrops() {
        $http({ method: 'GET', url: '/api/crops/garden' }).then(function success(res) {
            tmp = [];
            for (var crop of res.data) {
                tmp.push(crop.name);
            }
            $scope.availableCrops["Garden"] = tmp;

            for (var crop of res.data) {
                $scope.availableCrops.Farm.push(crop.name);
            }
        }, function error() {

        });

        $http({ method: 'GET', url: '/api/crops/orchard' }).then(function success(res) {
            tmp = [];
            for (var crop of res.data) {
                tmp.push(crop.name);
            }
            $scope.availableCrops["Orchard"] = tmp;
            for (var crop of res.data) {
                $scope.availableCrops.Farm.push(crop.name);
            }
        }, function error() {

        });
    }
    loadCrops();

    FarmItemFactory.animals.getAnimals({}, function(data) {
        $scope.animalOptions = data;
    });

    FarmItemFactory.crops.getCrops({}, function(data) {
        $scope.cropOptions = data;
    });

    $scope.register = function() {
        let valid = true;
        if ($scope.obj.selectedProperty === 'Farm') {
            valid = $scope.obj.selectedAnimal;
        }

        if (valid && $scope.obj.username && $scope.obj.password && $scope.obj.email && $scope.obj.selectedProperty
            && $scope.obj.selectedPublic && $scope.obj.selectedCommercial
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
                        animal: $scope.obj.selectedAnimal ? $scope.obj.selectedAnimal.name : null,
                        crop: $scope.obj.selectedCrop
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
