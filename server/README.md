# Backend Service

Issue HTTP requests to the backend service to make changes to the database.

### Documentation
1. [User Login](#user-login)
2. [Visitor Registration](#visitor-registration)
3. [Owner Registration](#owner-registration)


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
        "is_commercial": "1",
        "is_public": "0",
        "size": "20",
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