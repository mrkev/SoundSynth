SoundSynth
==========

Started this as a project for CS 1610. A simple sound syhtesizer. Works on desktop using the keys, and mobile using the accelerometer. 

##Usage

###Running

0. Make sure you have the typescript compiler installed: `npm install typescript`

1. `npm install` to download and install Gulp + plugins. 

2. `gulp` to compile all typescript code.

3. Get some headphones, or your roomate might get mad (proved by experimentation).

4. Open `index.html` in a browser. 

5. Play using the keyboard or tilting the device on mobile.

###Playing

 - `A` is a *C*, `W` is a *C#*,  `S` is a *D*, etc. 
 - `ctl` lowers an octave, `alt` raises an octave. 
 - On mobile, tap to play a note. The note played will depend upon the pitch (*ha!*) of the device. 7 notes can be played. A device flat on the ground is a *C*. A device standing up (pointing up) is a B. The notes availalbe are those in the C major scale (no sharps can be played on mobile).

###Editing

1. `gulp watch` to watch all typescript files, and compile them automatically on save.

2. Code away.

------------

*Shout out to [Gulp](http://gulpjs.com) because it's the greatest thing since sliced bread.*