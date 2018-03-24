# Backend Service

Issue HTTP requests to the backend service to make changes to the database.

### Documentation
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
        "property_id": 1,
        "is_commercial": 1,
        "is_public": 1,
        "approved_by_admin": "admin1",
        "size": 20,
        "owner_id": "user123",
        "st_address": "123 Street bld.",
        "city": "Towncity",
        "zip": "90210",
        "type": "Farm"
    },
    {
        "name": "Propname2",
        "property_id": 2,
        "is_commercial": 1,
        "is_public": 1,
        "approved_by_admin": "admin1",
        "size": 50,
        "owner_id": "user123",
        "st_address": "456 Boulevard st.",
        "city": "Citytown",
        "zip": "12345",
        "type": "Orchard"
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
    "property_id": 1,
    "is_commercial": 1,
    "is_public": 1,
    "approved_by_admin": "admin1",
    "size": 20,
    "owner_id": "user123",
    "st_address": "123 Street bld.",
    "city": "Towncity",
    "zip": "90210",
    "type": "Farm"
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
GET /api/visitors/:id/visits
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