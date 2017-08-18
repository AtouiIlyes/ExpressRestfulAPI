/**
 * Created by atoui on 16/08/2017.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PageSchema   = new Schema({
    title: String,
    content : String,
    alias : { type: String, unique: true },
    archived : Boolean



});
module.exports = mongoose.model('Page', PageSchema);
