/**
 * Created by atoui on 15/08/2017.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ContactSchema   = new Schema({
    name: String,
    email : String,
    subject : String,
    message: String,
    date: Date

});

module.exports = mongoose.model('Contact', ContactSchema);
