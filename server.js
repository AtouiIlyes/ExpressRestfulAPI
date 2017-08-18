/**
 * Created by atoui on 31/07/2017.
 */
// server.js
// BASE SETUP
// =============================================================================
// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/news');
var conn = mongoose.connection;
var Actualite = require('./app/models/actualite');
var Contact = require('./app/models/contact');
var Page = require('./app/models/page');
var Menu = require('./app/models/menu');


//require multer for the file uploads
var multer = require('multer');
var path;

// set the directory for the uploads to the uploaded to
var DIR = './public/assets';
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, DIR)
    },
    filename: function (req, file, cb) {
        console.log(file.mimetype); //Will return something like: image/jpeg
        extArray = file.mimetype.split("/");
        extension = extArray[extArray.length - 1];
        name = file.fieldname;
        date = Date.now();
        cb(null, file.fieldname + '-' + date + '.' + extension)
    }
})

var upload = multer({storage: storage}).single('photo');
//define the type of upload multer would be doing and pass in its destination, in our case, its a single file with the name photo


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


/// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');

    next(); // make sure we go to the next routes and don't stop here
});
app.use('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization ,Origin, X-Requested-With, Accept");
    res.header("Access-Control-Allow-Credentials", true);


    next();
});

app.use(express.static('public'));

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

router.route('/menus')

    // create a actualite (accessed at POST http://localhost:8080/api/actualites)
    .post(function (req, res) {
        console.log(req.body.page);
        var menu = new Menu();      // create a new instance of the contact model
        menu.title = req.body.title;  // set the contact title (comes from the request)
        menu.archived = false;
        menu.position = 0;  // set the contact text (comes from the request)
        menu.page = req.body.page;


        //save the contact and check for errors
        menu.save(function (err) {
            if (err) {
                console.log(err);
                res.send(err);

            }
            else {
                res.json({message: 'Menu created!'});
            }
        });

    })
    // get all the actualites (accessed at GET http://localhost:8080/api/actualites)
    .get(function (req, res) {
        Menu.find(function (err, pages) {
            if (err)
                return res.send(err);
            else
                res.json(pages);
        });
    });
router.route('/menus/:menu_id')

    // get the actualite with that id (accessed at GET http://localhost:8080/api/actualites/:actualite_id)
    .get(function (req, res) {
        Menu.findById(req.params.menu_id, function (err, menu) {
            if (err)
                return res.send(err);
            else
                res.json(menu);
        });
    })

    // update the bear with this id (accessed at PUT http://localhost:8080/api/actualites/:actualite_id)
    .put(function (req, res) {

        // use our actualite model to find the actualite we want
        Menu.findById(req.params.menu_id, function (err, menu) {
            if (err)
                res.send(err);
            else {
                menu.title = req.body.title;  // update the actualites info
                menu.position = req.body.position;  // update the actualites info
                menu.archived = false;
                menu.page = req.body.page;

                // save the actualite
                menu.save(function (err) {
                    if (err)
                        res.send(err);
                    else
                        res.json({message: 'Menu updated!'});
                });
            }
        });
    })
router.route('/menus/archiver/:id')
    .put(function (req, res) {
        console.log(req.params.id);
        // use our actualite model to find the actualite we want
        Menu.findById(req.params.id, function (err, menu) {
            if (err)
                res.send(err);

            else
                menu.archived = true;  // update the actualites info


            // save the actualite
            menu.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Menu archived!'});
            });

        });
    })

// more routes for our API will happen here
router.route('/pageswithoutmenu')

    // get all the actualites (accessed at GET http://localhost:8080/api/actualites)
    .get(function (req, res) {


        Menu.find({}, function (err, menus) {
            var ids = menus.map(function (menu) {
                return menu.page;
            });
            Page.find({_id: {$nin: ids}}, function (err, pages) {
                if (err)
                    return res.send(err);
                else
                    res.json(pages);
            });
        }).select('page');
    });


// more routes for our API will happen here
router.route('/pages')

    // create a actualite (accessed at POST http://localhost:8080/api/actualites)
    .post(function (req, res) {
        var page = new Page();      // create a new instance of the contact model
        page.title = req.body.title;  // set the contact title (comes from the request)
        page.content = req.body.content;  // set the contact text (comes from the request)
        page.alias = req.body.alias;
        page.archived = false;

        //save the contact and check for errors
        page.save(function (err) {
            if (err) {
                console.log(err);
                res.status(500).send('alias must be unique!');
                //res.send(err);

            }
            else {
                res.json({message: 'Page created!'});
            }
        });

    })

    // get all the actualites (accessed at GET http://localhost:8080/api/actualites)
    .get(function (req, res) {
        Page.find(function (err, pages) {
            if (err)
                return res.send(err);
            else
                res.json(pages);
        });
    });
