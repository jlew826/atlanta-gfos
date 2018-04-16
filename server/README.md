# Backend Service

Issue HTTP requests to the backend service to make changes to the database.

### Notes
 - All endpoints return with status 200 if everything was successful, status 403 if there was an error unrelated to the server (incorrect password/bad input), and status 500 for all other server-related errors
 - Whenever a response message is not required (insert/update/delete operations), expect to see 'Success', or an error message
 - All endpoints which return data that is searchable and sortable can be requested with optional arguments in the query string:
   - for filters, include the argument filter=column:value. Values can be an exact value or a range, specified as lowerbound-upperbound. If one of the bounds of the range is ommitted, filter will be applied according to other bound. For example, `filter=avg_rating:2.0-2.5` will filter by average ratings between 2.0 and 2.5, `filter=avg_rating:-2.5` will filter by average ratings below 2.5 and `filter=avg_rating=1.0-` will filter by average ratings above 1.0. Ratings can be used for all columns with numerical values.
   - for sorting use the argument sortby=column:dir. For example, to sort alphabetically, use `sortby=name,asc`; to sort in reverse alphabetic order use `sortby=name,desc`, etc
   - you can combine filters and sorting, for example: `/api/owners/user123/other_properties?filter=rating:1.5-2.5&sortby=name,desc`

