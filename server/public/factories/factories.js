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
