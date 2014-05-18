var P = (function () {
    function P() {
    }
    P.rint = function (obj, tag) {
        if (tag && this.ermitted.indexOf(tag) == -1)
            return;
        if (P.rototyping)
            console.log(obj);
    };

    P.rintf = function (obj, tag) {
        if (this.ermitted.indexOf(tag) != -1)
            console.log(obj);
    };

    P.roclaim = function (condition, message) {
        if (!condition) {
            throw message || "Assertion failed.";
        }
    };
    P.rototyping = true;
    P.ermitted = [];
    return P;
})();

var Broadcaster = (function () {
    function Broadcaster() {
        this.observers = [];
    }
    Broadcaster.prototype.registerObserver = function (observer) {
        this.observers.push(observer);
    };
    Broadcaster.prototype.removeObserver = function (observer) {
        this.observers.splice(this.observers.indexOf(observer), 1);
    };

    Broadcaster.prototype.notifyObservers = function (arg) {
        this.observers.forEach(function (element, index, array) {
            element.update(arg);
        });
    };
    return Broadcaster;
})();


Array.prototype.forin = function (fn) {
    for (var i = 0; i < this.length; i++) {
        fn(this[i]);
    }
};

Array.prototype.choice = function () {
    return this[Math.floor(Math.random() * this.length)];
};
///<reference path="utils.ts"/>
var Harmonizer = (function () {
    function Harmonizer() {
        //
        // Constants
        //
        this.chord_array = {
            'B': ['BDF', 'EGB', 'GBD'],
            'A': ['ACE', 'DFA', 'FAC'],
            'G': ['GBD', 'CEG', 'EGB'],
            'F': ['FAC', 'BDF', 'DFA'],
            'E': ['EGB', 'ACE', 'CEG'],
            'D': ['DFA', 'GBD', 'BDF'],
            'C': ['CEG', 'FAC', 'ACE']
        };
        this.note_to_value = {
            'B': 11,
            'A#': 10,
            'A': 9,
            'G#': 8,
            'G': 7,
            'F#': 6,
            'F': 5,
            'E': 4,
            'D#': 3,
            'D': 2,
            'C#': 1,
            'C': 0
        };
        this.value_to_note = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        //
        // Variables and arguments
        //
        this.voice_config = [0];
        this.voice_prev = [];
        // - same size as voice config
        this.vtracks = [];
    }
    // - same size as voice config
    Harmonizer.prototype.harmonize = function (note) {
        P.rintf('Preparing to harmonize note' + note, 'Harmonizer.events');

        var octave = note.octave();
        var note_letter = note.letter();

        var chord = this.chord_array[note_letter][Math.floor(Math.random() * this.chord_array[note_letter].length)];
        P.rintf('Chose chord ' + chord + ' for note ' + note_letter, 'Harmonizer.events');

        // Get list of notes. One per voice.
        this.voice_prev = this.best_next_note_set(note, chord, this.voice_prev);

        P.rintf(this.voice_prev, 'Harmonizer.events');
        P.rintf(" - Will append concurrent note values - ", 'Harmonizer.events');

        for (var j = 0; j < this.vtracks.length; j++) {
            //on = midi.NoteOnEvent(tick=e.tick, velocity=e.velocity, pitch=this.voice_prev[j])
            //this.vtracks[j].append(on)
            //P.rintf("Appended note with pitch " + str(this.voice_prev[j]) + " to track " + str(j), 'Harmonizer.events');
        }

        return this.voice_prev;
    };

    Harmonizer.prototype.best_next_note_set = function (note, chord, previous_notes) {
        var RANGE_UP_DOWN = Note.N_PER_8VE / 2;
        var note_set = [];
        var current_note = note.raw_value();

        for (var v = 0; v < this.voice_config.length; v++) {
            // Possilbe notes will be all that match with chord within an octave range
            var possible_notes = [];
            var bottom_range = note.raw_value() + (this.voice_config[v] * Note.N_PER_8VE) - RANGE_UP_DOWN;
            var top_range = note.raw_value() + (this.voice_config[v] * Note.N_PER_8VE) + RANGE_UP_DOWN;

            for (var nv = bottom_range; nv < top_range; nv++) {
                if (chord.indexOf(Note.letterOf(nv)) !== -1) {
                    possible_notes.push(new Note(nv));
                }
            }

            // Got all the good notes. Next steps
            P.rintf("Possible notes for this voice: " + possible_notes, 'Harmonizer.events');

            // 1. Find closest note
            var best_note = possible_notes.choice().raw_value();
            var previous_n = (previous_notes.length > 0) ? previous_notes[v].raw_value() : -1;

            if (previous_n != -1) {
                for (var i = 0; i < previous_notes.length; i++) {
                    var pn = previous_notes[i].raw_value();

                    if (Math.abs(pn - previous_n) < (best_note - previous_n) && pn != current_note) {
                        best_note = pn;
                    }
                }
            }

            P.rintf("Best note for voice " + v + ": " + best_note, 'Harmonizer.events');
            note_set.push(new Note(best_note));
        }

        P.rintf("Chose next set of notes: " + note_set, 'Harmonizer.events');

        return note_set;
    };
    return Harmonizer;
})();

