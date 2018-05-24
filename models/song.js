const mongoose = require('mongoose');

var songSchema = mongoose.Schema({
    artist: String,
    title: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Song", songSchema);

