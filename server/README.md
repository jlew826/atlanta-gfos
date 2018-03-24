# Backend Service

Issue HTTP requests to the backend service to make changes to the database.

### Endpoints
1. [User Login](#user-login)
2. [Visitor Registration](#visitor-registration)
3. [Owner Registration](#owner-registration)
4. [Get Properties by Filter](#get-properties-by-filter)
5. [Get Property by PropertyID](#get-property-by-propertyid)
6. [Farm Items Getters](#farm-items-getters)
7. [Request New Animal](#request-new-animal)
8. [Request New Crop](#request-new-crop)
9. [Validate Farm Item](#validate-farm-item)
10. [Log Visit to Property](#log-visit-to-property)
11. [Remove Logged Visit from Property](#remove-logged-visit-from-property)
12. [Get Properties Visited by a Visitor](#get-properties-visited-by-a-visitor)
13. [Remove a visitor's history log](#remove-a-visitors-history-log)
14. [Get a list of all users](#get-a-list-of-all-users)
15. [Get a list of all visitors](#get-a-list-of-all-visitors)
16. [Get a list of all owners](#get-a-list-of-all-owners)
17. [Get info on one user](#get-info-on-one-user)
18. [Delete user](#delete-user)
19. [Delete property](#delete-property)


### User Login
Request:
```
POST /api/users/login
{
    "username": "user123",
    "password": "supersecret"
}
```
Response:
```
{
    "username": "user123",
    "email": "user123@email.com",
    "account_type": "Visitor"
}
```

### Visitor Registration
Request:
```
POST /api/visitors
{
    "username": "user123",
    "email": "user123@email.com",
    "password": "supersecret"
}
```
Response:
```
Success
```

### Owner Registration
Request:
```
POST /api/owners
{
    "owner": {
        "username": "user123",
        "email": "user123@email.com",
        "password": "supersecret"
    },
    "property": {
        "name": "Propname",
        "is_commercial": 1,
        "is_public": 0,
        "size": 20,
        "st_address": "123 Street bld.",
        "city": "Towncity",
        "zip": "90210",
        "type": "Farm",
        "animal": "Pig",
        "crop": {
            "name": "Tomato",
            "type": "Fruit"
        }
    }
}
```
Response:
```
Success
```

### Get Properties by Filter
Request:
```
GET /api/properties?owner_id=user123&confirmed=true&public=true&commercial=true
```
Response:
```
[
    {
        "name": "Propname",
        "st_address": "123 Street bld.",
        "city": "Towncity",
        "zip": "90210",
        "size": 20,
        "type": "Farm",
        "is_commercial": 1,
        "is_public": 1,
        "property_id": 1,
        "num_visits": 3,
        "avg_rating": 3.5
    },
    {
        "name": "Propname2",
        "owner_id": "user123",
        "st_address": "456 Boulevard st.",
        "city": "Citytown",
        "zip": "12345",
        "size": 50,
        "type": "Orchard",
        "is_commercial": 1,
        "is_public": 1,
        "property_id": 2,
        "num_visits": 1,
        "avg_rating": 4
    }
]
```

### Get Property by PropertyID
Request:
```
GET /api/properties/00001
```
Response:
```
{
    "name": "Propname",
    "username": "owner123",
    "email": "owner123@email.com",
    "num_visits": 3,
    "st_address": "123 Street bld.",
    "city": "Towncity",
    "zip": "90210",
    "size": 20,
    "avg_rating": 3.5,
    "type": "Farm",
    "is_public": 1,
    "is_commercial": 1,
    "property_id": 1
}
```

### Farm Items Getters
Send a `GET` request to any of the following paths to get the relevant types of crops:
- `/api/animals` - get all animals
- `/api/crops` - get all crops
- `/api/crops/orchard` - get all fruits and nuts
- `/api/crops/garden` - get all vegetables and flowers
- `/api/crops/fruits` - get all fruits
- `/api/crops/nuts` - get all nuts
- `/api/crops/vetetables` - get all vegetables
- `/api/crops/flowers` - get all flowers  
Optionally, you can include a filter for status.  
Request:
```
GET /api/crops?confirmed=true
```
Response:
```
[
    {
        "name": "Tomato",
        "status": 1,
        "type": "Fruit"
    },
    {
        "name": "Cucumber",
        "status": 1,
        "type": "Vegetable"
    }
]
```

### Request New Animal
Request:
```
POST /api/animals
{
    "name": "Pig",
    "username": "owner123"
}
```
Response:
```
Success
```

### Request New Crop
Request:
```
POST /api/crops
{
    "name": "Potato",
    "type": "Vegetable",
    "username": "admin1"
}
```
Response:
```
Success
```

### Validate Farm Item
Request:
```
PUT /api/farm_items/Potato
{
    "username": "admin1"
}
```
Response:
```
Success
```

### Log Visit to Property
Request:
```
POST /api/properties/00001/visits
{
    "username": "visitor1",
    "score": 3
}
```
Response:
```
Success
```

### Remove Logged Visit from Property
Request:
```
DELETE /api/properties/00001/visits
{
    "username": "visitor1"
}
```
Response:
```
Success
```

### Get Properties Visited by a Visitor
Request:
```
GET /api/visitors/user123/visits
```
Response:
```
[
    {
        "name": "Propname1",
        "score": 3,
        "date": "2018-03-24T04:00:00.000Z"
    },
    {
        "name": "Propname2",
        "score": 5,
        "date": "2018-03-24T04:00:00.000Z"
    }
]
```

### Remove a visitor's history log
Request:
```
DELETE /api/visitors/user123/visits
```
Response:
```
Success
```

### Get a list of all users
Request:
```
GET /api/users
```
Response:
```
[
    {
        "username": "user123",
        "email": "user123@email.com",
        "account_type": "Visitor"
    },
    {
        "username": "owner123",
        "email": "owner123@email.com",
        "account_type": "Owner"
    }
]
```

### Get a list of all visitors
Request:
```
GET /api/visitors
```
Response:
```
[
    {
        "username": "user123",
        "email": "user123@email.com",
        "logged_visits": 2
    }
]
```

### Get a list of all owners
Request:
```
GET /api/owners
```
Response:
```
[
    {
        "username": "owner123",
        "email": "owner123@email.com",
        "num_properties": 3
    }
]
```

### Get info on one user
Request:
```
GET /api/users/user1234
```
Response:
```
{
    "username": "user1234",
    "email": "user1234@email.com",
    "account_type": "Owner"
}
```

### Delete user
Request:
```
DELETE /api/users/user1234
```
Response:
```
Success
```

### Delete property
Request:
```
DELETE /api/properties/00001
```
Response:
```
Success
```