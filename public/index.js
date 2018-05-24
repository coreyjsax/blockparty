

function getRatings(){
            var totalScore;
            fetch('https://block-party-coreyjsax.c9users.io/api/artists/<%= artist.id %>/ratings')
            .then(function(res){
              return res.json()
            }).then(
                function(data) {
                  var score = 0;
                  for (var i = 0; i < data.length; i++) {
                   score += data[i].score;
                }
                score = score/data.length;
                score = (Math.round(score*5)/5).toFixed(2);
                var test = document.querySelector("#badge<%= artist.id %>");
                if(isNaN(score) == false){
                test.innerText = score;
                } 
            }).catch(function(err){
              console.log(err)
            });
          }