var Note = (function () {
    /*
    *  Constructos and factory methods.
    */
    /**
    * Constructs note from raw MIDI value.
    * @param {number} Raw MIDI value, where 0 is C from the lowest MIDI octave.
    */
    function Note(raw_val) {
        P.roclaim(!isNaN(raw_val), raw_val + " is not a number.");
        this.raw_val = raw_val;
    }
    Note.letterOf = function (raw_val) {
        return Note.letter_scale[(raw_val % Note.N_PER_8VE)];
    };

    /*
    *  Instance methods.
    */
    /**
    * Returns the raw MIDI value for current note instance.
    */
    Note.prototype.raw_value = function () {
        return this.raw_val;
    };

    /**
    * Returns the value of current note instance, relative to current octave.
    * (eg. C => 0, C# => 1, etc.)
    */
    Note.prototype.rel_value = function () {
        return this.raw_val % Note.N_PER_8VE;
    };

    /**
    * Returns the octvae fro current note instance, where 0 is the lowest
    * octave (starting with 0, MIDI value for the lowest C).
    */
    Note.prototype.octave = function () {
        return this.raw_val / Note.N_PER_8VE;
    };

    /**
    * Returns letter value for current note instance.
    * @param {[type]} ) {return Note.letter_scale[(this.raw_val % Note.N_PER_8VE
    */
    Note.prototype.letter = function () {
        return Note.letter_scale[(this.raw_val % Note.N_PER_8VE)];
    };

    /**
    * Returns frequency value for perfect pitch of current note instance.
    */
    Note.prototype.frequency = function () {
        var note_from_middle_c = this.raw_value() - Note.MIDDLE_C_VAL + 9;
        return 440 * Math.pow(2, note_from_middle_c / 12);
    };

    /**
    * Returns string representation of the note, that both contains all necesary
    * information to represent the note (raw MIDI value) and is human readable.
    * @return {string} Representation of the note, in format (LETTER@VALUE) (eg.
    * D@38)
    */
    Note.prototype.toString = function () {
        return "(" + this.letter() + "@" + this.raw_value() + ")";
    };
    Note.N_PER_8VE = 12;
    Note.MIDDLE_C_VAL = 60;
    Note.letter_scale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return Note;
})();
///<reference path="lib/webaudio.d.ts"/>
///<reference path="music.ts"/>
var WebAudioFactory = (function () {
    function WebAudioFactory() {
    }
    WebAudioFactory.check = function () {
        if (typeof AudioContext !== 'undefined') {
            this.sts = 1;
        } else if (typeof webkitAudioContext !== 'undefined') {
            this.sts = 2;
        } else {
            this.sts = 0;
        }
        // Thanks to https://hacks.mozilla.org/2013/02/simplifying-audio-in-the-browser/
        // for the base of this freature detection code.
    };

    WebAudioFactory.audioContext = function () {
        if (this.sts == -1)
            WebAudioFactory.check();
        if (this.sts == 1)
            return new AudioContext();
        if (this.sts == 2)
            return new webkitAudioContext();
        if (this.sts == 0) {
            console.log("Web Audio is not supported by this browser, it seems.");
            return null;
        }
    };

    WebAudioFactory.contextSingleton = function () {
        if (this.sts == -1)
            this.ctx = this.audioContext();
        return this.ctx;
    };

    WebAudioFactory.gainNode = function (context) {
        if (this.sts == -1)
            WebAudioFactory.check();
        if (this.sts == 1)
            return context.createGain();
        if (this.sts == 2)
            return context.createGainNode();
        if (this.sts == 0) {
            console.log("Web Audio is not supported by this browser, it seems.");
            return null;
        }
    };
    WebAudioFactory.sts = -1;
    return WebAudioFactory;
})();

