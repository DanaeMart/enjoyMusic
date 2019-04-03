'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');
const firebase = require('firebase');
const queries = require('../queries.js');


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
    new FileDb(),
);
var userID;
var correctTotal;
var correct;
var total;
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
        queries.getCorrect(this.$user.getId(),function(correctIn){
            correctTotal=correctIn;           
        })
        correctTotal = queries.getCorrect(this.$user.getId());       
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
    ChooseModeIntent(){
        let speech = 'Sorry, I could not understand you. Which game mode do you want to play: guessMode, learnMode or asdfMode?'
  
        this.followUpState('ModeState').ask(speech);
    },

    'NameState' : {
        AnswerIntent(){
            this.setSessionAttribute('name', this.$inputs.answer.value);
            this.followUpState('NameState').toIntent('MyNameIsIntent');
            console.log('Entra en answer y peta');
        },
        MyNameIsIntent() {

            

            if(this.getSessionAttribute('name')==undefined){

                this.$user.$data.userName = this.$inputs.name.value;
                let speech = 'Hello '+this.$user.$data.userName+', which game mode do you want to play: guess, learn or asdf?'
                let reprompt = 'which game mode do you want to play?'
                this.removeState().followUpState('ModeState').ask(speech, reprompt);
            }else{
                this.$user.$data.userName = this.getSessionAttribute('name');

                let speech = 'Hello '+this.getSessionAttribute('name')+', which game mode do you want to play: guess, learn or asdf?'
                let reprompt = 'which game mode do you want to play?'
                this.removeState().followUpState('ModeState').ask(speech, reprompt);
            }
        },
        Unhandle(){
            this.tell('Sorry, I could not understand you');
            this.removeState().toIntent('LAUNCH');
        }

    },
    'ModeState': {

        GuessRedirect(){
            this.setSessionAttribute('mode', 'guess');
           
            this.followUpState('GuessingGame').toIntent('GuessIntent');
        },

        LearnRedirect(){
            this.setSessionAttribute('mode', 'learn');
            correct = correctTotal.correct;
            total = correctTotal.total;
            console.log("Corect, my name is: "+correct);
            console.log("Total, mi name is "+total);
            this.setSessionAttribute('correct', correct); 
            this.setSessionAttribute('total', total);
            this.followUpState('LearnState').toIntent('LearnIntent');
        },

        AsdfRedirect(){
            this.setSessionAttribute('mode', 'asdf');
            correct = correctTotal.correct;
            total = correctTotal.total;
            console.log("Corect, my name is: "+correct);
            console.log("Total, mi name is "+total);
            this.setSessionAttribute('correct', correct); 
            this.setSessionAttribute('total', total);
            this.followUpState('AsdfState').toIntent('AsdfIntent');
        },
        
        AnswerIntent(){
            this.removeState().toIntent('ChooseModeIntent');
        }
        /* 'GameMode': function(){

            console.log();

            if(this.$inputs.mode.value=='guess'){
                console.log('entra en el guess')
                this.setSessionAttribute('mode',this.$inputs.mode.value);
                this.removeState().followUpState('GuessingGame').toIntent('GuessIntent');
            }else{
                console.log("su puta madre"+this.getSessionAttribute('mode'));
            }
    
            
         }, */

    },
    'GuessingGame': {
        'GuessIntent': function(){
            let randomNumber = Math.floor(Math.random()*(songsArray.length-1)+1);            
            //let randomNumber = Math.floor(Math.random()*(3))+1;
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

            correct = correctTotal.correct;
            total = correctTotal.total;
            console.log("Corect, my name is: "+correct);
            console.log("Total, mi name is "+total);
            this.setSessionAttribute('correct', correct); 
            this.setSessionAttribute('total', total);
            if(this.getSessionAttribute('asked')=='author'){
                console.log(songsArray[this.getSessionAttribute('songNumber')].author.toLowerCase())
                console.log(this.$inputs.answer.value.toLowerCase())

                if(songsArray[this.getSessionAttribute('songNumber')].author.toLowerCase()==this.$inputs.answer.value.toLowerCase()){
                    this.setSessionAttribute('correct', this.getSessionAttribute('correct')+1);
                    this.setSessionAttribute('total', this.getSessionAttribute('total')+1);
                    correct = this.getSessionAttribute('correct');
                    total = this.getSessionAttribute('total');
                    userID = this.$user.getId();

                    

                    queries.setCorrect(userID, correct,total)
                    this.tell('correct')
                    if(this.hasScreenInterface!=null){
                        console.log('Ay pues si tiene pantalla')
                        this.$googleAction.showSimpleCard('Title', 'Content');
                        this.$googleAction.showImageCard(songsArray[this.getSessionAttribute('songNumber')].title, 'Author: '+songsArray[this.getSessionAttribute('songNumber')].author, songsArray[this.getSessionAttribute('songNumber')].imageLink);       
                    }else{
                        console.log('Ay pues no tiene pantalla')
                    }                    
                }else{

                    //Ay, pues actualisamos las variables de sesion

                    this.setSessionAttribute('correct', this.getSessionAttribute('correct'));
                    this.setSessionAttribute('total', this.getSessionAttribute('total')+1);
                    correct = this.getSessionAttribute('correct');
                    total = this.getSessionAttribute('total');
                    userID = this.$user.getId();
                    console.log("Correct "+correct);
                    console.log("Total "+total);
                    console.log("ID "+userID);

                    //Ay, pues actualisamos la database

                    queries.setCorrect(userID, correct,total);

                    this.tell('incorrect')
                    if(this.hasScreenInterface!=null){
                        console.log('Ay pues si tiene pantalla')                        
                        this.$googleAction.showSimpleCard('Title', 'Content');
                        this.$googleAction.showImageCard(songsArray[this.getSessionAttribute('songNumber')].title, 'Author: '+songsArray[this.getSessionAttribute('songNumber')].author, songsArray[this.getSessionAttribute('songNumber')].imageLink);          
                    }else{
                        console.log('Ay pues no tiene pantalla')
                    }
                }
            }else if(this.getSessionAttribute('asked')=='song'){
                console.log(songsArray[this.getSessionAttribute('songNumber')].title.toLowerCase())
                console.log(this.$inputs.answer.value.toLowerCase())
                if(songsArray[this.getSessionAttribute('songNumber')].title.toLowerCase()==this.$inputs.answer.value.toLowerCase()){
                    
                    this.setSessionAttribute('correct', this.getSessionAttribute('correct')+1);
                    this.setSessionAttribute('total', this.getSessionAttribute('total')+1);
                    correct = this.getSessionAttribute('correct');
                    total = this.getSessionAttribute('total');
                    userID = this.$user.getId();

                    queries.setCorrect(userID, correct,total)

                    this.tell('correct')
                    if(this.hasScreenInterface!=null){
                        this.$googleAction.showSimpleCard('Title', 'Content');
                        this.$googleAction.showImageCard(songsArray[this.getSessionAttribute('songNumber')].title, 'Author: '+songsArray[this.getSessionAttribute('songNumber')].author, songsArray[this.getSessionAttribute('songNumber')].imageLink);           
                    }else{
                        console.log('Ay pues no tiene pantalla')
                    }
                }else{
                    this.setSessionAttribute('correct', this.getSessionAttribute('correct'));
                    this.setSessionAttribute('total', this.getSessionAttribute('total')+1);
                    correct = this.getSessionAttribute('correct');
                    total = this.getSessionAttribute('total');
                    userID = this.$user.getId();
                    console.log("Correct "+correct);
                    console.log("Total "+total);
                    console.log("ID "+userID);
                    queries.setCorrect(userID, correct,total)
                    this.tell('incorrect')
                    if(this.hasScreenInterface!=null){
                        console.log('Ay pues si tiene pantalla')
                        this.$googleAction.showSimpleCard('Title', 'Content');
                        this.$googleAction.showImageCard(songsArray[this.getSessionAttribute('songNumber')].title, 'Author: '+songsArray[this.getSessionAttribute('songNumber')].author, songsArray[this.getSessionAttribute('songNumber')].imageLink);          
                    }else{
                        console.log('Ay pues no tiene pantalla')
                    }
                }
            }else{
                console.log('no está definido el att de sesión peta')
            }
        },
        Unhandle(){
            this.tell('Sorry, I could not understand you');
            this.removeState().followUpState('ModeState').toIntent('GuessRedirect');
        }
    }
});

module.exports.app = app;