router.route('/pages/:page_id')

    // get the actualite with that id (accessed at GET http://localhost:8080/api/actualites/:actualite_id)
    .get(function (req, res) {
        Page.findById(req.params.page_id, function (err, page) {
            if (err)
                return res.send(err);
            else
                res.json(page);
        });
    })

    // update the bear with this id (accessed at PUT http://localhost:8080/api/actualites/:actualite_id)
    .put(function (req, res) {

        // use our actualite model to find the actualite we want
        Page.findById(req.params.page_id, function (err, page) {
            if (err)
                res.send(err);
            else {
                page.title = req.body.title;  // update the actualites info
                page.alias = req.body.alias;  // update the actualites info
                page.archived = false;
                page.content = req.body.content;

                // save the actualite
                page.save(function (err) {
                    if (err)
                        res.status(500).send('alias must be unique!');
                    else
                        res.json({message: 'Page updated!'});
                });
            }
        });
    })
router.route('/pages/archiver/:id')
    .put(function (req, res) {
        console.log(req.params.id);
        // use our actualite model to find the actualite we want
        Page.findById(req.params.id, function (err, page) {
            if (err)
                res.send(err);

            else
                page.archived = true;  // update the actualites info


            // save the actualite
            page.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Page archived!'});
            });

        });
    })

router.route('/contacts')

    // create a actualite (accessed at POST http://localhost:8080/api/actualites)
    .post(function (req, res) {
        var contact = new Contact();      // create a new instance of the contact model
        contact.name = req.body.name;  // set the contact title (comes from the request)
        contact.email = req.body.email;  // set the contact text (comes from the request)
        contact.subject = req.body.subject;
        contact.message = req.body.message;
        contact.date = Date.now();
        console.log(req.body.name);
        //save the contact and check for errors
        contact.save(function (err) {
            if (err)
                res.send(err);
            else
                res.json({message: 'Contact created!'});
        });

    })

    // get all the actualites (accessed at GET http://localhost:8080/api/actualites)
    .get(function (req, res) {
        Contact.find(function (err, contacts) {
            if (err)
                return res.send(err);

            res.json(contacts);
        });
    });


// on routes that end in /actualites
// ----------------------------------------------------
router.route('/actualites')

    // create a actualite (accessed at POST http://localhost:8080/api/actualites)
    .post(function (req, res) {
        var actualite = new Actualite();      // create a new instance of the actualite model
        actualite.title = req.body.title;  // set the actualite title (comes from the request)
        actualite.textA = req.body.textA;  // set the actualite text (comes from the request)
        actualite.archived = false;
        actualite.featured = req.body.featured;
        actualite.image = 'http://localhost:8080/assets/photo-' + date + '.' + extension;  // set the actualite image (comes from the request)
        //save the actualite and check for errors
        actualite.save(function (err) {
            if (err)
                res.send(err);

            res.json({message: 'Actualite created!'});
        });

    })

    // get all the actualites (accessed at GET http://localhost:8080/api/actualites)
    .get(function (req, res) {
        Actualite.find(function (err, actualites) {
            if (err)
                return res.send(err);

            res.json(actualites);
        });
    });

//our file upload function.
router.route('/actualites/upload')
    .post(function (req, res, next) {
        path = '';
        upload(req, res, function (err) {
            if (err) {
                // An error occurred when uploading
                console.log(err);
                return res.status(422).send("an Error occured")
            }
            else {
                // No error occured.
                path = req.file.path;
                return res.send("Upload Completed for " + path);
            }
        });
    })

router.route('/actualites/archiver/:id')
    .put(function (req, res) {
        console.log(req.params.id);
        // use our actualite model to find the actualite we want
        Actualite.findById(req.params.id, function (err, actualite) {
            if (err)
                res.send(err);


            actualite.archived = true;  // update the actualites info


            // save the actualite
            actualite.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Actualite updated!'});
            });

        });
    })

// on routes that end in /actualites/:actualite_id
// ----------------------------------------------------
router.route('/actualites/:actualite_id')

    // get the actualite with that id (accessed at GET http://localhost:8080/api/actualites/:actualite_id)
    .get(function (req, res) {
        console.log
        Actualite.findById(req.params.actualite_id, function (err, actualite) {
            if (err)
                return res.send(err);
            res.json(actualite);
        });
    })

    // update the bear with this id (accessed at PUT http://localhost:8080/api/actualites/:actualite_id)
    .put(function (req, res) {

        // use our actualite model to find the actualite we want
        Actualite.findById(req.params.actualite_id, function (err, actualite) {
            console.log(req.params.title);
            if (err)
                res.send(err);

            actualite.title = req.body.title;  // update the actualites info
            actualite.textA = req.body.textA;  // update the actualites info
            actualite.archived = false;
            actualite.featured = req.body.featured;
            actualite.image = 'http://localhost:8080/assets/photo-' + date + '.' + extension;  // set the actualite image (comes from the request)

            // save the actualite
            actualite.save(function (err) {
                if (err)
                    res.send(err);
                else
                    res.json({message: 'Actualite updated!'});
            });

        });
    })


    // delete the actualite with this id (accessed at DELETE http://localhost:8080/api/actualites/:actualite_id)
    .delete(function (req, res) {
        Actualite.remove({
            _id: req.params.actualite_id
        }, function (err, actualite) {
            if (err)
                res.send(err);

            res.json({message: 'Successfully deleted'});
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

module.exports = router;
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);