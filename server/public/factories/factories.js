var app = angular.module('app');

app.factory('LoginFactory', function($resource) {
    return $resource('/api/users/login', {}, {
		login: {
			method: 'POST',
			params: {
                email: '@email',
                password: '@password'
            },
            headers: {
                'Content-Type':'application/json; charset=UTF-8'
            }
		}
	});
});

app.factory('RegisterVisitorFactory', function($resource) {
    return $resource('/api/visitors', {}, {
		registerVisitor: {
			method: 'POST',
			params: {
                username: '@username',
                email: '@email',
                password: '@password'
            }
		}
	});
});

app.factory('RegisterOwnerFactory', function($resource) {
    return $resource('/api/owners', {}, {
        registerOwner: {
			method: 'POST',
			params: {
                owner: {
                    username: '@username',
                    email: '@email',
                    password: '@password'
                },
                property: {
                    name: '@name',
                    is_commercial: '@is_commercial',
                    is_public: '@is_public',
                    st_address: '@st_address',
                    city: '@city',
                    size: '@size',
                    zip: '@zip',
                    type: '@type',
                    animal: '@animal',
                    crop: '@crop'
                }
            }
		}
	});
});

app.factory('PropertyFactory', function($resource) {
    //View public, confirmed properties
    return $resource('/api/visitors/properties', {}, {
		getConfirmedProperties: {
			method: 'GET',
            isArray: true
		}
	});

    //get specific property
    return $resource('/api/properties/:property_id/', {}, {
		getPropertyById: {
			method: 'GET',
            params: { property_id: '@property_id'}
		}
	});
});

//visitor's view
app.factory('PropertyDetailFactory', function($resource) {
    //get visitor view of specific property
    return $resource('/api/visitors/:visitor_id/properties/:property_id', {}, {
		getVisitorViewOfProperty: {
			method: 'GET',
            params: {
                visitor_id: '@visitor_id',
                property_id: '@property_id'
            }
		}
	});
});

app.factory('VisitLoggerFactory', function($resource) {
    return $resource('/api/properties/:property_id/visits', {}, {
		logVisit: {
			method: 'POST',
			params: {
                username: '@username',
                score: '@score',
                property_id: '@property_id'
            }
		},

        unlogVisit: {
			method: 'DELETE',
			params: {
                username: '@username',
                property_id: '@property_id'
            },
            hasBody: true,
            headers: {"Content-Type": "application/json;charset=UTF-8"}
		}
	});
});

app.factory('VisitHistoryFactory', function($resource) {
    //get visitor view of specific property
    return $resource('/api/visitors/:username/visits', {}, {
		getVisitHistory: {
			method: 'GET',
            params: {
                username: '@username'
            },
            isArray: true
		}
	});
});

app.factory('FarmItemFactory', function($resource) {
    return {
        animals: $resource('/api/animals', {}, {
            getAnimals: {
    			method: 'GET',
                isArray: true
    		}
    	}),
        crops: $resource('/api/crops', {}, {
    		getCrops: {
    			method: 'GET',
                isArray: true
    		}
    	})
    }
});

app.factory('OwnedPropertyFactory', function($resource) {
    return $resource('/api/owners/:owner_id/own_properties', {}, {
		getProperties: {
			method: 'GET',
            isArray: true
		}
	});
});

app.factory('OwnerSinglePropertyFactory', function($resource) {
    //get specific property
    return $resource('/api/properties/:property_id/', {}, {
		getPropertyById: {
			method: 'GET'
		}
	});
});

app.factory('ManagePropertyFactory', function($resource) {
    return $resource('/api/properties/:property_id', {}, {
        updateProperty: {
			method: 'PUT',
			params: {
                add_farm_items: '@add_farm_items',
                username: '@username',
                remove_farm_items: '@remove_farm_items',
                size: '@size',
                is_public: '@is_public',
                is_commercial: '@is_commercial',
                name: '@name',
                st_address: '@st_address',
                city: '@city',
                zip: '@zip',
                property_id: '@property_id'
            }
		}
	});
});

app.factory('RequestFarmItemFactory', function($resource) {
    return {
        animals: $resource('/api/animals', {}, {
            requestAnimal: {
    			method: 'POST',
                params: {
                    name: '@name',
                    username: '@username'
                }
    		}
    	}),
        crops: $resource('/api/crops', {}, {
    		requestCrop: {
    			method: 'POST',
                params: {
                    name: '@name',
                    type: '@type',
                    username: '@username'
                }
    		}
    	})
    }
});

app.factory('OwnerAddPropertyFactory', function($resource) {
    return $resource('/api/properties', {}, {
        addProperty: {
			method: 'POST',
			params: {
                name: '@name',
                is_commercial: '@is_commercial',
                is_public: '@is_public',
                st_address: '@st_address',
                city: '@city',
                zip: '@zip',
                type: '@type',
                animal: '@animal',
                crop: '@crop',
                owner_id: '@owner_id'
            }
		}
	});
});
