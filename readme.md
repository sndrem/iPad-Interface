[![Build Status](https://travis-ci.org/sndrem/iPad-Interface.svg?branch=master)](https://travis-ci.org/sndrem/iPad-Interface)

## Bybanetider til bruk på en iPad Mini

Lei av å ikke vite når Bybanen går? Har du i tillegg en Sonos-høyttaler? Hvorfor ikke la Sonos-høyttaleren fortelle deg når neste Bybane-går?

Foreløpig hardkodet for Bybanestoppet ved Brann Stadion, men det er enkelt å skifte til andre stopp eller legge til flere knapper.

Bare endre html-filen index.pug i views-mappen og legg til flere knapper. data-from og data-to må ha verdier hentet fra [skyss.no](http://skyss.no).

For å få lyd via Sonos må du kjøre [sonos node api](https://github.com/jishi/node-sonos-http-api). Jeg kjører det via en raspberry pi.


