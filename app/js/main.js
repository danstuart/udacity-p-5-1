/**
 * Udacity - Project 5 - Neighborhood Map
 */
$(document).ready(function() {
    'use strict';
    /** catch any error */
    try {
        /**
         * Knockout viewModel
         * @class viewModel
         */
        var ViewModel = function(Model, mapObject) {
            /**  save the "this" for when the context changes */
            var self = this;
            var map;
            /** array to set the map bounds */
            self.bounds = new google.maps.LatLngBounds();
            /**
             * use one single infowindow object, so that only one
             * infowindow can be open at any given time
             */
            self.infowindow = new google.maps.InfoWindow();
            /**
             * knockouts observables
             */
            /** my main location in London */
            self.mainLocation = ko.observable({
                cat: 'my favorites',
                name: '4 Golden Square',
                address: 'W1F 9HT',
                city: 'london',
                lat: 51.5120157,
                lng: -0.1390551,
                description: 'Our office in London.',
                url: 'https://www.bidvine.com/',
                img: '',
                type: 'my favorites',
                visible: true,
            });
            /** for the FTSE ticker */
            self.ticker = ko.observable('Real Time FTSE Ticker');
            /** to flash the ticker on the HTML page when it's updated */
            ko.bindingHandlers.flash = {
                update: function(element, valueAccessor) {
                    ko.utils.unwrapObservable(valueAccessor());
                    $(element).hide().fadeIn(700);
                }
            };
            /**
             * my favourite locations in London - see file myfavorites.js
             */
            self.myLocations = ko.observableArray(myfavs);
            /** category to search in Foursquare */
            self.searchcategory = 'Coffeeshops with WiFi';
            /** 4square locations */
            self.locations = ko.observableArray();
            /** observable used to implement the search */
            self.query = ko.observable('');
            /** this computed observable is used to implement the search */
            self.computedLocations = ko.computed(function() {
                return ko.utils.arrayFilter(self.locations(), function(entry) {
                    // console.log('inside computed filter >'+self.query()+'< >'+entry.name);
                    return entry.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
                });
            });
            /**
             * get Foursquare data for the category of choice
             */
            var CLIENT_ID = 'SNOQCJIS13MCJ0IWGDEUNKLZGPVY5MQVSPNFF0Z1CXMV5MH2';
            var CLIENT_SECRET = 'Z2PFXOJSYNMAU5XIM41HFD4TKHA0KRICYUPI3W0ZQVZFNPW3';
            var foursquareUrl = 'https://api.foursquare.com/v2/venues/explore?' +
                'client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET +
                '&v=20150101&ll=' + self.mainLocation().lat + ',' + self.mainLocation().lng +
                '&radius=3500' + '&query=' + self.searchcategory;
            // using ajax instead of getJSON (which is a wrapper anyway) so that
            // I can set a timeout
            $.ajax({
                    dataType: 'json',
                    url: foursquareUrl,
                    timeout: 6000
                })
                .fail(function(e) {
                    alert('We are experiencing problems with Foursquare. We apologise for the ' +
                        'inconvenience. Try later.');
                    // console.log("error " + e);
                    /** even if Foursquare API fails, we still have the local data, so show it */
                    pleaseShowTheMarkers();
                })
                .done(function(data) {
                    // console.log(data);
                    // console.log(self.locations());
                    // console.log(data);
                    $.each(data.response.groups['0'].items, function(k, v) {
                        // console.log(v);
                        var loc = {
                            cat: v.venue.categories['0'].name,
                            name: v.venue.name,
                            address: v.venue.location.address,
                            city: v.venue.location.city + ' ' + v.venue.location.country,
                            lat: v.venue.location.lat,
                            lng: v.venue.location.lng,
                            description: '',
                            url: v.venue.url,
                            img: '',
                            type: 'foursquare',
                            visible: true,
                            marker: {},
                        };
                        // console.log(loc);
                        self.locations.push(loc);
                    });
                    pleaseShowTheMarkers();
                    /** use the subscribe to refresh the markers everytime the observable changes */
                    self.computedLocations.subscribe(function(value) {
                        // console.log('computed has changed');
                        // console.log(self.computedLocations());
                        updateMarkers();
                    });
                });
            /**
             * Shows the google map - this is a IIFE so it's executed immediately
             * @function showMap
             */
            var showMap = (function() {
                /** catch errors if any */
                try {
                    self.map = new google.maps.Map(document.getElementById('map-canvas'), {
                        zoom: 15,
                        streetViewControl: false,
                        center: new google.maps.LatLng(self.mainLocation().lat, self.mainLocation().lng),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                } catch (e) {
                    alert('We are experiencing problems with Google Maps. ' +
                        'We apologise for the inconvenience. Try later.');
                }
                /**
                 * event handler for window resize to re-centerand re-fitBounds
                 */
                google.maps.event.addDomListener(window, 'resize', function() {
                    self.map.fitBounds(self.bounds);
                    self.map.setCenter(self.bounds.getCenter());
                });
            })(); // end showMap

            var pleaseShowTheMarkers = function() {
                var showMarker = function(location) {
                    var markergreen = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                    var markerred = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                    var markerpurple = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
                    var mIcon = markerred;
                    var ll = new google.maps.LatLng(
                        location.lat,
                        location.lng
                    );
                    if (location.cat === 'Coffeeshops with WiFi') {
                        mIcon = markerpurple;
                    } else {
                        mIcon = markergreen;
                    }
                    var marker = new google.maps.Marker({
                        map: self.map,
                        animation: google.maps.Animation.DROP,
                        position: ll,
                        title: location.name,
                        icon: mIcon,
                    });
                    location.marker = marker;
                    /** add marker to the bounds */
                    self.bounds.extend(ll);
                    /** prepare the infowindow content: is there a url? */
                    var url = (!location.url) ? '<p>no url</p>' : '<p><a href="' +
                        location.url + '" target="_blank">' + location.url +
                        '</a></p>';
                    /** assemble the infowindow content */
                    var contentString = '<div id="infowindow">' +
                        '<p>' + location.name + '</p>' +
                        '<p>' + location.cat + '</p>' +
                        url + '<p>' + location.description + '</p>' +
                        '</div>';
                    /** create the infowindow */
                    marker.info = new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 274,
                    });
                    /** assign the content to the infowindow */
                    marker.infocontent = contentString;
                    /** hook up this marker with a event handler for click */
                    google.maps.event.addListener(marker, 'click', function() {
                        openInfoWindow(marker, self.map);
                    });
                };
                /** show all my favourites locations' markers */
                $.each(self.myLocations(), function(k, v) {
                    showMarker(v);
                });
                /** show Fourquare locations' markers */
                $.each(self.computedLocations(), function(k, v) {
                    showMarker(v);
                });
                /** fit the map to the markers and center it */
                self.map.fitBounds(self.bounds);
                self.map.setCenter(self.bounds.getCenter());
            }; // end pleaseShowTheMarkers()
            /**
             * handles requests to open a infowindow
             * we use a single infowindow to have max 1 infowindow open at each time
             * make the marker bounce once only
             */
            var openInfoWindow = function(marker, map) {
                self.infowindow.setContent(marker.info.content);
                self.infowindow.open(map, marker);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    marker.setAnimation(null);
                }, 710);
            };
            /**
             * this function updates the markers
             * function @updateMarkers
             */
            var updateMarkers = function() {
                var diff = $(self.locations()).not(self.computedLocations()).get();
                $.each(diff, function(k, v) {
                    if (v.visible) {
                        v.marker.setMap(null);
                        v.visible = false;
                    }
                });
                $.each(self.computedLocations(), function(k, v) {
                    if (v.marker && !v.visible) {
                        v.marker.setMap(self.map);
                        v.visible = true;
                        // we need to change the bounds
                        self.bounds.extend(v.marker.position);
                    }
                });
                self.map.fitBounds(self.bounds);
                self.map.setCenter(self.bounds.getCenter());
            };
            /** this is the event handler for clicks on marker - to open infowindows */
            self.locationClickHandler = function(location) {
                openInfoWindow(location.marker, self.map);
            };
            /**
             * Fetch the FTSE quote in real time from Yahoo using a timer
             * This is a IIFE so that it will be immediately executed the first time the viewModel
             * is executed
             * @function backgroundTask
             */
            var backgroundTask = (function() {
                /**
                 * this function implements the ajax call to fetch data from Yahoo
                 * @function fetchData
                 */
                var fetchData = function() {
                    var url = 'https://query.yahooapis.com/v1/public/yql?' +
                        'q=select%20*%20from%20yahoo.finance.quoteslist%20where%20symbol%3D\'%5EFTSE\'&' +
                        'format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
                    $.ajax({
                            dataType: 'json',
                            type: 'GET',
                            url: url,
                            timeout: 6000,
                        })
                        .fail(function(e) {
                            alert('We are experiencing problems with the Yahoo interface. ' +
                                'We apologise for the inconvenience. ' +
                                'Please try again later');
                        })
                        .done(function(data) {
                            // console.log(data);
                            // console.log(self.map);
                            self.ticker('FTSE: ' + data.query.results.quote.LastTradePriceOnly + ' ' +
                                data.query.results.quote.LastTradeTime);
                            // simulate change using random numbers - when the FTSE index is not changing
                            // self.ticker('FTSE: ' + Math.floor((Math.random() * 10) + 1)*1000000);
                        });
                };
                /** creates a timer to call fetchData every x seconds */
                setInterval(fetchData, 15000);
            })();
        }; // end of the viewModel
        ko.applyBindings(new ViewModel());
    } catch (e) {
        alert('We are experiencing a general problem. We apologise for the inconvenience. ' + e);
    }
});