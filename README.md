# Udacity Frontend Web Dev Nanodegree - P5-1 - Neighborhood map
## My London Map (my favourites from my TS days and coffee shops with WiFi + a cheeky FTSE index updated in real time)
### by Daniel Stuart

###### To execute locally
    git clone git@github.com:danstuart/udacity-p-5-1.git
    cd udacity-p-5-1/
    gulp serve
(this will launch automatically your default browser)
Using Google Chrome, open http://localhost:3000

###### Testing if the yahoo API update is working
Use this page to cross-check: https://uk.finance.yahoo.com/q?s=%5EFTSE

###### Flashing the FTSE index field when it's updated
Source: http://jsfiddle.net/rniemeyer/s3QTU/
I wanted to use a pure knockoutjs solution by changing the css directly via knockoutjs at the view model and view level. In the end, its jquery on the DOM directly. Boo.

###### Using GULP
List of tasks
- 'jshint'
- 'jscs'
- 'serve'
- 'minify-js'
- 'minify-html'
- 'minify-css'
- 'build': minify the javascript, the html and css and places the minified files in /dist, dist/js and dist/css

In order to use gulp you will need to download all the required modules:
gulp-load-plugins')();
gulp-concat
browser-sync
del
gulp
gulp-jscs
gulp-jshint
gulp-notify
psi
var reload = browserSync.reload;
gulp-rename
run-sequence
gulp-size
gulp-uglify
gulp-minify-html
gulp-minify-css

To load the modules execute:
    npm install

Phew! done.
