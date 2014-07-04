/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (!window.DIATONIC)
    window.DIATONIC = {close: 0, open: 1};

if (!window.DIATONIC.midi) 
    window.DIATONIC.midi = {baseduration: 1920 }; // nice and divisible, equals 1 whole note

DIATONIC.midi.Player = function(map, playButton, options ) {

    this.map = map;
    this.playLink = playButton;
    
    this.reset( options );
};

DIATONIC.midi.Player.prototype.reset = function(options) {
    
    options = options || {};
    
    this.i = 0;
    this.tempo = 60;
    this.playing = false;
    this.playlist = []; // contains {time:t,funct:f} pairs
    this.ticksperinterval = DIATONIC.midi.baseduration / 16; // 16th note - TODO: see the min in the piece
    this.currenttime = 0;
    this.currentMeasure = 1;
    this.currentAndamento = 1;
    
};

DIATONIC.midi.Player.prototype.adjustAndamento = function() {
    if(this.currentAndamento > 0.25 ) {
        this.currentAndamento = this.currentAndamento/2;
    } else {
        this.currentAndamento = 1;
    }    
};

DIATONIC.midi.Player.prototype.doPlay = function() {
    while (this.playlist[this.i] &&
           this.playlist[this.i].time < this.currenttime) {
        this.playlist[this.i].funct();
        this.i++;
    }
    if (this.playlist[this.i]) {
        this.currenttime += this.ticksperinterval;
    } else {
        this.stopPlay();
    }
};

DIATONIC.midi.Player.prototype.startPlay = function(what) {

    if(this.playing) return;
    
    this.playlist = what.notes;
    this.tempo  = what.tempo;
    this.printer = what.printer;
    this.map.ypos = 1000;

    this.playing = true;
    this.playLink.title = DR.resource["DR_pause"][DR.language];
    this.playLink.innerHTML = '&nbsp;<i class="icon-pause"></i>&nbsp;';
  
    var self = this;
    this.doPlay();
    this.playinterval = window.setInterval(function() { self.doPlay(); }, 60000/this.tempo);
};

DIATONIC.midi.Player.prototype.stopPlay = function() {
    this.i = 0;
    this.currenttime = 0;
    this.pausePlay();
    this.playLink.title = DR.resource["playBtn"][DR.language];
    this.playLink.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
    this.printer.clearSelection();
    this.map.gaita.clearKeyboard(true);
};

DIATONIC.midi.Player.prototype.pausePlay = function() {
    MIDI.stopAllNotes();
    window.clearInterval(this.playinterval);
    this.playLink.title = DR.resource["playBtn"][DR.language];
    this.playLink.innerHTML = '&nbsp;<i class="icon-play"></i>&nbsp;';
    this.playing = false;
    this.map.ypos = 1000;
};

DIATONIC.midi.Player.prototype.playMeasure = function() {
    var started = false;
    while(this.i < this.playlist.length && !( started && this.playlist[this.i].barNumber ) ) {
        started = true;
        if(this.playlist[this.i].barNumber) {
            this.currentMeasure = this.playlist[this.i].barNumber;
            document.getElementById("gotoMeasureBtn").value = this.currentMeasure;
        }
        this.playlist[this.i].funct();
        this.i++;
    }
    this.t = this.playlist[this.i].time;
};

DIATONIC.midi.Player.prototype.doDidaticPlay = function(criteria) {
    while (this.playlist[this.i] && (this.playlist[this.i].time*(1/this.currentAndamento)) < this.currenttime && criteria() ) {
        if(this.playlist[this.i].barNumber) {
            this.currentMeasure = this.playlist[this.i].barNumber;
            document.getElementById("gotoMeasureBtn").value = this.currentMeasure;
        }
        if(!criteria()) {
            continue;
        }
        this.playlist[this.i].funct();
        this.i++;
    }
    if (this.playlist[this.i] && criteria() ) {
        //this.currenttime += this.ticksperinterval;
    } else {
        this.pauseDidaticPlay();
    }
    // não pode ser exatamente assim: no caso de step by step, 
    //sempre é necessario avancar o tempo, 
    //nos outros casos não
    // - acertar isso
    this.currenttime += this.ticksperinterval; 
};

DIATONIC.midi.Player.prototype.pauseDidaticPlay = function() {
    MIDI.stopAllNotes();
    window.clearInterval(this.didaticPlayinterval);
    this.playing = false;
    this.map.ypos = 1000;
};

DIATONIC.midi.Player.prototype.startDidaticPlay = function(what, type) {

    if(this.playing) return;
    
    this.playlist = what.notes;
    this.tempo  = what.tempo;
    this.printer = what.printer;
    this.map.ypos = 1000;

    this.playing = true;
    
    var curr = this.currentMeasure;
    var that = this;
    
    switch( type ) {
        case 'note': // step-by-step
            var criteria = function () { 
                return (that.playlist[that.i].time*(1/that.currentAndamento)) < that.currenttime;
            };
            break;
        case 'measure': // play-measure
            var criteria = function () { 
                return curr === that.currentMeasure;
            };
            break;
    }
  
    this.doDidaticPlay(criteria);
    this.didaticPlayinterval = window.setInterval(function() { that.doDidaticPlay(criteria); }, 60000/this.tempo);
};



DIATONIC.midi.Player.prototype.doDebugPlay = function(container) {
    var that = this;
    this.pressed = false;
    while(this.i < this.playlist.length && this.t >= (this.playlist[this.i].time*(1/this.currentAndamento))) {
        if(this.playlist[this.i].barNumber) {
            this.currentMeasure = this.playlist[this.i].barNumber;
            document.getElementById("gotoMeasureBtn").value = this.currentMeasure;
        }
        this.playlist[this.i].funct();
        this.i++;
    }
    this.t = this.playlist[this.i].time;
    setTimeout(that.waitForIt(container),1);
};


DIATONIC.midi.Player.prototype.startDebugPlay = function(what,container) {
    
    var that = this;
    
    if(!this.playing){
      this.key = '';
      this.pressed = false;
      this.i = 0;
      this.t = 0;
      this.playing = true;
      this.playlist = what.notes;
      this.tempo  = what.tempo;
      this.printer = what.printer;
    }
    
    //container.addEventListener('keydown', that.keydownHandler, false);
    //container.addEventListener('mousedown', that.mousedownHandler, false);
    this.doDebugPlay(container);
};

DIATONIC.midi.Player.prototype.keydownHandler = function (e) {
  this.pressed = true;
  this.key = e.keyCode;
};

DIATONIC.midi.Player.prototype.mousedownHandler = function () {
  this.key = 'mousedown';
  this.pressed = true;
};

DIATONIC.midi.Player.prototype.waitForIt = function(container) {
  var that = this;
  if (!this.pressed && this.key !== 27 ) {
    setTimeout(that.waitForIt,1);
  } else {
    if(this.key !== 27 && this.i < this.playlist.length) {
      this.doDebugPlay(); 
    } else {
        //console.log('saindo');
        this.playing = false;
        // unregister your handler method for the keydown event
        //container.removeEventListener('keydown', that.keydownHandler, false);
        //container.removeEventListener('mousedown', that.mousedownHandler, false);
    }
  }
};