### Endpoints
1. [User Login](#user-login)
2. [Visitor Registration](#visitor-registration)
3. [Owner Registration](#owner-registration)
4. [Get Owner's Properties](#get-owners-properties)
5. [Get Other Owners' Properties](#get-other-owners-properties)
6. [Get Property by PropertyID](#get-property-by-propertyid)
7. [Farm Items Getters](#farm-items-getters)
8. [Add new property](#add-new-property)
9. [Modify property](#modify-property)
10. [Request New Animal](#request-new-animal)
11. [Request New Crop](#request-new-crop)
12. [Get a list of all users](#get-a-list-of-all-users)
13. [Get a list of all visitors](#get-a-list-of-all-visitors)
14. [Get a list of all owners](#get-a-list-of-all-owners)
15. [View confirmed properties](#view-confirmed-properties)
16. [View unconfirmed properties](#view-unconfirmed-properties)
17. [View approved farm items](#view-approved-farm-items)
18. [View pending farm items](#view-pending-farm-items)
19. [Validate Farm Item](#validate-farm-item)
20. [Delete user](#delete-user)
21. [Remove a visitor's history log](#remove-a-visitors-history-log)
22. [Get all public confirmed properties](#get-all-public-confirmed-properties)
23. [Get Properties Visited by a Visitor](#get-properties-visited-by-a-visitor)
24. [Visitor's view of a property](#visitors-view-of-a-property)
25. [Log Visit to Property](#log-visit-to-property)
26. [Remove Logged Visit from Property](#remove-logged-visit-from-property)
27. [Delete property](#delete-property)


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
        "crop": "Tomato"
    }
}
```
Response:
```
Success
```

### Get Owner's Properties
Request:
```
GET /api/owners/user123/own_properties?filter=rating:1.5-2.5&sortby=name,desc
```
Response:
```
[
    {
        "name": "Propname",
        "owner_id": "user123",
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

### Get Other Owners' Properties
Request:
```
GET /api/owners/user123/other_properties?filter=rating:1.5-2.5&sortby=name,desc
```
Response:
```
[
    {
        "name": "Propname",
        "owner_id": "owner123",
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
        "owner_id": "owner456",
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
GET /api/properties/00003
```
Response:
```
{
    "name": "Georgia Tech Orchard",
    "username": "orchardowner",
    "email": "orchardOwen@myspace.com",
    "num_visits": 0,
    "st_address": "Spring Street SW",
    "city": "Atlanta",
    "zip": "30308",
    "size": 1,
    "avg_rating": null,
    "type": "Orchard",
    "is_public": 1,
    "is_commercial": 0,
    "property_id": 3,
    "crops": "Apple,Peach,Peanut",
    "animals": null
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
- `/api/crops/vegetables` - get all vegetables
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

### Add new property
Request:
```
POST /api/properties
{
    "owner_id": "user123",
    "name": "Propname",
    "is_commercial": 1,
    "is_public": 0,
    "size": 20,
    "st_address": "123 Street bld.",
    "city": "Towncity",
    "zip": "90210",
    "type": "Farm",
    "animal": "Pig",
    "crop": "Tomato"
}
```
Response:
```
Success
```

### Modify property
Request:
```
PUT /api/properties/00003
{
    "username": "owner123",
    "size": 30,
    "add_farm_items": ["Tomato", "Pig"],
    "remove_farm_items": ["Potato"]
}
```
Response:
```
Success
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

### View confirmed properties
Request:
```
GET /api/properties/confirmed?filter=avg_rating:1.5-2.3&sortby=name,desc
```
Response:
```
[
    {
        "name": "Kenari Company Farm",
        "st_address": "100 Hightower Road",
        "city": "Roswell",
        "zip": "30076",
        "size": 3,
        "type": "Farm",
        "is_public": 1,
        "is_commercial": 1,
        "property_id": 5,
        "owner_id": "farmowner",
        "approved_by_admin": "ceo",
        "avg_rating": 2.6667
    },
    {
        "name": "Georgia Tech Garden",
        "st_address": "Spring Street SW",
        "city": "Atlanta",
        "zip": "30308",
        "size": 1,
        "type": "Garden",
        "is_public": 1,
        "is_commercial": 0,
        "property_id": 2,
        "owner_id": "orchardowner",
        "approved_by_admin": "admin2",
        "avg_rating": 2.5
    }
]
```

### View unconfirmed properties
Request:
```
GET /api/properties/unconfirmed?filter=avg_rating:1.5-2.3&sortby=name,desc
```
Response:
```
[
    {
        "name": "Woodstock Community Garden",
        "st_address": "1804 Bouldercrest Road",
        "city": "Woodstock",
        "zip": "30188",
        "size": 5,
        "type": "Garden",
        "is_public": 1,
        "is_commercial": 0,
        "property_id": 4,
        "owner_id": "gardenowner"
    },
    {
        "name": "East Lake Urban Farm",
        "st_address": "2nd Avenue",
        "city": "Atlanta",
        "zip": "30317",
        "size": 20,
        "type": "Farm",
        "is_public": 0,
        "is_commercial": 1,
        "property_id": 13,
        "owner_id": "farmowner"
    }
]
```

### View approved farm items
Request:
```
GET /api/farm_items/approved?sortby=type
```
Response:
```
[
    {
        "name": "Almond",
        "type": "Nut"
    },
    {
        "name": "Apple",
        "type": "Fruit"
    }
]
```

### View pending farm items
Request:
```
GET /api/farm_items/pending?sortby=type
```
Response:
```
[
    {
        "name": "Carrot",
        "type": "Vegetable"
    },
    {
        "name": "Cheetah",
        "type": "Animal"
    }
]
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

### Delete user
Request:
```
DELETE /api/users/user1234
```
Response:
```
Success
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

### Get all public confirmed properties
Request:
```
GET /api/visitors/properties?filter=avg_rating:2.0-2.6
```
Response:
```
[
    {
        "name": "Georgia Tech Garden",
        "st_address": "Spring Street SW",
        "city": "Atlanta",
        "zip": "30308",
        "size": 1,
        "type": "Garden",
        "is_public": 1,
        "is_commercial": 0,
        "property_id": 2,
        "num_visits": 2,
        "avg_rating": 2.5
    },
    {
        "name": "Kenari Company Farm",
        "st_address": "100 Hightower Road",
        "city": "Roswell",
        "zip": "30076",
        "size": 3,
        "type": "Farm",
        "is_public": 1,
        "is_commercial": 1,
        "property_id": 5,
        "num_visits": 1,
        "avg_rating": 2
    }
]
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
        "name": "Georgia Tech Garden",
        "date_added": "2017-10-24T04:00:00.000Z",
        "score": 1
    }
]
```

### Visitor's view of a property
Request:
```
GET /api/visitors/user123/properties/00001
```
Response:
```
{
    "name": "Georgia Tech Garden",
    "username": "orchardowner",
    "email": "orchardOwen@myspace.com",
    "num_visits": 2,
    "st_address": "Spring Street SW",
    "city": "Atlanta",
    "zip": "30308",
    "size": 1,
    "avg_rating": 2.5,
    "type": "Garden",
    "is_public": 1,
    "is_commercial": 0,
    "property_id": 2,
    "crops": "Peas,Peruvian Lily,Rose",
    "animals": null,
    "is_visited": 1
}
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

### Delete property
Request:
```
DELETE /api/properties/00001
```
Response:
```
Success
```