var Instrument = (function () {
    function Instrument(num_osc) {
        this.num_osc = num_osc;
        this.osc_arr = [];
        this.attackTime = .02;
        this.releaseTime = .3;
        this.env = function () {
        };
        this.context = WebAudioFactory.contextSingleton();

        var lowpass_filter = this.context.createBiquadFilter();
        var wave_shaper = this.context.createWaveShaper();
        var panner = this.context.createPanner();
        var compressor = this.context.createDynamicsCompressor();
        var reverb = this.context.createConvolver();

        var master_dry = WebAudioFactory.gainNode(this.context);
        var master_wet = WebAudioFactory.gainNode(this.context);
        this.gain = WebAudioFactory.gainNode(this.context);

        for (var i = num_osc; i > 0; i--) {
            var osc = this.context.createOscillator();
            osc.type = 'sine';
            osc.connect(this.gain);
            this.osc_arr.push(osc);
        }

        this.gain.gain.value = 10;
        this.gain.connect(this.context.destination);

        //panner.connect(master_dry);
        //master_dry.connect(reverb);
        //reverb.connect(compressor);
        //compressor.connect(context.destination);
        /*this.osc1.noteOn(0);
        this.osc2.noteOn(0);*/
        this.osc_arr.forin(function (osc) {
            osc.start(0);
        });

        this.gain.gain.value = 0;

        //this.gain.gain.setValueAtTime(0, this.context.currentTime);
        P.rint('Starting instrument', "Instrument.lifecycle");
    }
    Instrument.prototype.playFreq = function (frequency) {
        //this.gain.gain.value = 1;
        var now = this.context.currentTime;

        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(0, now);
        this.gain.gain.linearRampToValueAtTime(1, now + this.attackTime);
        this.gain.gain.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
        this.osc_arr.forin(function (osc) {
            osc.frequency.value = frequency;
        });
    };

    Instrument.prototype.playNote = function (note) {
        this.playFreq(note.frequency());
    };

    Instrument.prototype.mute = function () {
        this.gain.gain.value = 0;
    };
    return Instrument;
})();

var Maschine = (function () {
    function Maschine() {
        var context = new AudioContext();

        var vco = new VCO(context);
        var vca = new VCA(context);
        var env = new EnvelopeGenerator(context);

        vco.connect(vca);
        vca.connect(context.destination);
        env.apply(vca.amplitude);
    }
    return Maschine;
})();

var EnvelopeGenerator = (function () {
    function EnvelopeGenerator(context) {
        this.context = context;
        this.attackTime = .1;
        this.releaseTime = .1;
    }
    EnvelopeGenerator.prototype.trigger = function () {
        var now = this.context.currentTime;
        this.param.cancelScheduledValues(now);
        this.param.setValueAtTime(0, now);
        this.param.linearRampToValueAtTime(1, now + this.attackTime);
    };

    EnvelopeGenerator.prototype.apply = function (param) {
        this.param = param;
    };
    return EnvelopeGenerator;
})();

var VCO = (function () {
    function VCO(context) {
        this.context = context;
        this.osc = context.createOscillator();
        this.osc.type = 'sawtooth';

        //this.setFrequency(440);
        this.osc.noteOn(0);

        this.output = this.osc;
        this.input = this.osc;
    }
    VCO.prototype.setFrequency = function (freq) {
        this.osc.frequency.setValueAtTime(freq, this.context.currentTime);
    };

    VCO.prototype.connect = function (node) {
        if (node.hasOwnProperty('input')) {
            this.output.connect(node.input);
        } else {
            this.output.connect(node);
        }
    };
    return VCO;
})();

