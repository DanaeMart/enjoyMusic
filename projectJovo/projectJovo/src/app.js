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
var EXIT_PROMPT = [
    'Hope to see you soon, goodbye!',
    'Hope you enjoyed', 
    'Come back to learn more!'
]

var HELP_PROMPT = [
    'What do you want me to explain?',
    'What is your problem?',
    'How can I help you'
]

queries.getSongs(function(songsArrayIn){
    songsArray=songsArrayIn;
})

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

app.setHandler({

    'ExitIntent': function(){
        let randomNumber = Math.floor(Math.random()*(EXIT_PROMPT.length));
        this.tell(EXIT_PROMPT[randomNumber]);


    },



    LAUNCH() {
        this.ask('Hello World! What\'s your name?', 'Please tell me your name.');
        songsArray= queries.getSongs();
        if(this.$user.$data.userName==null){

            console.log('No tiene nombre');
            let speech = "Welcome to enjoy music for the first time! Can you give me your name?";
            let reprompt = "Give me your name please";
            this.followUpState('NameState').ask(speech,reprompt);

        }else{
            let speech = 'Hello '+this.$user.$data.userName+', which game mode do you want to play: guessMode, learnMode or asdfMode?'
            let reprompt = 'which game mode do you want to play?'
            this.followUpState('ModeState').ask(speech, reprompt);

        }


    },


    'NameState' : {
        MyNameIsIntent() {
            this.$user.$data.userName = this.$inputs.name.value;
            let speech = 'Hello '+this.$user.$data.userName+', which game mode do you want to play: guess, learn or asdf?'
            let reprompt = 'which game mode do you want to play?'
            this.removeState().followUpState('ModeState').ask(speech, reprompt);
        },
    },

    'ModeState': {
        'AnswerIntent':function(){
            this.setSessionAttribute('mode',this.$inputs.answer.value);
            this.toIntent('GameMode');
        },
        'GameMode': function(){

            console.log();

            if(this.getSessionAttribute('mode')=='guessing'){
                console.log('entra en el guess')
                this.removeState().followUpState('GuessingGame').toIntent('GuessIntent');
            }else{
                console.log("su puta madre"+this.getSessionAttribute('mode'));
            }
    
            
        },

    },

    'GuessingGame': {

        'GuessIntent': function(){
            //let randomNumber = Math.floor(Math.random()*(songsArray.length));
            let randomNumber = Math.floor(Math.random()*(3))+1;

            this.setSessionAttribute('songNumber', randomNumber);
            console.log(randomNumber);
            console.log(songsArray[randomNumber].title)
            this.$googleAction.$audioPlayer.play(
                songsArray[randomNumber].link,
                'method', 
                {
                  "icon": {
                    "url": songsArray[randomNumber].link,

                    }
                }
            );
            this.$googleAction.showSuggestionChips(['Chip 1', 'Chip 2']);
            randomNumber = Math.floor(Math.random()*(2));

            if (randomNumber==0){
                this.setSessionAttribute('asked', 'author');
                
                this.followUpState('GuessingGame').ask('Who is the author of the song?');
                
            }else{
                this.setSessionAttribute('asked', 'song');

                this.followUpState('GuessingGame').ask('What is the name of the song?');
            }
        },

        'AnswerIntent':function(){
            if(this.getSessionAttribute('asked')=='author'){
                console.log(songsArray[this.getSessionAttribute('songNumber')].author.toLowerCase())
                console.log(this.$inputs.answer.value.toLowerCase())

                if(songsArray[this.getSessionAttribute('songNumber')].author.toLowerCase()==this.$inputs.answer.value.toLowerCase()){
                    this.tell('correct')
                }else{
                    this.tell('incorrect')

                }
            }else if(this.getSessionAttribute('asked')=='song'){

                console.log(songsArray[this.getSessionAttribute('songNumber')].title.toLowerCase())
                console.log(this.$inputs.answer.value.toLowerCase())

                if(songsArray[this.getSessionAttribute('songNumber')].title.toLowerCase()==this.$inputs.answer.value.toLowerCase()){
                    this.tell('correct')
                }else{
                    this.tell('incorrect')

                }
            }else{
                console.log('no está definido el att de sesión peta')
            }
        }
        
    }
});

module.exports.app = app;
