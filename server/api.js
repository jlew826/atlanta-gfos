const express       =   require('express'),
      bodyParser    =   require('body-parser'),
      db            =   require('./database.js'),
      crypto        =   require('crypto'),
      config        =   require('../config.js'),
      api           =   express();

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: true}));

/**
    Attempt to login with email and password
*/
api.post('/api/users/login', function(req, res) {
    // Get users with provided emails
    db.select('*', 'USER', { email: req.body.email }).then(function(users) {
        // If no users match the email, user does not exist
        if(typeof users == "undefined" || users.length == 0) {
            res.status(403).send("No user with email " + req.body.email);
            return;
        }
        // Otherwise, hash password and compare with stored one
        let hash = crypto.createHash('sha256');
        hash.update(req.body.password);
        if(users[0].password == hash.digest('base64')) {
            res.status(200).send({
                username: users[0].username,
                email: users[0].email,
                account_type: users[0].account_type
            });
        }
        else {
            res.status(403).send("Incorrect password");
        }
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Register visitor
*/
api.post('/api/visitors', function(req, res) {
    createUser(req.body, 'Visitor').then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Register user, along with its property and its farm items and link everything
*/
api.post('/api/owners', function(req, res) {
    // Create user first
    createUser(req.body.owner, 'Owner').then(function(result) {
        // Then create property
        createProperty(req.body.property, req.body.owner.username).then(function(prop_result) {
            res.status(200).send("Success");
        }).catch(function(err) {
            res.status(500).send(err);
        });
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get a list of properties with specified filters
*/
api.get('/api/properties', function(req, res) {
    let filter = {};
    for(let attr in req.query) {
        if(req.query.hasOwnProperty(attr)) {
            if(attr == "confirmed") {
                filter["approved_by_admin"] = (req.query[attr] == "true" ? "not null" : "null");
            }
            else if(attr == "public") {
                filter["is_public"] = (req.query[attr] == 'true' ? 1 : 0);
            }
            else if(attr == "commercial") {
                filter["is_commercial"] = (req.query[attr] == 'true' ? 1 : 0);
            }
            else {
                filter[attr] = req.query[attr];
            }
        }
    }
    db.select(`
                name,
                property_id,
                CAST(is_commercial AS UNSIGNED) AS is_commercial,
                CAST(is_public AS UNSIGNED) AS is_public,
                approved_by_admin,
                size,
                owner_id,
                st_address,
                city,
                zip,
                type
              `,
              'PROPERTY',
              filter
    ).then(function(properties) {
        res.status(200).send(properties);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get property with specified id
*/
api.get('/api/properties/:propid', function(req, res) {
    db.select(`
                name,
                property_id,
                CAST(is_commercial AS UNSIGNED) AS is_commercial,
                CAST(is_public AS UNSIGNED) AS is_public,
                approved_by_admin,
                size,
                owner_id,
                st_address,
                city,
                zip,
                type
              `,
              'PROPERTY',
              { property_id: parseInt(req.params.propid) }
    ).then(function(properties) {
        res.status(200).send(properties[0]);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get farm items, optionally filter by status
*/
api.get('/api/farm_items', function(req, res) {
    let filter = {};
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter.status = (req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all animals, optionally filter by status
*/
api.get('/api/animals', function(req, res) {
    let filter = { type: 'Animal' };
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter.status = (req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all crops, optionally filter by status
*/
api.get('/api/crops', function(req, res) {
    let filter = `type = 'Fruit' OR type = 'Nut' OR type = 'Vegetable' OR type = 'Flower'`;
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter = `(${filter}) AND status = ${req.query['confirmed'] == 'true' ? 1 : 0}`;
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get orchard crops, optionally filter by status
*/
api.get('/api/crops/orchard', function(req, res) {
    let filter = `type = 'Fruit' OR type = 'Nut'`;
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter = `(${filter}) AND status = ${req.query['confirmed'] == 'true' ? 1 : 0}`;
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get garden crops, optionally filter by status
*/
api.get('/api/crops/garden', function(req, res) {
    let filter = `type = 'Vegetable' OR type = 'Flower'`;
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter = `(${filter}) AND status = ${req.query['confirmed'] == 'true' ? 1 : 0}`;
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all fruits, optionally filter by status
*/
api.get('/api/crops/fruits', function(req, res) {
    let filter = { type: 'Fruit' };
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter.status = (req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all nuts, optionally filter by status
*/
api.get('/api/crops/nuts', function(req, res) {
    let filter = { type: 'Nut' };
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter.status = (req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all vegetables, optionally filter by status
*/
api.get('/api/crops/vegetables', function(req, res) {
    let filter = { type: 'Vegetable' };
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter.status = (req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all flowers, optionally filter by status
*/
api.get('/api/crops/flowers', function(req, res) {
    let filter = { type: 'Flower' };
    if(typeof req.query['confirmed'] !== 'undefined') {
        filter.status = (req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.select(`name, CAST(status AS UNSIGNED) AS status, type`, 'FARM_ITEM', filter).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Request a new animal
*/
api.post('/api/animals', function(req, res) {
    db.select('*', 'USER', { username: req.body.username }).then(function(users) {
        let status = 0;
        if(typeof users !== 'undefined' && users.length > 0 && users[0].account_type == 'Admin') {
            status = 1;
        }
        db.insert('FARM_ITEM', ['name', 'status', 'type'], [req.body.name, status, 'Animal']).then(function(result) {
            res.status(200).send("Success");
        }).catch(function(err) {
            res.status(500).send(err);
        });
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Request a new crop
*/
api.post('/api/crops', function(req, res) {
    db.select('*', 'USER', { username: req.body.username }).then(function(users) {
        let status = 0;
        if(typeof users !== 'undefined' && users.length > 0 && users[0].account_type == 'Admin') {
            status = 1;
        }
        db.insert('FARM_ITEM', ['name', 'status', 'type'], [req.body.name, status, req.body.type]).then(function(result) {
            res.status(200).send("Success");
        }).catch(function(err) {
            res.status(500).send(err);
        });
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Validate crop or animal
*/
api.put('/api/farm_items/:id', function(req, res) {
    db.select('*', 'USER', {username: req.body.username }).then(function(users) {
        if(typeof users !== 'undefined' && users.length > 0 && users[0].account_type == 'Admin') {
            db.update('FARM_ITEM', ['status'], [1], { name: req.params.id }).then(function(result) {
                res.status(200).send("Success");
            }).catch(function(err) {
                res.status(500).send(err);
            });
        }
        else {
            res.status(403).send("Unauthorized action");
        }
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Log visit to property
*/
api.post('/api/properties/:id/visits', function(req, res) {
    db.insert('VISITS', ['visitor_id', 'property_id', 'score', 'date_added'],
                        [req.body.username, parseInt(req.params.id), req.body.score, new Date()]).then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Remove logged visit from property
*/
api.delete('/api/properties/:id/visits', function(req, res) {
    db.remove('VISITS', { visitor_id: req.body.username, property_id: parseInt(req.params.id) }).then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all properties that a visitor has visited
*/
api.get('/api/visitors/:id/visits', function(req, res) {
    db.select(['p.name', 'v.score', 'v.date_added'],
              [`PROPERTY p NATURAL JOIN (SELECT * FROM VISITS WHERE visitor_id = '${req.params.id}') v`]
             ).then(function(visits) {
        res.status(200).send(visits);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

api.listen(config.api.port);
console.log(`Server running on ${config.api.url}:${config.api.port}`);

/**
    Create user based on args (username, email, password) and account type
*/
function createUser(args, type) {
    return new Promise(function(resolve, reject) {
        db.select('*', 'USER', `username = '${args.username}' OR email = '${args.email}'`).then(function(users) {
            if(typeof users != "undefined" && users.length > 0) {
                reject("User with the given email or username already exists");
                return;
            }
            if(args.password.length < 8) {
                reject("Password must be at least 8 characters long");
                return;
            }
            let hash = crypto.createHash('sha256');
            db.insert('USER', ['username', 'email', 'password', 'account_type'], [args.username, args.email, hash.digest('base64'), type]).then(function(result) {
                resolve(result);
                return;
            }).catch(function(err) {
                reject(err);
                return;
            });
        }).catch(function(err) {
            reject(err);
            return;
        });
    });
}

/**
    Create new property with args (name, is_commercial, is_public, size, st_address, city, zip, type, [animal], crop) and owner id, and create its farm items and link them
*/
function createProperty(args, ownerid) {
    return new Promise(function(resolve, reject) {
        db.insert('PROPERTY', ['name', 'is_commercial', 'is_public', 'approved_by_admin', 'size', 'owner_id', 'st_address', 'city', 'zip', 'type'],
                              [args.name, args.is_commercial, args.is_public, null, args.size, ownerid, args.st_address, args.city, args.zip, args.type])
        .then(function(result) {
            db.select('property_id', 'PROPERTY', { name: args.name }).then(function(properties) {
                if(args.type == "Farm") {
                    // Check if farm animal exists and create it if it doesn't
                    db.select('*', 'FARM_ITEM', { name: args.animal }).then(function(farmitems) {
                        if(typeof farmitems == "undefined" || farmitems.length == 0) {
                            // Animal doesn't exist, create it
                            createFarmItem(args.animal, "Animal").then(function(result) {
                                // Link animal with property
                                addFarmItemToProperty(args.animal, properties[0].property_id).then(function(result) {
                                    resolve(result);
                                }).catch(function(err) {
                                    reject(err);
                                    return;
                                });
                            }).catch(function(err) {
                                reject(err);
                                return;
                            });
                        }
                        else {
                            // Link animal with property
                            addFarmItemToProperty(args.animal, properties[0].property_id).then(function(result) {
                                resolve(result);
                            }).catch(function(err) {
                                reject(err);
                                return;
                            });
                        }
                    }).catch(function(err) {
                        reject(err);
                        return;
                    });
                }
                // Check that Orchards only grow fruits and nuts
                else if(args.type == "Orchard" && (args.crop.type == "Vegetable" || args.crop.type == "Flower")) {
                    reject("Orchards can only grow Fruits and Nuts");
                    return;
                }
                // Check that Gardens only grow vegetables and flowers
                else if(args.type == "Garden" && (args.crop.type == "Fruit" || args.crop.type == "Nut")) {
                    reject("Gardens can only grow Vegetables and Flowers");
                    return;
                }
                // By this point the crop specified is valid for the property specified; create crop and link to property
                // Check if crop exists
                db.select('*', 'FARM_ITEM', { name: args.crop.name }).then(function(farmitems) {
                    if(typeof farmitems == "undefined" || farmitems.length == 0) {
                        // Crop doesn't exist, create it
                        createFarmItem(args.crop.name, args.crop.type).then(function(result) {
                            // Link crop with property
                            addFarmItemToProperty(args.crop.name, properties[0].property_id).then(function(result) {
                                resolve(result);
                            }).catch(function(err) {
                                reject(err);
                            });
                        }).catch(function(err) {
                            reject(err);
                        });
                    }
                    else {
                        // Link crop with property
                        addFarmItemToProperty(args.crop.name, propid).then(function(result) {
                            resolve(result);
                        }).catch(function(err) {
                            reject(err);
                        });
                    }
                }).catch(function(err) {
                    reject(err);
                    return;
                });
            }).catch(function(err) {
                reject(err);
                return;
            });
        }).catch(function(err) {
            reject(err);
            return;
        });
    });
}

/**
    Create farm item from name and type
*/
function createFarmItem(name, type) {
    return db.insert('FARM_ITEM', ['name', 'status', 'type'], [name, 0, type]);
}

/**
    Link farm item and property given the name and id
*/
function addFarmItemToProperty(farmItem, propertyId) {
    return db.insert('GROWS_RAISES', ['property_id', 'farm_item_name'], [propertyId, farmItem]);
}