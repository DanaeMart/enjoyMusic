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
   
  }
  

  
}