var VCA = (function () {
    function VCA(context) {
        this.gain = context.createGain();
        this.gain.gain.value = 0;
        this.input = this.gain;
        this.output = this.gain;
        this.amplitude = this.gain.gain;
    }
    VCA.prototype.connect = function (node) {
        if (node.hasOwnProperty('input')) {
            this.output.connect(node.input);
        } else {
            this.output.connect(node);
        }
    };
    return VCA;
})();
///<reference path="lib/jquery.d.ts"/>
///<reference path="music.ts"/>
///<reference path="utils.ts"/>
var View = (function () {
    function View(root) {
        this.noteColor = {
            'B': "#e8e8e8",
            'A#': "#e8e8e8",
            'A': "#e8e8e8",
            'G#': "#e8e8e8",
            'G': "#e8e8e8",
            'F#': "#e8e8e8",
            'F': "#e8e8e8",
            'E': "#e8e8e8",
            'D#': "#e8e8e8",
            'D': "#e8e8e8",
            'C#': "#e8e8e8",
            'C': "#e8e8e8"
        };
        this._note = root.find('.note');
        this._dlog = root.find('#log');
        this._status = root.find('#status');
        this._debug = false;
        this._note.html("##");
        var nodes = document.getElementsByClassName("note");

        P.rint("Created view with note element", "View.lifecycle");
        P.rint(this._note, "View.lifecycle");
    }
    View.prototype.notePlayed = function (note) {
        this._note.html(note.letter());
        this.lg(note.toString());
        this._note.css("background-color", this.noteColor[note.letter()]);
    };

    View.prototype.showLog = function (yes) {
        this._debug = yes;
        if (this._debug) {
            //this._note.style.visibility = 'hidden'
            this._note.hide();
        } else {
            this._note.show();

            //this._note.style.visibility = 'visible'
            this._dlog.html('');
        }
    };

    View.prototype.lg = function (message) {
        this._dlog.prepend("<p>" + message + "</p>");
        // TODO: remove last log if > 50;
    };

    View.prototype.setStatus = function (message) {
        this._status.html(message);
    };
    return View;
})();
///<reference path="utils.ts"/>
var Beat = (function () {
    function Beat(bpm) {
        this.bpm = bpm;
        // div = 1/16th, beat = 1/4er, bar = 1, word = 4, verse = 16, song = 64
        this.callbacks = [null, null, null, null, null, null];
        this._counters = [0, 0, 0, 0, 0, 0];
        this.delay = 1 / (bpm / 60000);
        this._counters = [0, 0, 0, 0, 0, 0];
    }
    Beat.prototype.play = function () {
        P.rint("will play", "Beat.lifecycle");
        this.timer = setTimeout(this.tick, this.delay);
    };

    Beat.prototype.tick = function () {
        P.rint('tick' + this.tick + " " + this.delay, "Beat.lifecycle");
        this.timer = setTimeout(this.tick, this.delay);

        //var l = this._counters.length; // Evaluate length only once for max perf.
        //var i = l;
        console.log(this._counters);
        /*while (i > 0) {
        if (++this._counters[l-i] == 4) {
        this._counters[l-(--i)] = 0;
        this.callbacks[l-i]();
        };
        }*/
    };
    return Beat;
})();
///<reference path="music.ts"/>
///<reference path="view.ts"/>
///<reference path="utils.ts"/>
///<reference path="lib/touch.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Controller = (function () {
    function Controller() {
        this.keysdown = new Array(Object.keys(Controller.keyBindings).length);
        this.harmony = [0, 2, 4, 5, 7, 9, 11, 12];
        this.key = 0;
        this.sstate = new SState();
        // For debugging.
        P.rototyping = true;
        P.ermitted = [];

        // Initialize the View & Model
        this.view = new View($("#View"));
        this.model = new Model(107);
        this.model.registerObserver(this);

        P.rint("Created controller with Model", "Controller.lifecycle");
        P.rint(this.model, "Controller.lifecycle");
        P.rint("and view", "Controller.lifecycle");
        P.rint(this.view, "Controller.lifecycle");

        this.setupKeyboardListeners();
        this.setupMotionListeners();
    }
    /**
    * Model has been changed. Updates view accordingly.
    * @param {any} arg Argument send by model upon change.
    */
    Controller.prototype.update = function (arg) {
        // If only the note changed, only update things related to the note.
        // TODO: Could make classes NoteChange, FreqChange, etc. Or single
        // ModelChange class with type attribute being a value member of an
        // Change (NoteChange, FreqChange) enum or a constant string.
        if (arg instanceof Note) {
            this.view.notePlayed(arg);

            // var status : string = 'Consider next: ';
            // this.model.lastHarmony.forEach(function(e) {status = status + e.letter()});
            // this.view.setStatus(status)
            return;
        }
    };

    /**
    * Registers event listeners for keyboard events.
    */
    Controller.prototype.setupKeyboardListeners = function () {
        var self = this;

        // Initialize with no keys pressed.
        this.keysdown.forEach(function (e, i, a) {
            this.keysdown[i] = false;
        });

        // Register Keydown.
        $(document).keydown(function (event) {
            if (event.keyCode == 17)
                self.model.selectedOctave -= 1;
            if (event.keyCode == 18)
                self.model.selectedOctave += 1;

            // Return if it's not a key we care for.
            if (!(event.keyCode in Controller.keyBindings)) {
                return;
            }
            ;

            // Return if already pressed
            if (self.keysdown[Controller.keyBindings[event.keyCode]])
                return;
            self.keysdown[Controller.keyBindings[event.keyCode]] = true;

            // Create note and play it.
            var n = new Note(Controller.keyBindings[event.keyCode] + (self.model.selectedOctave * Note.N_PER_8VE));

            self.model.playNote(n);
        });

        // Register Keyup.
        $(document).keyup(function (event) {
            self.keysdown[Controller.keyBindings[event.keyCode]] = false;
            //self.model.stopNote(n);
        });
    };

    Controller.prototype.setupMotionListeners = function () {
        var self = this;

        // Register touchstart.
        document.addEventListener('touchstart', function (e) {
            var n = new Note(self.harmony[Math.floor(self.sstate.beta / 13)] + (self.model.selectedOctave * Note.N_PER_8VE));

            self.model.playNote(n);
        }, false);

        // Register touchend.
        document.addEventListener('touchend', function (e) {
            e.preventDefault();
            var touch = e.touches[0];
            //alert(touch.pageX + " - " + touch.pageY);
            //gain.gain.value = 0;
            //osc1.frequency.value = freq_from_note(keyBindings[97]);
            //osc2.frequency.value = freq_from_note(keyBindings[97]);
            //console.log(gain.gain.value)
            //init();
        }, false);

        // Register device orientation change.
        window.addEventListener("deviceorientation", function (e) {
            var absolute = e.absolute;
            self.sstate.alpha = e.alpha;
            self.sstate.beta = e.beta;
            self.sstate.gamma = e.gamma;

            //dlog(harmony[Math.floor(e.beta/13)] + " - " + e.beta);
            self.view.notePlayed(new Note(self.harmony[Math.floor(self.sstate.beta / 13)] + (self.model.selectedOctave * Note.N_PER_8VE)));
        }, true);
    };
    Controller.keyBindings = {
        65: 0,
        87: 1,
        83: 2,
        69: 3,
        68: 4,
        70: 5,
        84: 6,
        71: 7,
        89: 8,
        72: 9,
        85: 10,
        74: 11,
        75: 12,
        79: 13,
        76: 14,
        80: 15,
        186: 16,
        222: 17
    };
    return Controller;
})();

