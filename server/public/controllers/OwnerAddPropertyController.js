angular.module('app').controller('OwnerAddPropertyCtrl', function($scope, $http, $rootScope, FarmItemFactory,
    OwnerAddPropertyFactory) {
    $scope.obj = {};

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

    $scope.addProperty = function() {
        let valid = true;
        if ($scope.obj.selectedProperty === 'Farm') {
            valid = $scope.obj.selectedAnimal;
        }
        console.log(valid);

        if (valid && $scope.obj.selectedProperty && $scope.obj.selectedCrop
            && $scope.obj.selectedPublic != null && $scope.obj.selectedCommercial != null
                && $scope.obj.streetAddress && $scope.obj.city && $scope.obj.zip && $scope.obj.size) {
                $scope.confirmErrors = false;
                $scope.nullErrors = false;
                var res = OwnerAddPropertyFactory.addProperty({
                    name: $scope.obj.propertyName,
                    is_commercial: $scope.obj.selectedCommercial,
                    is_public: $scope.obj.selectedPublic,
                    size: $scope.obj.size,
                    st_address: $scope.obj.streetAddress,
                    city: $scope.obj.city,
                    zip: $scope.obj.zip,
                    type: $scope.obj.selectedProperty,
                    animal: $scope.obj.selectedAnimal ? $scope.obj.selectedAnimal.name : null,
                    crop: $scope.obj.selectedCrop,
                    owner_id: $scope.currentUser.username
                }, function() {
                    $scope.success = true;
                    $scope.otherErrors = null;
                }, function(err) {
                    $scope.success = false;
                    $scope.otherErrors = err;
                });
        } else {
            $scope.nullErrors = true;
        }
    }
});
