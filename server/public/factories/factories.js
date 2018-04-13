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

app.factory('RegisterFactory', function($resource) {
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

    return $resource('/api/owners', {}, {
		registerOwner: {
			method: 'POST',
			params: {
                username: '@username',
                email: '@email',
                password: '@password'
            }
		}
	});
});

app.factory('PropertyFactory', function($resource) {
    //View confirmed properties
    return $resource('/api/properties/confirmed', {}, {
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

app.factory('PropertyDetailFactory', function($resource) {
    //get specific property
    return $resource('/api/properties/:property_id/', {}, {
		getPropertyById: {
			method: 'GET',
            params: { property_id: '@property_id'}
		}
	});
});
