#!/bin/zsh
# Regenerates the voiceover clips with macOS `say`. To use your own recordings instead,
# drop l01.wav … l11.wav (44.1 kHz mono) into vo/ and skip this script.
FF=node_modules/ffmpeg-static/ffmpeg; mkdir -p vo
gen(){ say -v "$2" -r $3 -o vo/$1.aiff "$4" && $FF -y -loglevel error -i vo/$1.aiff -ar 44100 -ac 1 vo/$1.wav && rm vo/$1.aiff; }
gen l01 "Eddy (English (US))" 175 "Okay... you're connected. All done here!"
gen l02 Samantha 170 "And just like that... you're on your own."
gen l03 Samantha 175 "Your internet provider's job ends at that box. It's called the demarc."
gen l04 Samantha 175 "You're paying for five hundred megabits. But the bedroom gets forty. The office buffers through every video call. And the cameras drop out right when you need them."
gen l05 Samantha 175 "Their answer? Rent another box. Add another monthly bill. And you still can't see what's on your network."
gen l06 Samantha 170 "That's where we come in."
gen l07 Samantha 175 "After The Demarc. We start where your I S P stops."
gen l08 Samantha 175 "We test your home from the demarc forward, find what's really slowing you down, and design a network you own. Strong in every room. No rental fees."
gen l09 Samantha 175 "And with a solid foundation, your smart home runs locally. Lights, locks, cameras, and leak alerts that keep working, even when the internet goes down."
gen l10 Samantha 175 "Start with an on-site diagnostic. You get clear results and a written report, with zero pressure to buy anything."
gen l11 Samantha 170 "Your I S P is done. We're just getting started."
