var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: Schema.ObjectId,
    role: String,
    created: Date,
    storageUsed: Number,
    memberships: [new Schema({
        id: String,
        provider: String,
        token: String,
        email: String,
        name: String
    }, {_id: false})]
}, {_id: false});

module.exports = mongoose.model('User', userSchema);