///<reference path="controller.ts"/>


/* <Hack>
 * Hack so it works on iOS devices. Apparently iOS mutes web
 * audio until there is user input.
 * More info at:
 * http://stackoverflow.com/questions/12517000/no-sound-on-ios-6-web-audio-api
 */

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

/*
 * </Hack>
 */


var app = new Controller();