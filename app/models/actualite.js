/**
 * Created by atoui on 31/07/2017.
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ActualiteSchema   = new Schema({
    title: String,
    textA : String,
    archived : Boolean,
    featured : Boolean,
    image: String
    
});

module.exports = mongoose.model('Actualite', ActualiteSchema);