/**
* Instance is a Music Model. Represents the state of the entire music
* environment, including BPM, notes played ?? and whatnot.
*/
var Model = (function (_super) {
    __extends(Model, _super);
    function Model(bpm) {
        _super.call(this);

        // Initialize the beats.
        this.setBPM(bpm);

        // Initialize the harmonizer.
        this.harmonizer = new Harmonizer();

        // this.harmonizer.harmonize(new Note(64));
        // Instruments and notes plz.
        this.instr = new Instrument(1);

        // this.prevNote = new Note(60);
        this.selectedOctave = 3;
    }
    /**
    * Plays a note in current instrument. Notifies note played to observers.
    * @param {Note} note Note to play
    */
    Model.prototype.playNote = function (note) {
        this.instr.playNote(note);
        this.prevNote = note;

        // this.lastHarmony = this.harmonizer.harmonize(note);
        this.notifyObservers(note);
    };

    Model.prototype.stopNote = function (note) {
    };

    //
    // Environment
    //
    /**
    * Sets value for environment bpm.
    * @param {number} bpm New bpm value.
    */
    Model.prototype.setBPM = function (bpm) {
        this.bpm = bpm;
        this.delay = 1 / (this.bpm / 60000);
    };

    /**
    * Returns value for current BPM in environment.
    */
    Model.prototype.getBPM = function () {
        return this.bpm;
    };

    //
    // Autoplay
    //
    /**
    * Starts autoplaying timer, playing a note on each beat,
    * according to BPM.
    */
    Model.prototype.autoPlay = function () {
        this.timer = setTimeout(this.playNext, this.delay);
    };

    /**
    * Plays next note in autoplaying loop.
    */
    Model.prototype.playNext = function () {
        P.rintf("prevnote: ", "Model.autoplay");
        P.rintf(this.prevNote, "Model.autoplay");

        var newNote = this.harmonizer.harmonize(this.prevNote)[0];
        this.instr.playNote(newNote);

        this.prevNote = newNote;

        P.rintf('Next note.', "Model.autoplay");
        this.timer = setTimeout(this.playNext, this.delay);
    };
    return Model;
})(Broadcaster);

var SState = (function () {
    function SState() {
    }
    return SState;
})();

document.addEventListener('touchstart', function (e) {
    var c = WebAudioFactory.contextSingleton();
    var o = c.createOscillator();
    var g = WebAudioFactory.gainNode(c);

    o.connect(g);
    g.connect(c.destination);
    g.gain.value = 0;
    o.frequency.value = 440;
    o.start(0);
});

var app = new Controller();
