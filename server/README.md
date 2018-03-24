# Backend Service

Issue HTTP requests to the backend service to make changes to the database.

### Documentation
1. [User Login](#user-login)
2. [Visitor Registration](#visitor-registration)
3. [Owner Registration](#owner-registration)
4. [Get Properties by Filter](#get-properties-by-filter)
5. [Get Property by PropertyID](#get-property-by-propertyid)


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