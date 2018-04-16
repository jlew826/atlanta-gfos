angular.module('app').controller('ManageOwnedPropertiesCtrl', function($scope, $rootScope, OwnerSinglePropertyFactory,
    ManagePropertyFactory, RequestFarmItemFactory, $state, $stateParams, FarmItemFactory) {
    $scope.obj = {};
    $scope.ca = {};

    $scope.newFarmItems = { cropType: null};
    $scope.animalOptions = null;
    $scope.cropTypeOptions = {
        Garden: ['Vegetable', 'Flower'],
        Orchard: ['Fruit', 'Nut']
    };

    $scope.isPublicOptions = [true, false];
    $scope.isCommercialOptions = [true, false];

    $scope.confirmErrors = false;
    $scope.nullErrors = false;
    $scope.otherErrors = null;
    $scope.success = false;

    $scope.toAdd = [];
    $scope.toRemove = [];

    $scope.farmItemOptions = [];
    $scope.farmOptions = [];

    function loadProperty() {
        var currentProperty = OwnerSinglePropertyFactory.getPropertyById({
            property_id: $stateParams.propertyId
        }, function(data) {
            data.is_public = data.is_public == true;
            data.is_commercial = data.is_commercial == true;

            data.farmOptions = [];
            if (data.animals && data.type === 'Farm') {
                for (var animal of data.animals.split(',')) {
                    data.farmOptions.push(animal);
                }
            }

            if (data.crops) {
                for (var crop of data.crops.split(',')) {
                    data.farmOptions.push(crop);
                }
            }

            $scope.origProperty = JSON.parse(JSON.stringify(data));
            $scope.obj = JSON.parse(JSON.stringify(data));
        })
    }

    loadProperty();
    FarmItemFactory.animals.getAnimals({}, function(data) {
        if (data && $scope.obj.type === 'Farm') {
            $scope.animalOptions = data;
            for (var a of data) {
                $scope.farmItemOptions.push(a);
            }
        }
    });

    FarmItemFactory.crops.getCrops({}, function(data) {
        if (data) {
            $scope.cropOptions = data;
            for (var c of data) {
                $scope.farmItemOptions.push(c);
            }
        }
    });



    $scope.updateProperty = function() {
        if ($scope.obj.username && $scope.obj.email && $scope.obj.type
            && $scope.obj.is_public != null && $scope.obj.is_commercial != null && $scope.obj.st_address
                && $scope.obj.city && $scope.obj.zip && $scope.obj.size) {
                $scope.nullErrors = false;

                var toChange = { property_id: $scope.obj.property_id, username: $scope.obj.username };
                var keys = Object.values(Object.keys($scope.obj));

                //If obj is dirty we know a change has occurred.
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i];
                    if ($scope.obj[key] !== $scope.origProperty[key] && key !== 'farmOptions') {
                        toChange[key] = $scope.obj[key];
                    }
                }

                if (toChange.farmOptions) {
                    console.log(toChange.farmOptions);
                    toChange.farmOptions = null;
                }


                if ($scope.toAdd.length > 0) {
                    console.log($scope.toAdd);
                    toChange.add_farm_items = $scope.toAdd.slice(0);
                }

                if ($scope.toRemove.length > 0) {
                    toChange.remove_farm_items = $scope.toRemove.slice(0);
                }

                console.log(toChange);
                var res = ManagePropertyFactory.updateProperty(toChange, function() {
                    $scope.success = true;
                    $scope.otherErrors = null;
                    $scope.toAdd = [];
                    $scope.toRemove = [];

                    loadProperty();
                }, function(err) {
                    $scope.success = false;
                    $scope.otherErrors = err;
                });
        } else {
            $scope.nullErrors = true;
        }
    }

    $scope.requestAnimal = function(animalName) {
        if (animalName) {
            var res = RequestFarmItemFactory.animals.requestAnimal({
                username: $rootScope.currentUser.username,
                name: animalName
            }, function(data) {
                $scope.newAnimalSuccess = true;
                $scope.newAnimalErrors = false;
            });
        } else {
            $scope.newAnimalErrors = true;
            $scope.newAnimalSuccess = false;

        }
    }

    $scope.requestCrop = function(cropName, cropType) {
        console.log(cropName);
        console.log(cropType);
        console.log($rootScope.currentUser.username);
        if (cropType && cropName) {
            var res = RequestFarmItemFactory.crops.requestCrop({
                username: $rootScope.currentUser.username,
                name: cropName,
                type: cropType
            }, function(data) {
                console.log(data);
                $scope.newCropSuccess = true;
                $scope.newCropErrors = false;
            });
        } else {
            $scope.newCropErrors = true;
            $scope.newCropSuccess = false;

        }
    }

    $scope.clearQueues = function() {
        $scope.toAdd = [];
        $scope.toRemove = [];
    }

});
