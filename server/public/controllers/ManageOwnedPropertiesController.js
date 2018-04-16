angular.module('app').controller('ManageOwnedPropertiesCtrl', function($scope, $rootScope, OwnerSinglePropertyFactory,
    ManagePropertyFactory, $state, $stateParams, FarmItemFactory) {
    $scope.obj = {};
    $scope.ca = {};

    $scope.animalOptions = null;
    $scope.cropOptions = null;
    $scope.isPublicOptions = [true, false];
    $scope.isCommercialOptions = [true, false];

    $scope.confirmErrors = false;
    $scope.nullErrors = false;
    $scope.otherErrors = null;
    $scope.success = false;

    $scope.toAdd = [];
    $scope.toRemove = [];

    $scope.farmItemOptions = [];

    function loadProperty() {
        var currentProperty = OwnerSinglePropertyFactory.getPropertyById({
            property_id: $stateParams.propertyId
        }, function(data) {
            data.is_public = data.is_public == true;
            data.is_commercial = data.is_commercial == true;
            $scope.origProperty = JSON.parse(JSON.stringify(data));
            $scope.obj = JSON.parse(JSON.stringify(data));
            console.log($scope.obj);
        })
    }

    loadProperty();
    FarmItemFactory.animals.getAnimals({}, function(data) {
        if (data) {
            $scope.animalOptions = data;
            for (var a of data) {
                $scope.farmItemOptions.push(a);
            }
        }
    });

    FarmItemFactory.crops.getCrops({}, function(data) {
        if (data) {
            console.log(data);
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
                    if ($scope.obj[key] !== $scope.origProperty[key]) {
                        toChange[key] = $scope.obj[key];
                    }
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

    $scope.clearQueues = function() {
        $scope.toAdd = [];
        $scope.toRemove = [];
    }

});
