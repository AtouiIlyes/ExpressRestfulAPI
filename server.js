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

//require multer for the file uploads
var multer = require('multer');
var path ;

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
         name=file.fieldname;
        date=Date.now();
        cb(null, file.fieldname + '-' + date+'.'+extension )
    }
})

var upload = multer({ storage: storage }).single('photo');
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

// more routes for our API will happen here

// on routes that end in /actualites
// ----------------------------------------------------
router.route('/actualites')

    // create a actualite (accessed at POST http://localhost:8080/api/actualites)
    .post(function (req, res) {
        var actualite = new Actualite();      // create a new instance of the actualite model
        actualite.title = req.body.title;  // set the actualite title (comes from the request)
        actualite.textA = req.body.textA;  // set the actualite text (comes from the request)
        actualite.archived = false;
        actualite.image = 'http://localhost:8080/assets/photo-'+date+'.'+extension;  // set the actualite image (comes from the request)
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
    .post( function (req, res, next) {
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
            actualite.image = 'http://localhost:8080/assets/photo-'+date+'.'+extension;  // set the actualite image (comes from the request)

            // save the actualite
            actualite.save(function (err) {
                if (err)
                    res.send(err);

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