const express = require("express");
const router = express.Router();
const Artist = require("../models/artist");
const Rating = require("../models/rating");
const User = require("../models/user");
const middleware = require("../middleware");
const request = require('request-promise');

router.get('/', (req, res) => {
    res.render("sponsors/index");
});

module.exports = router;