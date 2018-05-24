const mongoose = require('mongoose');

var ratingSchema = mongoose.Schema({
    score: {type: Number, possibleValues: [1,2,3,4,5]},
    reviewer: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    },
    comment: String, 
    artist: String,
    artist_name: String,
    genre: String,
    reviewed: {
      type: Date,
      default: Date.now
   }
});
module.exports = mongoose.model("Rating", ratingSchema);