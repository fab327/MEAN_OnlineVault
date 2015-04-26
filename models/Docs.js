/**
 * Created by fab on 4/14/2015.
 */

var mongoose = require('mongoose');

var DocSchema = new mongoose.Schema({
    documentType: String,
    title: String,
    content: String,
    websiteName: String,
    websiteUrl: String,
    username:String,
    password:String,
    author: { type: String, ref:'User' }
});

mongoose.model('Doc', DocSchema);