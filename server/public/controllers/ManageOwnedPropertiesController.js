angular.module('app').controller('ManageOwnedPropertiesCtrl', function($scope, $rootScope, OwnerSinglePropertyFactory,
    ManagePropertyFactory, RequestFarmItemFactory, $state, $stateParams, FarmItemFactory, $http) {
    $scope.obj = {};
    $scope.ca = {};

    $scope.newFarmItems = { cropType: null};
    $scope.animalOptions = null;
    $scope.cropTypeOptions = {
        Garden: ['Vegetable', 'Flower'],
        Orchard: ['Fruit', 'Nut']
    };
    $scope.availableCrops = [];

    $scope.isPublicOptions = [true, false];
    $scope.isCommercialOptions = [true, false];

    $scope.confirmErrors = false;
    $scope.nullErrors = false;
    $scope.otherErrors = null;
    $scope.queueError = false;
    $scope.success = false;

    $scope.toAdd = [];
    $scope.toRemove = [];

    $scope.farmItemOptions = [];
    $scope.farmOptions = [];

    $scope.referredByAdmin = $stateParams.referrer;

    function loadCrops() {
        if ($scope.obj.type === 'Garden') {
            $http({ method: 'GET', url: '/api/crops/garden' }).then(function success(res) {
                tmp = [];
                for (var crop of res.data) {
                    tmp.push(crop.name);
                }
                $scope.availableCrops = tmp;
            }, function error() {

            });
        }

        if ($scope.obj.type === 'Orchard') {
            $http({ method: 'GET', url: '/api/crops/orchard' }).then(function success(res) {
                tmp = [];
                for (var crop of res.data) {
                    tmp.push(crop.name);
                }
                $scope.availableCrops = tmp;
            }, function error() {

            });
        }

        if ($scope.obj.type === 'Farm') {
            $http({ method: 'GET', url: '/api/crops/' }).then(function success(res) {
                for (var crop of res.data) {
                    if (!$scope.availableCrops.includes(crop.name)) {
                        $scope.availableCrops.push(crop.name);
                    }
                }
            }, function error() {

            });
            $http({ method: 'GET', url: '/api/animals/' }).then(function success(res) {
                for (var animal of res.data) {
                    $scope.availableCrops.push(animal.name);
                }
                $scope.availableAnimals = res.data;
            }, function error() {

            });
        }
    }

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
            loadCrops();
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
                    toChange.farmOptions = null;
                }


                if ($scope.toAdd.length > 0) {
                    console.log($scope.toAdd);
                    toChange.add_farm_items = $scope.toAdd.slice(0);
                }

                if ($scope.toRemove.length > 0) {
                    let c = [];
                    let a = [];

                    for (let item of $scope.toRemove) {
                        if ($scope.obj.crops.split(',').includes(item)) {
                            c.push(item);
                        }
                        if ($scope.obj.animals.split(',').includes(item)) {
                            a.push(item);
                        }
                    }

                    if ($scope.obj.crops.split(',').length - c.length === 0) {
                        $scope.queueError = true;
                        $scope.clearQueues();
                        return;
                    }

                    if ($scope.obj.type === 'Farm') {
                        if ($scope.obj.animals.split(',').length - a.length === 0) {
                            $scope.queueError = true;
                            $scope.clearQueues();
                            return;
                        }
                    }

                    toChange.remove_farm_items = $scope.toRemove.slice(0);
                    $scope.queueError = false;
                }

                if ($rootScope.currentUser.account_type === 'Admin') {
                    toChange.approved_by_admin = $rootScope.currentUser.username;
                }

                console.log(toChange);
                
                var res = ManagePropertyFactory.updateProperty(toChange, function() {
                    $scope.success = true;
                    $scope.otherErrors = null;
                    $scope.queueError = false;

                    $scope.toAdd = [];
                    $scope.toRemove = [];

                    $scope.toChange = toChange;
                    delete $scope.toChange["property_id"];
                    delete $scope.toChange["username"];

                    loadProperty();
                }, function(err) {
                    $scope.success = false;
                    $scope.otherErrors = err;

                    $scope.toAdd = [];
                    $scope.toRemove = [];
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

    $scope.back = function() {
        if ($rootScope.currentUser.account_type === 'Admin') {
            $state.go('admin_view_properties', { propertyId: null, is_confirmed: $stateParams.referrer });
        } else {
            $state.go('owned_properties');
        }
    }

    $scope.deleteProperty = function(id) {
        $http({ method: 'DELETE', url: '/api/properties/' + id}).then(function success(res) {
            console.log('Deleted property ' + id);
            $scope.propertyDeleteSuccess = true;
            $scope.propertyDeleteFailure = false;

            $scope.back();
        }, function error() {
            $scope.propertyDeleteSuccess = false;
            $scope.propertyDeleteFailure = true;
        });
    }

});
