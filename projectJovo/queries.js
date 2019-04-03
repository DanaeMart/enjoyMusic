//File for all the queries with the database


var firebase = require("firebase");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {

    


/* setAnswerCounter: function(answerId,answersCounter){
  firebase.auth();
  var db= firebase.database();
  var ref = db.ref("masterSheet");
  var usersRef = ref.child(answerId);
  usersRef.update({
      answersCounter: answersCounter,
    });
}, */




  getSongs:function() {
    var songsObj = new Object();

    var songsArray = [songsObj];
    firebase.auth();
    var db = firebase.database();
    var ref = db.ref("masterSheet");

   /*  ref.once('value')
    .then(function (snap) {
    console.log('snap.val()', snap.val());
    });
 */
    ref.orderByKey().on("value", function(snap) {
    snap.forEach(function(data) {
    //console.log(snap.val());
    songsObj = new Object();
    songsObj.id=data.val().id;
    songsObj.author=data.val().author;
    songsObj.genre=data.val().genre;
    songsObj.imageLink=data.val().imageLink;
    songsObj.link=data.val().link;
    songsObj.lyrics=data.val().lyrics;
    songsObj.title=data.val().title;


    songsArray.push(songsObj);
    });
  });
  
    //var queryParameters = {orderBy:"module", equalTo: module};
    //var data = ref.getData("", queryParameters);
    
                
  return songsArray;  
   
  },

  getCorrect: function(userID, callback){
    firebase.auth();

    var db = firebase.database();
    var ref = db.ref("userSheet");
    var correct;
    var total;
    ref.orderByKey().equalTo(userID).on("value", function(snap) {
      snap.forEach(function(data) {
        correct = data.val().correct
        total = data.val().total
        console.log("Total en funcion: "+total)

      })      

    });
    callback({correct:correct,total:total});

/*     return {      
      correct:correct,
      total:total
    }; */
  },

  setCorrect:function(userID,correct,total){
    firebase.auth();
    var db = firebase.database();
    var ref = db.ref("userSheet");
    var usersRef = ref.child(userID);
    usersRef.update({
      correct:correct,
      total:total
    });

  }

  }
  

  
