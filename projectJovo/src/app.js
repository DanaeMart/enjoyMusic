'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const firebase = require('firebase');
const queries = require('../queries.js')

var configureapp = {
    authDomain: "enjoymusic-7b351.firebaseapp.com",
    databaseURL: "https://enjoymusic-7b351.firebaseio.com/",
    storageBucket: "enjoymusic-7b351.appspot.com",
    apiKey: "AIzaSyA97B3C8h75I_BJaBfE-ISmHD7l7DZXjzU",
    
  };
  firebase.initializeApp(configureapp);

const app = new App();

app.use(
    new GoogleAssistant(),
    new JovoDebugger(),
    new FileDb()
);

var songsObj = new Object();
var songsArray = [songsObj];
queries.getSongs(function(songsArrayIn){

    songsArray = songsArrayIn;
    console.log('Algo y '+songsArray);

})


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({
    LAUNCH() {
        return this.toIntent('HelloWorldIntent');
        songsArray= queries.getSongs();
    },




    'Play': function(){
      
        this.$googleAction.$audioPlayer.play(
          'https://firebasestorage.googleapis.com/v0/b/enjoymusic-7b351.appspot.com/o/Imagine%20Dragons%20-%20Radioactive.mp3?alt=media&token=44a27dde-3fc6-4da9-86c1-2733f2972b32', 
          'method', 
          {
            //"description": "A definition",
            "icon": {
              "url": "https://firebasestorage.googleapis.com/v0/b/enjoymusic-7b351.appspot.com/o/ImagineDragons.jpeg?alt=media&token=eed54a8f-bbad-4708-ae79-e5bd4014b981",
              //"alt": "Method"
            }
          }
        );
        this.$googleAction.showSuggestionChips(['Chip 1', 'Chip 2']);
        this.ask('Here is the definition');
        },

    HelloWorldIntent() {
        console.log("algo no va bien");
        this.ask('Hello World! What\'s your name?', 'Please tell me your name.');
    },

    MyNameIsIntent() {
        console.log(songsArray[1].title())

        this.tell('Hey ' + this.$inputs.name.value + ', nice to meet yu!');
    },

    GuapoIntent(){

        this.ask('Iñigo, por supuesto');
    },

    ExitIntent(){

        this.ask('Was a pleasure, bye');
        exit();

    }


});

module.exports.app = app;
