var mongoose = require("mongoose");
var Artist = require("./models/artist");
var Rating = require("./models/rating");

var data = [
    {
        name: "U.S. Girls",
        hometown: "Toronto",
        genre: "Pop",
        description: "Meg Remy is a narrative savant and her glorious, danceable new album is a righteous collection of razor-sharp songs, full of spit and fury, a high-water mark for political pop music.",
        video: "https://www.youtube.com/embed/XtGb5NiGBjc"
    },
    {
        name: "Against All Logic",
        hometown: "NYC",
        genre: "Electronic",
        description: "to Jaar’s credit, he hits the dopamine button without bonking you over the head. Not one element is glitzy, but it comes together with such seamless confidence, you can’t help but shake your head and wonder how he pulls it off. It’s with these hidden talents—the quiet dancefloor chops—that Jaar shows how complete a producer he is.",
        video: "https://www.youtube.com/embed/Pg9_pkPXrJw"
    },
    {
        name: "Digable Planets",
        hometown: "Brooklyn, NYC",
        genre: "Hip-Hop/Rap",
        description: "Seconds into any Digable Planets’ song and you’ll hear it: the Afrofuturism of Sun Ra, the unorthodox free jazz of Albert Ayler, the black spirituality of John Coltrane’s A Love Supreme, the spoken-word funk of the Last Poets. Freedom, progressivism, oneness, harmony, and serendipity are the core tenets that would come to define the rap trio and their ideology throughout their career.",
        video: "https://www.youtube.com/embed/DbVTKk3jgXU"
    },
    {
        name: "Car Seat Headrest",
        hometown: "Leesburg, Virginia",
        genre: "Indie",
        description: "Sometimes, drugs are no fun. The rad night you imagined, watching 2001: A Space Odyssey and brushing against the outer boundaries of your consciousness, becomes a six-hour hell of wondering Did I leave the oven on? or Did I look weird when I said that thing to that one person or Do I just think I looked weird but was I probably not that weird despite the person obviously thinking I was? and so on. But I’ve never heard someone sum it up as succinctly as Will Toledo does: “Last Friday, I took acid and mushrooms/I did not transcend, I felt like a walking piece of shit/in a stupid-looking jacket.",
        video: "https://www.youtube.com/embed/tQuzGDOZklw"
    },
     {
        name: "Kamasi Washington",
        hometown: "Los Angeles",
        genre: "Jazz",
        description: "Kamasi Washington displays a tireless ambition with his compositions, performance, and spiritual approach.",
        video: "https://www.youtube.com/embed/eGzin5ceuwk"
    },
     {
        name: "The War on Drugs",
        hometown: "Indie",
        genre: "Philadelphia",
        description: "Granduciel’s work finds its meaning in the totality of its sound, in how writing and arranging and perfecting every detail in the studio is part of building music that carries you with it. His way of understanding the world is to use that sound machine to excavate and explore his interior life and hopefully shape it into something listeners might understand, even when he’s not entirely sure where he’s going.",
        video: "https://www.youtube.com/embed/6-oHBkikDBg"
    },
    {
        name: "Run The Jewels",
        hometown: "Hip-Hop/Rap",
        genre: "Brooklyn NYC, Atlanta",
        description: "Neither were likely to be deemed “political” rappers then, but both were already dissenters and nonconformists; independent artists signed to themselves, free thinkers shooting off at the mouth.",
        video: "https://www.youtube.com/embed/saR7SYa6nAs"
    },
    {
        name: "Olafur Arnalds",
        hometown: "Electronic",
        genre: "Mosfellsbær, Iceland",
        description: "The Icelandic composer who has toured with Sigur Rós delivers an icily beautiful new album that mixes minimalist classical with singer-songwriter material made in collaboration with vocalist Arnór Dan.",
        video: "https://www.youtube.com/embed/wEj7xYyj9n4"
    }
    ];
    
function seedDB(){
    Artist.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("Removed Artists");
        data.forEach(function(seed){
            Artist.create(seed, function(err, artist){
                if(err){
                    console.log(err)
                } else {
                    console.log("added an Artist");
                    Rating.create(
                    {
                       draw: 2,
                       skill: 1,
                       presence: 3,
                       originality: 2
                    }, function(err, rating){
                        if(err){
                            console.log(err);
                        }
                        artist.ratings.push(rating);
                        artist.save();
                        console.log("created rating");
                    });
                }
            });
        });
    });
}

module.exports = seedDB;