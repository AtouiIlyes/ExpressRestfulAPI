/**
 * Created by atoui on 17/08/2017.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MenuSchema   = new Schema({
    title: String,
    position : { type:Number, min:-50 ,max:50},
    page : {type: mongoose.Schema.Types.ObjectId, ref: 'Page'},
    archived : Boolean

});
module.exports = mongoose.model('Menu', MenuSchema);
