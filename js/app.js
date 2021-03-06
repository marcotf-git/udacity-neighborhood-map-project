// JavaScript Document

$(document).ready(function() {

  /* The main variables are the 'user places' (stored at 'places' array and
  in the map markers 'markers' array: each place has one marker),
  and the 'nearby places' (stored at 'nearPlaceMarkers' markers array: these
  places have only markers on the map). */

  // Class for the 'place'
  function Place(position, address, title, place_id, marker_id, visible) {
      return {
          position: position,
          address: address,
          title: ko.observable(title),
          place_id: place_id,
          marker_id: ko.observable(marker_id),
          visible: ko.observable(visible)
      };
  }


  var viewModel = {

      // Create a styles array to use with the map
      styles: [
        {
          featureType: 'water',
          stylers: [
            { color: '#19a0d8' }
          ]
        },{
          featureType: 'administrative',
          elementType: 'labels.text.stroke',
          stylers: [
            { color: '#ffffff' },
            { weight: 6 }
          ]
        },{
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#e85113' }
          ]
        },{
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [
            { color: '#efe9e4' },
            { lightness: -40 }
          ]
        },{
          featureType: 'transit.station',
          stylers: [
            { weight: 9 },
            { hue: '#e85113' }
          ]
        },{
          featureType: 'road.highway',
          elementType: 'labels.icon',
          stylers: [
            { visibility: 'off' }
          ]
        },{
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [
            { lightness: 100 }
          ]
        },{
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [
            { lightness: -100 }
          ]
        },{
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [
            { visibility: 'on' },
            { color: '#f0e4d3' }
          ]
        },{
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [
            { color: '#efe9e4' },
            { lightness: -25 }
          ]
        }
      ],

      // The default map options
      mapOptions : {
        center: {lat: 0.00, lng: 0.00},
        zoom: 15,
        styles: this.styles
      },

      oldZoom: null,
      oldCenter: null,

      // Control the appearance of the screen and return the css classes
      mobile: ko.observable(false),
      optionsClass: ko.pureComputed(function() {
          return viewModel.mobile() === true ? "options-box-mobile" : "options-box-desktop";
      }),
      mapClass: ko.pureComputed(function() {
          return viewModel.mobile() === true ? "map-mobile" : "map-desktop";
      }),

      // Email and password
      email: ko.observable(''),
      pass: ko.observable(''),
      isLogged: ko.observable(false),

      // Default initial position of the map
      city: ko.observable('Poto Alegre, RS'),
      neighborhood: ko.observable('Centro'),

      // For filtering the list
      filter : ko.observable(''),

      // Default places array
      // The places array can be saved or loaded from external data-base Firebase
      places: ko.observableArray([

        new Place(
            {lat: -30.02901192764373, lng: -51.23178005218506},
            "Praça da Alfândega, s/n - Centro Histório, " +
            "Porto Alegre - RS, 90010-150, Brazil",
            "MARGS - Rio Grande do Sul Museum of Art",
            "ChIJ9-15JQ55GZURekF_01DgMOo",
            '',
            true),

        new Place(
            {lat: -30.03384194804736, lng: -51.23002052307129},
            "R. Duque de Caxias, 1047 - Centro, Porto Alegre - RS," +
            " 90010-370, Brazil",
            "Metropolitan Cathedral of Porto Alegre",
            "ChIJSWFxBQV5GZURY3xNj63guwQ",
            '',
            true),

        new Place(
            {lat: -30.034102019390673, lng: -51.241092681884766},
            "Av. Pres. João Goulart, 551 - Centro Histórico,"+
            " Porto Alegre - RS, 90010-120, Brazil",
            "Centro Cultural Usina do Gasômetro",
            "ChIJTdwE6xZ5GZURrW73RJe1VjI",
            '',
            true),

        new Place(
            {lat: -30.03022149999999, lng: -51.23568169999999},
            "R. Siqueira Campos, 627 - Centro Histórico, "+
            "Porto Alegre - RS, 90012-970, Brazil",
            "Nutri Vida Restaurant",
            "ChIJyyTaPxF5GZUR_sQ2BzmNNaI",
            '',
            true),

        new Place(
            {lat: -30.027692919620314, lng: -51.2277889251709},
            "Galeria Mercado Público Central, s/n - "+
            "Centro Histórico, Porto Alegre - RS, 90020-070, Brazil",
            "Porto Alegre Public Market",
            "ChIJG2LYh_14GZURemMIi487QdA",
            '',
            true),

        new Place(
            {lat: -30.035030840045373, lng: -51.24173641204834},
            "Centro Histórico, Porto Alegre - RS, Brazil",
            "My Place",
            "",
            '',
            true),

      ]),

      // Zoom to area global vars
      address: ko.observable(null),
      lat: ko.observable(null),
      lng: ko.observable(null),

      // Show nearby markers/places vars
      searchType: ko.observable("Markers"),
      searchPlaces: ko.observable(''),
      maxDuration: ko.observable("10"),
      mode: ko.observable('WALKING'),
      searchAddress: ko.observable(''),

      // Arrays for saving the nearby searched locations
      nearPlaceMarkers: [],

      // The map markers array
      markers: [],
      defaultMarkerColor: '0091ff',
      highlightedMarkerColor: 'FFFF24',
      selectedMarkerColor: 'FF2020',

      // The id of the marker
      lastID: 0,

      // This global polygon variable is to ensure only ONE polygon is rendered.
      polygon: null,

      // Default website for searching informations when marker is clicked
      infoWebsite: ko.observable("GooglePlaces"),

      // Firebase config
      firebaseConfig:  {
        apiKey: "AIzaSyCK5-SFwaULoOQiJnskz_KnPuMTPne4Vgk",
        authDomain: "udacity-maps-project-193004.firebaseapp.com",
        databaseURL: "https://udacity-maps-project-193004.firebaseio.com",
        projectId: "udacity-maps-project-193004",
        storageBucket: "",
        messagingSenderId: "615099226594"
      },

      // Firebase global vars
      defaultApp: null,
      defaultDatabase: null,
      auth: null,
      promise: null,
      firebaseUser: null,

      // Google APIs global vars
      map: null,
      largeInfowindow: null,
      placeInfoWindow: null,
      drawingManager: null,
      directionsRenderer: null,
      searchBox: null,



      /* The functions are grouped in same order as the DOM functionalities.
         So, the DOM can be used as a 'map' for the functions! */

      // --- lOGIN AND USER SIGN UP ---

      login: function() {
          console.log('at login');
          console.log('is logged:', viewModel.isLogged());
          // get emmail and password
          var email = viewModel.email();
          var pass = viewModel.pass();
          viewModel.pass('');
          viewModel.auth = firebase.auth();
          viewModel.promise = viewModel.auth.signInWithEmailAndPassword(email, pass);
          viewModel.promise.catch(function(error) {
              console.log(error, error.message);
              alert("Error: " + error.code);
              if (error.code === 'auth/user-not-found') {
                  alert('Need to create user first. Click on "Sign up".');
              }
          });
      },

      createUser: function() {
        console.log('at create user');
        var checkup = confirm("Have you typed your email and a password" +
          "created exclusively for this app?");
        if (checkup === false) {
            alert('It is not possible to create a new user!');
            return;
        } else {
            alert('Creating a new user');
        }
        // get emmail and password
        var email = viewModel.email();
        var pass = viewModel.pass();
        viewModel.pass('');
        viewModel.auth = firebase.auth();
        viewModel.promise = viewModel.auth.createUserWithEmailAndPassword(email, pass);
        viewModel.promise.catch(function(error) {
          console.log(error, error.message);
          alert("Error in sign up: " + error.message);
        });
      },

      logout: function() {
          console.log('at log out');
          var status = firebase.auth().signOut();
          console.log('status:', status);
      },


      // --- DATA STORE: LOCALLY OR AT CLOUD (FIREBASE) ---

      // Saves the places to Firebase or to browser cache
      saveDatabase: function() {
          console.log('saving data-base');
          console.log('places()', viewModel.places());

          var cityToSave = viewModel.city();
          var neighborhoodToSave = viewModel.neighborhood();
          var placesToSave = viewModel.getPlacesArray();

          // Test for external storage or local storage
          if(viewModel.firebaseUser)
          {
              var user = viewModel.firebaseUser.uid;
              // Saving the city
              var cityRef = viewModel.defaultDatabase.ref().child(user + "/city");
              cityRef.set(cityToSave)
                  .catch(function(error) {
                      console.log("City save failed: " + error.message);
                  });
              // Saving the neighborhood
              var neighborhoodRef = viewModel.defaultDatabase.ref().child(user + "/neighborhood");
              neighborhoodRef.set(neighborhoodToSave)
                  .catch(function(error) {
                      console.log("Neighborhood save failed: " + error.message);
                  });
              // Saving places
              var placesRef = viewModel.defaultDatabase.ref().child(user + "/places");
              placesRef.set(placesToSave)
                  .then(function () {
                      alert("Places saved at Firebase data-base! <firebase.google.com>");
                  })
                  .catch(function(error) {
                      console.log("Places save failed: " + error.message);
                  });
          } else {
              alert("User not logged in. Please, login" +
                    " to save your data at cloud database." +
                    " You can save locally at your browser cache...");
              var saveLocally = confirm("Save locally?");
              if (saveLocally){
                  try{
                        localStorage.city = viewModel.city();
                        localStorage.neighborhood = viewModel.neighborhood();
                        localStorage.places = JSON.stringify(placesToSave);
                      } catch (error) {
                        alert("Error on saving the data: " + error +
                              " Please, verify the browser settings to allow " +
                              "local storage.");
                      }
              }
          }
      },

      // This function get the places array object and return in JSON
      getPlacesArray: function() {
          var placesArray = [];
          for (var i=0; i<viewModel.places().length; i++){
              placesArray.push({
                  position: viewModel.places()[i].position,
                  address: viewModel.places()[i].address,
                  title: viewModel.places()[i].title(),
                  place_id: viewModel.places()[i].place_id,
                  marker_id: viewModel.places()[i].marker_id(),
                  visible: viewModel.places()[i].visible()
              });
          }
          console.log('places array:', placesArray);
          return placesArray;
      },

      // Loads the places from Firebase or from browser cahce
      loadDatabase: function() {
          console.log('loading places from data-base');
          if(viewModel.firebaseUser){
              var user = viewModel.firebaseUser.uid;
              var cityRef = viewModel.defaultDatabase.ref().child(user + "/city");
              var neighborhoodRef = viewModel.defaultDatabase.ref().child(user + "/neighborhood");
              var placesRef = viewModel.defaultDatabase.ref().child(user + "/places").orderByKey();
              // Load city
              cityRef.once('value')
                  .then(function(snapshot) {
                      var result = snapshot.val();
                      console.log('result', result);
                      if (result !== null) {
                          viewModel.city(result);
                      }
                  })
                  .catch(function(error) {
                      console.log("City load failed: " + error.message);
                  });
              // Load neighborhood
              neighborhoodRef.once('value')
                  .then(function(snapshot) {
                      var result = snapshot.val();
                      console.log('result', result);
                      if (result !== null) {
                          viewModel.neighborhood(result);
                      }
                  })
                  .catch(function(error) {
                      console.log("Neighborhood load failed: " + error.message);
                  });
              // Adjust for nighborhood visibility
              viewModel.setMapCenter(false);
              // Load places
              placesRef.once('value')
                .then(function(snapshot) {
                    var result = snapshot.val();
                    console.log('result', result);
                    if (result !== null) {
                        viewModel.places.removeAll();
                        var places = [];
                        for (var i=0; i<result.length; i++) {
                            places.push(result[i]);
                        }
                        viewModel.placesArrayToPlaces(places);
                        //alert("Places loaded");
                        console.log('places loaded, places:', viewModel.places());
                        // Reinitialize the Map and markers
                        // First, clear the map from markers
                        for (var j=0; j < viewModel.markers.length; j++){
                            viewModel.markers[j].setMap(null);
                        }
                        // Clear the markers array
                        viewModel.markers = [];
                        // Creates new markers array
                        for (var k=0; k < viewModel.places().length; k++){
                            viewModel.createMarker(viewModel.places()[k]);
                        }
                        // Adjust for markers visibility
                        if(viewModel.markers.length > 0) {
                            viewModel.showMarkers(true);
                        }
                        console.log('new markers:', viewModel.markers);
                    } else {
                        alert("No places loaded! Existing ones will not be modified.");
                    }
                })
                .catch(function(error) {
                    console.log("Load failed: " + error.message);
                });
          } else {
              alert("Please, login to load or save your data! Trying to load" +
                    "from browser cache (locally stored)...");
              //var anonymous = prompt("Do you want to load locally?", "Yes");
              var anonymous = "Yes";
              if (anonymous === "Yes"){
                  try{
                        var city = localStorage.city;
                        var neighborhood = localStorage.neighborhood;
                        var places = localStorage.places;
                        //Load city
                        if(city !== null){
                            viewModel.city(city);
                        } else {
                            console.log('loading city error: null');
                        }
                        // Load neighborhood
                        if(neighborhood !== null){
                            viewModel.neighborhood(neighborhood);
                        } else {
                            console.log('loading neighborhood error: null');
                        }
                        // Adjust the map
                        if((city !== null)||(neighborhood !== null)){
                            viewModel.setMapCenter(false);
                        }
                        // Load places
                        if(places === null){
                          console.log('places null');
                          alert("Not possible to load locally. No data found.");
                        } else {
                            console.log('places json:', places);
                            var newPlaces = [];
                            newPlaces = JSON.parse(places);
                            viewModel.placesArrayToPlaces(newPlaces);
                            // Reinitialize the Map and markers
                            // First, clear the map from markers
                            for (var i=0; i < viewModel.markers.length; i++){
                                viewModel.markers[i].setMap(null);
                            }
                            // Clear the markers array
                            viewModel.markers = [];
                            // Creates new markers array
                            for (var j=0; j < viewModel.places().length; j++){
                                viewModel.createMarker(viewModel.places()[j]);
                            }
                            console.log('new markers:', viewModel.markers);
                            // For sync reasons, don´t setMapCenter if will show markers
                            if(viewModel.markers.length > 0) {
                                viewModel.showMarkers(true);
                            } else {
                                viewModel.setMapCenter(false);
                            }
                        }
                    } catch (error) {
                        alert("Error on loading the data: " + error);
                    }
              }
          }
      },

      // This function loads a places array into the viewModel.places
      placesArrayToPlaces: function(places){
          viewModel.places.removeAll();
          // Construct a JSON object with the places
          //var newPlacesArray = JSON.parse(places);
          var newPlacesArray = places;
          //console.log('newPlaces', newPlacesArray);
          for (var i=0; i<newPlacesArray.length; i++){
              var newPlace = newPlacesArray[i];
              console.log("new place", newPlace);
              var placeObj = new Place(
                  newPlace.position,
                  newPlace.address,
                  newPlace.title,
                  newPlace.place_id,
                  newPlace.marker_id,
                  newPlace.visible
              );
              console.log('place obj', placeObj);
              viewModel.places.push(placeObj);
          }
      },

      // --- MAP CREATION AND POSITIONING ---

      // Init the map and make the markers with the places stored in the places array
      initMap: function() {
        console.log('in initMap');
        // Initialize the Map
        var mapOptions = viewModel.mapOptions;
        viewModel.map.setOptions(mapOptions);
        // Create Markers from array of Places (for a default case)
        viewModel.markers = [];
        for (var i=0; i < viewModel.places().length; i++){
            viewModel.createMarker(viewModel.places()[i]);
        }
        // Adjust the map center and boundaries
        if(viewModel.markers.length > 0) {
            viewModel.setMapCenter(true);
        } else {
            viewModel.setMapCenter(false);
        }
        // Sets the option for pointer style when creating the place
        viewModel.map.addListener('mouseover', function() {
            if (document.getElementById('add-marker').checked === true) {
              viewModel.map.setOptions({draggableCursor:'crosshair'});
            } else {
              viewModel.map.setOptions({draggableCursor: null});
            }
        });
        console.log('at point 4');
        // Listen for clicks for creating places and markers
        viewModel.map.addListener('click', function(event) {
            console.log('in fired map listener','event:', event);
            // Create if the set cursor for markers is selected
            if (document.getElementById('add-marker').checked === true) {
                var lat = event.latLng.lat();
                var lng = event.latLng.lng();
                var address = '';
                var title = "Marker Title";
                var place_id = '';
                if (event.placeId !== undefined) {
                    console.log('event placeId:', event.placeId);
                    place_id = event.placeId;
                }
                // Creates the place and the marker
                viewModel.createPlace(lat, lng, address, title, place_id);
            }
        });
        // Configure the drawing manager for drawing a polygon
        viewModel.drawingManager.addListener('overlaycomplete', function(event) {
            // First, check if there is an existing polygon.
            // If there is, get rid of it and remove the markers
            if (viewModel.polygon) {
              viewModel.polygon.setMap(null);
              //hideMarkers(markers);
            }
            // Switching the drawing mode to the HAND (i.e., no longer drawing).
            viewModel.drawingManager.setDrawingMode(null);
            // Creating a new editable polygon from the overlay.
            viewModel.polygon = event.overlay;
            viewModel.polygon.setEditable(true);
            // Searching within the polygon.
            //searchWithinPolygon(polygon);
            // Make sure the search is re-done if the poly is changed.
            viewModel.polygon.getPath().addListener('set_at', viewModel.searchWithinPolygon);
            viewModel.polygon.getPath().addListener('insert_at', viewModel.searchWithinPolygon);
            // Since this polygon has only one path, we can call getPath() to return the
            // MVCArray of LatLngs.
            var vertices = viewModel.polygon.getPath();
            // Calculate the area
            var area = google.maps.geometry.spherical.computeArea(viewModel.polygon.getPath());
            var infowindow = viewModel.largeInfowindow;
            var contentString = '';
            // Iterate over the vertices.
            for (var i =0; i < vertices.getLength(); i++) {
              var xy = vertices.getAt(i);
              contentString += '<br>' + 'Coordinate ' + i + ':<br>' + xy.lat().toFixed(7) + ', ' +
                  xy.lng().toFixed(7);
              //console.log(contentString);
            }
            // Formats the text that will show the area
            var formatedArea = area.toFixed(0).replace(/./g, function(c, i, a) {
                  return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
                  });
            contentString += '<br>Area ' + ':<br>' + formatedArea + ' m²';
            // Replace the info window's content and position.
            infowindow.setContent(contentString);
            infowindow.setPosition(vertices.getAt(0));
            infowindow.addListener('closeclick', function() {
                viewModel.drawingManager.setMap(null);
                // In case the user drew anything, get rid of the polygon
                if (viewModel.polygon !== null) {
                  viewModel.polygon.setMap(null);
                }
            });
            infowindow.open(viewModel.map);
        });
        // Configure listener for the Search Box
        viewModel.searchBox.addListener('places_changed', function() {
            var selected = this.getPlaces();
            console.log('selected:', selected);
            // Create the array with the markers
            viewModel.createMarkersForNearbyPlaces(selected);
            // Adjust the map
            viewModel.showNearPlaceMarkers(false);
        });
      },

      /* Query for the map center, based upon the neighborhood, and position
          the map accordingly. */
      setMapCenter: function(showMarkers) {
          console.log('in octopus', 'setMapCenter');
          console.log('at point 1');
          console.log('showMarkers:', showMarkers);
          // Initialize the geocoder.
          var geocoder = new google.maps.Geocoder();
          var address = viewModel.neighborhood() + ', ' + viewModel.city();
          console.log('address', address);
          // Geocode the address/area entered to get the center. Then, center the map
          // on it and zoom in
          geocoder.geocode( { address: address }, function(results, status) {
              if (status === google.maps.GeocoderStatus.OK) {
                console.log('results', results);
                viewModel.mapOptions.center = results[0].geometry.location;
                viewModel.mapOptions.bounds = results[0].geometry.viewport;
                console.log('geocoder response', 'map center', results[0].geometry.location.toJSON());
                console.log('geocoder response', 'map viewport', results[0].geometry.viewport.toJSON());
                // Repositioning the map
                viewModel.map.panToBounds(viewModel.mapOptions.bounds);
                viewModel.map.panTo(viewModel.mapOptions.center);
                console.log('in set map center, new bounds:', viewModel.mapOptions.bounds);
                console.log('in set map center, query map bounds:', viewModel.map.getBounds());
                if (neighborhood !== '') {
                  viewModel.map.setZoom(15);
                } else {
                  viewModel.map.setZoom(12);
                }
              } else {
                window.alert('Geocode was not successful for the following reason:' + status);
              }
              console.log('at point 2');
              if (showMarkers === true) {
                  viewModel.showMarkers(true);
              }
            });
          console.log('at point 3');
      },


      // --- MAP 'USER MARKERS' CREATION AND VISIBILITY ---

      /* This function creates a marker and write the marker to the map
         and also to the markers array. Also creates the map markers events. */
      createMarker: function(place) {
          console.log('in create marker');
          console.log('place', place);
          // Style the markers
          var defaultIcon = this.makeMarkerIcon(viewModel.defaultMarkerColor);
          // Create a marker (for Map) per location, and put into markers array.
          var marker = new google.maps.Marker({
              position: place.position,
              title: place.title(),
              address: place.address,
              animation: google.maps.Animation.DROP,
              icon: defaultIcon,
              infowindow: null,
              infowindow_distance: null,
              zIndex: 0,
              status: 'unselected',
              place_id: place.place_id,
              id: viewModel.lastID.toString()
          });
          // Links the marker to the place
          place.marker_id(marker.id);
          // Increments the id of the markers array
          viewModel.lastID += 1;
          // Set marker listeners
          var highlightedIcon = this.makeMarkerIcon(viewModel.highlightedMarkerColor);
          var selectedIcon = this.makeMarkerIcon(viewModel.selectedMarkerColor);
          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          marker.addListener('mouseover', function() {
              if (this.status !== 'selected') {
                  this.setIcon(highlightedIcon);
                  this.setZIndex(1);
              }
              var self = this;
              var data = { marker_id: function() {
                return self.id;} };
              var eventType = { type: 'mouseenter'};
              viewModel.highlightPlace(data, eventType);
          });
          // Listener for mouse out
          marker.addListener('mouseout', function() {
              if (this.status !== 'selected') {
                  this.setIcon(defaultIcon);
                  this.setZIndex(0);
              }
              // Sets the places list
              var self = this;
              var data = { marker_id: function() {
                return self.id;} };
              var eventType = null;
              if (this.status !== 'selected') {
                  eventType = { type: 'mouseleave'};
              } else {
                  eventType = { type: 'mouseenter'};
              }
              viewModel.highlightPlace(data, eventType);
          });
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
              var self = this;
              var data = { marker_id: function() {
                return self.id;} };
              var eventType = null;
              // Deselect if already selected, and returns
              if (this.status === 'selected'){
                  this.setIcon(defaultIcon);
                  this.status = 'unselected';
                  // Closing info window
                  if (this.infowindow !== null) {
                      this.infowindow.close();
                  }
                  // Clear all distance infowindows
                  viewModel.clearDistanceInfowindows();
                  // Deselect place
                  eventType = { type: 'mouseleave'};
                  viewModel.highlightPlace(data, eventType);
                  return;
              }
              // Before selecting the marker, deselect all others
              function DataMarker(id) {
                  this.id = id;
                  this.marker_id = function() {
                    return this.id;
                  };
              }
              // Deselect markers
              for (var i = 0; i < viewModel.markers.length; i++) {
                  viewModel.markers[i].status = 'unselected';
                  viewModel.markers[i].setIcon(defaultIcon);
                  // Deselect place
                  var id = viewModel.markers[i].id;
                  var dataMarker = new DataMarker(id);
                  console.log('dataMarker:', dataMarker);
                  eventType = { type: 'mouseleave'};
                  viewModel.highlightPlace(dataMarker, eventType);
                  // And close the infowindow_distance
                  if (viewModel.markers[i].infowindow_distance !== null) {
                      viewModel.markers[i].infowindow_distance.close();
                      // Preventing errors
                      viewModel.markers[i].setMap(viewModel.map);
                      console.log('clearing infowindows distance','i',i);
                  }
              }
              // Deselect any near place markers
              for (var j = 0; j < viewModel.nearPlaceMarkers.length; j++) {
                  viewModel.nearPlaceMarkers[j].status = 'unselected';
                  viewModel.nearPlaceMarkers[j].setOpacity(0.5);
              }
              // Select the place and its marker
              eventType = { type: 'mouseenter'};
              viewModel.highlightPlace(data, eventType);
              // Set the incon as selected
              this.setIcon(selectedIcon);
              // Set the status
              this.status = 'selected';
              // Creates the info window
              viewModel.populateInfoWindow(this);
              console.log('marker selected', this);
              console.log('markers', viewModel.markers);
              console.log('places', viewModel.places());
          });
          // Writes the marker to the map
          marker.setMap(viewModel.map);
          // Push the marker to the array of markers.
          viewModel.markers.push(marker);
          console.log('ending of marker creation, markers:', viewModel.markers);
          console.log('ending of marker creation, places:', viewModel.places());
      },

      /* This function takes in a COLOR, and then creates a new marker
         icon of that color. The icon will be 21 px wide by 34 high, have an origin
         of 0, 0 and be anchored at 10, 34). */
      makeMarkerIcon: function(markerColor) {
          try{
            var markerImage = new google.maps.MarkerImage(
                'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+
                markerColor + '|40|_|%E2%80%A2',
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34),
                new google.maps.Size(21,34));
            return markerImage;
        } catch(err) {
            console.log('Error in creating marker icon');
        }
        return null;
      },

      // This function will loop through the markers array and display them all.
      showMarkers: function(adjustBounds) {
          console.log('in show markers', 'markers', viewModel.markers);
          if (viewModel.markers.length > 0) {
            var bounds = new google.maps.LatLngBounds();
            // Extend the boundaries of the map for each marker and display the marker
            for (var i = 0; i < viewModel.markers.length; i++) {
              viewModel.markers[i].setMap(viewModel.map);
              bounds.extend(viewModel.markers[i].position);
            }
            if(adjustBounds === true){
              console.log('adjusting bounds to ', bounds);
              viewModel.map.fitBounds(bounds);
            }
            //Limit zoom in caso of only one marker
            if (viewModel.map.getZoom() > 15) {
              viewModel.map.setZoom(15);
            }
          }
      },

      // This function will loop through the listings and hide them all.
      hideMarkers: function() {
          for (var i = 0; i < viewModel.markers.length; i++) {
            viewModel.markers[i].setMap(null);
          }
      },

      // Select a marker (trigger a click event) based on marker id
      selectMarker: function(marker_id) {
        for (var i=0; i<viewModel.markers.length; i++){
          if(viewModel.markers[i].id === marker_id){
                google.maps.event.trigger(viewModel.markers[i], 'click');
              break;
          }
        }
      },

      highlightMarker: function(marker_id, mouseover) {
          // Set marker listeners
          var defaultIcon = this.makeMarkerIcon(viewModel.defaultMarkerColor);
          var highlightedIcon = this.makeMarkerIcon(viewModel.highlightedMarkerColor);

          for (var i=0; i<viewModel.markers.length; i++){
              if ((viewModel.markers[i].id === marker_id) && (viewModel.markers[i].status !== 'selected')){
                  if (mouseover === true) {
                      viewModel.markers[i].setIcon(highlightedIcon);
                      //viewModel.highlightPlace(viewModel.markers[i].id, true);
                  } else {
                      viewModel.markers[i].setIcon(defaultIcon);
                  }
              }
          }
      },


      // --- 'USER PLACES' LIST CREATION, DELETION AND FILTERING ---

      // This function creates a place and write in the places array
      createPlace: function(placeLat, placeLng, address, title, place_id) {
          console.log('in create place');
          var newPlace = new Place({lat: placeLat, lng: placeLng}, address,
            title, place_id, '', true);

          // If it has a placeId, try to complete the title and address
          if (place_id !== '') {
              console.log('in places service with place_id','place_id:', place_id);
              var service = new google.maps.places.PlacesService(viewModel.map);
              service.getDetails({
                  placeId: place_id
              }, function(result, status) {
                  if (status === google.maps.places.PlacesServiceStatus.OK) {
                      // Set the marker address and title
                      console.log('setting the title:', result.name);
                      var address = result.formatted_address;
                      if(address !== null){
                          newPlace.address = address;
                      }
                      var title = result.name;
                      if(title !== null){
                          newPlace.title(title);
                      }
                      // Push the places to the array of places
                      viewModel.places.push(newPlace);
                      // Create the marker
                      viewModel.createMarker(newPlace);
                      // Refresh the HTML
                      //viewModel.renderPlacesList();
                      console.log('place created', newPlace);
                  } else {
                      window.alert('Places details request failed due to ' + status);
                  }
              });
          } else {
              console.log('in places without place_id','place_id:', place_id);
              // Search for the  address, based upon its location
              var geocoder = new google.maps.Geocoder();
              // Query the Geocoder API
              geocoder.geocode({'location': {lat: placeLat, lng:placeLng}
              }, function(results, status){
                  if (status === 'OK') {
                      if(results[1]) {
                        var address = results[1].formatted_address;
                        //var place_id = results[1].place_id;
                        console.log('address','result[1]', results[1]);
                        // Writes the address
                        if(address !== null){
                          newPlace.address = address;
                        }
                        viewModel.places.push(newPlace);
                        // Create the marker
                        viewModel.createMarker(newPlace);
                        // Refresh the HTML
                        //viewModel.renderPlacesList();
                        console.log('place created', newPlace);
                      }
                  } else {
                      window.alert('Geocoder for address request failed due to ' + status);
                  }
              });
          }
          console.log('end of place creation');
      },

      setPlaceTitle: function (place, title) {
          // passing the new value as a parameter, because is 'observable'
          place.title(title);
      },

      getPlaces: function() {
          return viewModel.places();
      },

      // Return the place linked to that marker
      getMarkerPlace: function(marker) {
          if (marker !== undefined) {
              for(var i = 0; i < viewModel.places().length; i++){
                  if (viewModel.places()[i].marker_id() === marker.id){
                      return viewModel.places()[i];
                  }
              }
          }
      },

      // This function will filter the lit of places, based on the "filter" word
      filterList: function() {
          // Finds the places that begins with the word
          // If the word is blank, select all
          // Set the visibility of the others to false
          console.log('at filter list');
          var knockoutFilter = viewModel.filter();
          console.log('knockoutFilter:', knockoutFilter);
          var matchesId = [];
          var filterLower = knockoutFilter.toLowerCase();
          for (var i=0; i<viewModel.places().length; i++){
              var title = viewModel.places()[i].title().toLowerCase();
              var match = title.startsWith(filterLower);

              if ( (match || (filterLower === '')) === false) {
                  // Found a match
                  viewModel.places()[i].visible(false);
                  // For setting the markers off the Map
                  matchesId.push(viewModel.places()[i].marker_id());
              } else {
                  viewModel.places()[i].visible(true);
              }
          }
          // Set all Map on
          for (var j=0; j<viewModel.markers.length; j++){
              viewModel.markers[j].setMap(viewModel.map);
          }
          // Set the markers with invisible places off the Map
          for (var k=0; k<matchesId.length; k++){
              for (var m=0; m<viewModel.markers.length; m++){
                if (viewModel.markers[m].id === matchesId[k]){
                    viewModel.markers[m].setMap(null);
                }
              }
          }
      },


      // --- MIXED: GET 'USER MARK' AND 'NEARBY PLACES MARK' SELECTED ---

      // This function returns the marker that was selected (selected state === true)
      getSelectedMarker: function() {
          for(var i = 0; i < viewModel.markers.length; i++){
              if (viewModel.markers[i].status === 'selected'){
                  return viewModel.markers[i];
              }
          }

          for(var j = 0; j < viewModel.nearPlaceMarkers.length; j++){
              if (viewModel.nearPlaceMarkers[j].status === 'selected'){
                  return viewModel.nearPlaceMarkers[j];
              }
          }
      },


      // --- INFORMATION WINDOWS ---

      // This function will populate the window that opens when a 'user marker' is clicked
      populateInfoWindow: function(marker) {
          console.log('in populate info window, marker: ', marker);
          // First, close all other infowinows
          for(var i = 0; i < viewModel.markers.length; i++){
              // Close any infowindow
              if (viewModel.markers[i].infowindow) {
                  viewModel.markers[i].infowindow.close();
              }
          }
          // Close any places infowindow
          for(var j = 0; j < viewModel.nearPlaceMarkers.length; j++){
              if (viewModel.nearPlaceMarkers[j].infowindow) {
                  viewModel.nearPlaceMarkers[j].infowindow.close();
              }
          }
          // Clear the infowindow content
          var infowindow = viewModel.largeInfowindow;
          console.log('infowindow:', infowindow);
          infowindow.setContent('');
          // Attach the marker reference
          infowindow.marker = marker;
          // Select the source according the user selection
          console.log('info website', viewModel.infoWebsite());
          if (viewModel.infoWebsite() === "GoogleStreetView") {
              this.getStreetView(marker, infowindow);
          }
          if (viewModel.infoWebsite() === "GooglePlaces") {
              this.getGooglePlaces(marker, infowindow);
          }
          if (viewModel.infoWebsite() === "Wikipedia") {
              this.getWikipedia(marker, infowindow);
          }
          // With this is possible to close the infowindow by referencing the marker
          marker.infowindow = infowindow;
          // Open the infowindow on the correct marker.
          infowindow.open(viewModel.map, marker);
      },

      getStreetView: function (marker, infowindow) {
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(result, status) {
              if (status === google.maps.StreetViewStatus.OK) {
                  var nearStreetViewLocation = result.location.latLng;
                  var heading = google.maps.geometry.spherical.computeHeading(
                      nearStreetViewLocation, marker.position);
                  var innerHTML = '<div id="pano"></div>';
                  infowindow.setContent(innerHTML);
                  var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                      heading: heading,
                      pitch: 30
                    }
                  };
                  var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
              } else {
                  infowindow.setContent('<div>No Street View Found</div>');
              }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanorama({location: marker.position, radius: radius},
                                        getStreetView);
      },

      getGooglePlaces: function (marker, infowindow) {
          var innerHTML = '';
          //console.log('marker for the get marker place', marker);
          //var place = this.getMarkerPlace(marker);
          if (marker.place_id === '') {
              // Content of the infowindow
              innerHTML += '<p>Information from Google Places:</p>' +
                  '<p>No information.</p>';
              // For async load
              infowindow.setContent(innerHTML);
          } else {
              var service = new google.maps.places.PlacesService(viewModel.map);
              service.getDetails({
                    placeId: marker.place_id
              }, function(result, status) {
                  console.log('result from google place', result);
                  if (status === google.maps.places.PlacesServiceStatus.OK) {
                      // Set the marker property on this infowindow so it isn't created again.
                      infowindow.marker = marker;
                      innerHTML += '<div style="margin: 12px 12px 12px 12px;">';
                      innerHTML += '<p>Information from Google Places:</p>';
                      innerHTML += '<div>';
                      if (result.name) {
                        innerHTML += '<strong>' + result.name + '</strong>';
                      }
                      if (result.formatted_address) {
                        innerHTML += '<br>' + result.formatted_address;
                      }
                      if (result.formatted_phone_number) {
                        innerHTML += '<br>' + result.formatted_phone_number;
                      }
                      innerHTML += '</div>';
                      if (result.opening_hours) {
                        innerHTML += '<div style="display:inline-block; width:48%;">' +
                            '<br><br><strong>Hours:</strong><br>' +
                            result.opening_hours.weekday_text[0] + '<br>' +
                            result.opening_hours.weekday_text[1] + '<br>' +
                            result.opening_hours.weekday_text[2] + '<br>' +
                            result.opening_hours.weekday_text[3] + '<br>' +
                            result.opening_hours.weekday_text[4] + '<br>' +
                            result.opening_hours.weekday_text[5] + '<br>' +
                            result.opening_hours.weekday_text[6] +
                            '</div>';
                      }
                      innerHTML += '<div style="display:inline-block; width:48%; float:right;">';
                      if (result.photos) {
                        innerHTML += '<br><br><img src="' + result.photos[0].getUrl(
                            {maxHeight: 100, maxWidth: 200}) + '">';
                      }
                      if (result.website) {
                        innerHTML += '<div><a target="_blank" href=' +
                        result.website + '>' + result.website + '</a></div>';
                      }
                      innerHTML += '</div>';
                      innerHTML += '</div>';
                      // For async load
                      infowindow.setContent(innerHTML);

                  } else {
                      window.alert('Places details request failed due to ' + status);
                      innerHTML += '<p>Information from Google Places:</p>' +
                          '<p>No information.</p>';
                      // For async load
                      infowindow.setContent(innerHTML);
                  }
              });
          }
          console.log('info window content', innerHTML);
          infowindow.open(viewModel.map, marker);
      },

      getWikipedia: function(marker, infowindow) {
          console.log('show wikipedia infowindow, marker:', marker);
          //var place = this.getMarkerPlace(marker);
          //var queryData = place.title();
          var queryData = marker.title;
          if (queryData === "Marker Title") {
            queryData = marker.address;
          }
          console.log('query data', queryData);
          var wikiUrl = 'https://en.wikipedia.org/w/api.php';
          $.ajax({
              url: wikiUrl,
              data: {
                action: 'query',
                list: 'search',
                srsearch: queryData,
                format: 'json',
                formatversion: 2
              },
              dataType: 'jsonp',
              success: function (response) {
                  console.log('wikipedia response', response);
                  var articleList = response.query.search;
                  var contentString = '<div>' +
                                      '<p>Information from Wikipedia:</p>'+
                                      '<ul id="wikipedia-links">';
                  for (var i=0; i< articleList.length; i++) {
                      var articleStr = articleList[i].title;
                      var url = 'https://en.wikipedia.org/wiki/' + articleStr;
                      contentString += '<li><a target="_blank" href="' + url + '">' +
                                        articleStr + '</a></li>';
                  }
                  if (articleList.length === 0) {
                      contentString += '<p>No informations for: <br>' + queryData + '</p>';
                  }
                  contentString += '</ul></div>';
                  // Update infowindow
                  infowindow.setContent(contentString);
              },
              timeout: 3000, //set timeout to 3 seconds
              // Alert the user on error.
              error: function (error) {
                  infowindow.setContent('<h5>Wikipedia data is unavailable.</h5>');
                  console.log('Wikipedia data is unavailable, error:', error);
              }
          });
      },


      // Close all the infowindows shown whith the distance and time data
      clearDistanceInfowindows: function() {
          for (var i=0; i < viewModel.markers.length; i++){
            console.log('clearing infowindows distance');
            if (viewModel.markers[i].infowindow_distance !== null) {
              console.log('clearing infowindows distance','i',i);
              viewModel.markers[i].infowindow_distance.close();
              // Preventing errors
              viewModel.markers[i].setMap(viewModel.map);
            }
          }

          for (var j=0; j < viewModel.nearPlaceMarkers.length; j++){
            console.log('clearing nearby infowindows distance');
            if (viewModel.nearPlaceMarkers[j].infowindow_distance !== undefined) {
              console.log('clearing nearby infowindows distance','j',j);
              viewModel.nearPlaceMarkers[j].infowindow_distance.close();
              // Preventing errors
              viewModel.nearPlaceMarkers[j].setMap(viewModel.map);
            }
          }
      },

      /* This function is in response to the user selecting "show route" on one
         of the markers within the calculated distance. This will display the route
         on the map. */
      displayDirections: function(destination, mode) {
          console.log('at display directions');
          // memorize the map position and zoom
          viewModel.oldCenter = viewModel.map.getCenter();
          viewModel.oldZoom = viewModel.map.getZoom();
          if(viewModel.searchType() === "Markers"){
              this.hideMarkers();
          } else if(viewModel.searchType() === "Nearby") {
              this.hideNearPlaceMarkers();
          }
          //var directionsService = new google.maps.DirectionsService;
          directionsService = [];
          directionsService = new google.maps.DirectionsService();
          // Get the destination address from the user entered value.
          var destinationAddress = destination;
          // Get the origin from the selected marker
          var origin = null;
          for(var i = 0; i < viewModel.markers.length; i++){
            if (viewModel.markers[i].status === 'selected') {
              origin = viewModel.markers[i].getPosition();
              break;
            }
          }
          // Or try to get the origin from address of text box
          if (origin === null) {
              origin = viewModel.searchAddress();
          }
          console.log('at display directions', 'origin', origin);
          directionsService.route({
              // The origin is the passed in marker's position.
              origin: origin,
              // The destination is user entered address.
              destination: destinationAddress,
              travelMode: google.maps.TravelMode[mode]
            }, function(response, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                var directionsRendererOptions = {
                    map: viewModel.map,
                    directions: response,
                    draggable: true,
                    polylineOptions: {
                       strokeColor: 'green'
                    }
                };
                viewModel.directionsRenderer.setOptions(directionsRendererOptions);
              } else {
                window.alert('Directions request failed due to ' + status);
              }
          });
      },

      /* This function is called by knockout when the infoWebsite changes.
         It will update the infoWindow if already opened.
         This is setted up by subscribing to observable infoWebsite. */
      setNewInfoWindow: function(value) {
          console.log('in newInfoWindow, value:', value);
          var marker = viewModel.largeInfowindow.marker;
          console.log('marker:', marker);
          if (marker !== undefined) {
              viewModel.populateInfoWindow(marker);
          }
      },


      // --- MIXED: DELETE MAP MARKER AND THE LINKED PLACE ON PLACE LIST  ---

      // This function will delete the place and the marker, based on the selected marker
      deletePlaceAndMarker: function() {
          console.log('at marker delete');
          var deleted = null;
          var marker_id = '';
          console.log('at marker delete');
          //Delete marker
          for(var i = 0; i < viewModel.markers.length; i++){
              if (viewModel.markers[i].status === 'selected') {
                  marker_id = viewModel.markers[i].id;
                  viewModel.markers[i].setMap(null);
                  console.log('deleted marker i:', i);
                  deleted = i;
                  break;
              }
          }
          // delete from array
          if (deleted !== null){
            viewModel.markers.splice(deleted, 1);
          }
          // Delete place
          // (Uses the knockout method 'remove')
          viewModel.places.remove(function(place){
            return place.marker_id() === marker_id;});

          console.log('end of place and marker deletion');
          console.log('markers', viewModel.markers);
          console.log('places', viewModel.places());
      },


      // --- DRAWING ---

      // This shows and hides (respectively) the drawing options.
      toggleDrawing: function() {
          if (viewModel.drawingManager.map) {
              viewModel.drawingManager.setMap(null);
              // In case the user drew anything, get rid of the polygon
              if (viewModel.polygon !== null) {
                viewModel.polygon.setMap(null);
              }
          } else {
              // Prepare the cursor for drawing
              viewModel.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
              viewModel.drawingManager.setMap(viewModel.map);
          }
      },


      /// --- ZOOM ---

      /* This function takes the input value in the find nearby area text input
         locates it, and then zooms into that area. This is so that the user can
         show all listings, then decide to focus on one area of the map. */
      zoomToArea: function() {
          var address = viewModel.address();
          var lat = viewModel.lat();
          var lng = viewModel.lng();
          console.log('in octopus zoom to area, address:', address);
          if ((lat !== '') && (lng !== '')) {
              latitude = Number(lat);
              longitude = Number(lng);
              viewModel.map.panTo({lat: latitude, lng: longitude});
              viewModel.map.setZoom(18);
              return;
          }
          // Initialize the geocoder.
          var geocoder = new google.maps.Geocoder();
          // Make sure the address isn't blank.
          if (address === '') {
              window.alert('You must enter an area, or address.');
          } else {
            /* Geocode the address/area entered to get the center. Then, center the map
               on it and zoom in. */
            geocoder.geocode(
                { address: address,
                  componentRestrictions: {locality: viewModel.city()}
                }, function(results, status) {
                  if (status === google.maps.GeocoderStatus.OK) {
                    viewModel.map.setZoom(18);
                    viewModel.map.panTo(results[0].geometry.location);
                    console.log('at point 5');
                  } else {
                    window.alert('We could not find that location - try entering' +
                                 ' a more specific place.');
                  }
                }
            );
          }
      },

      setZoom: function(zoom) {
          viewModel.map.setZoom(zoom);
      },


      // --- ROUTES SEARCHING FUNCTIONS ---

      /* This function allows the user to input a desired travel time, in
         minutes, and a travel mode, and a location - and only show the listings
         that are within that travel time (via that travel mode) of the location.
         It can search in markers[] or in nearPlaceMarkers[], depending upon
         the user selection. */
      searchWithinTime: function(address, mode, maxDuration) {
          address = viewModel.searchAddress();
          mode = viewModel.mode();
          maxDuration = viewModel.maxDuration();
          console.log('at search within time');
          //viewModel.map.oldCenter = viewModel.map.getCenter();
          //viewModel.map.oldZoom = viewModel.map.getZoom();
          // Initialize the distance matrix service.
          var distanceMatrixService = new google.maps.DistanceMatrixService();
          // Check to make sure the place entered isn't blank.
          if (address === '') {
              window.alert('You must enter an address.');
          } else {
              // Close the infowindow of the selected marker
              for (var i = 0; i < viewModel.markers.length; i++) {
                  if (viewModel.markers[i].status === 'selected') {
                      viewModel.markers[i].infowindow.close();
                  }
              }
              // Clear all distance infowindows
              viewModel.clearDistanceInfowindows();
              /* Use the distance matrix service to calculate the duration of the
                 routes between all our markers, and the origin address entered
                 by the user, or copied from the selected marker. */
              var origin = {
                place: address,
                markerNumber: 0
              };

              for (var j = 0; j < viewModel.markers.length; j++) {
                if (viewModel.markers[j].status === 'selected') {
                  console.log('setting marker number');
                  origin.place = viewModel.markers[j].getPosition();
                  origin.markerNumber = j;
                }
              }
              // Store the destinations, based on markers
              var destinations = [];
              // Store the markers of the destinations
              var destinationMarkers = [];
              // If view gets destination is markers, destinationMarkers = viewModel.markers
              // If gets nearPlaceMarkers, destinationMarkers = viewModel.nearPlaceMarkers
              if (viewModel.searchType() === "Markers") {
                  destinationMarkers = viewModel.markers;
              } else if (viewModel.searchType() === "Nearby") {
                  destinationMarkers = viewModel.nearPlaceMarkers;
              }
              // Load the destinations[] based no the type of search
              for (var k = 0; k < destinationMarkers.length; k++) {
                  // Search only for markers that are not selected
                  if (destinationMarkers[k].status !== 'selected') {
                    destinations.push({place: destinationMarkers[k]
                      .getPosition(), markerNumber: k});
                    console.log('destinations', destinationMarkers[k]
                      .getPosition().toString());
                  }
              }
              console.log('origin', origin, 'destinations', destinations);
              if (destinations.length === 0) {
                  alert("There isn't any destination of the selected type " +
                        "(Marker/Nearby places) on the Map!");
                  return;
              }
              // Convert destinations to simple array
              var destinationsArray = [];
              for (var m = 0; m < destinations.length; m++) {
                  destinationsArray.push(destinations[m].place);
              }
              /* Now that both the origins and destination are defined, get all the
                 info for the distances between them. */
              distanceMatrixService.getDistanceMatrix({
                  origins: [origin.place],
                  destinations: destinationsArray,
                  travelMode: google.maps.TravelMode[mode],
                  unitSystem: google.maps.UnitSystem.IMPERIAL,
              }, function(response, status) {
                  if (status !== google.maps.DistanceMatrixStatus.OK) {
                    window.alert('Error was: ' + status);
                  } else {
                    viewModel.displayMarkersWithinTime(response, destinations,
                      destinationMarkers, maxDuration, mode);
                  }
              });
          }
      },

      // Helper function for displayMarkersWithinTime
      SetZIndex: function(destinationMarkers, infowindow) {
          return function() {
              for(var i = 0; i < destinationMarkers.length; i++){
                  if (destinationMarkers[i].infowindow_distance) {
                      destinationMarkers[i].infowindow_distance.setZIndex(0);
                  }
              }
              infowindow.setZIndex(destinationMarkers.length);
          };
      },

      displayMarkersWithinTime: function(response, queried_destinations, destinationMarkers,
        maxDuration, mode) {
          console.log('at display markers within time', 'response', response);
          // memorize the map position and zoom
          //viewModel.oldCenter = viewModel.map.getCenter();
          //viewModel.oldZoom = viewModel.map.getZoom();

          // get origins and destinations from response
          //var origins = response.originAddresses;
          var destinations = response.destinationAddresses;
          console.log('at display markers within time', 'destinations', destinations);
          /* Parse through the results, and get the distance and duration of each.
             Because there might be  multiple origins and destinations we have a
             nested loop. Then, make sure at least 1 result was found. */
          var atLeastOne = false;
          var results = response.rows[0].elements;

          for (var j = 0; j < results.length; j++) {
              var element = results[j];
              if (element.status === "OK") {
                  /* The distance is returned in feet, but the TEXT is in miles.
                     If we wanted to switch the function to show markers within
                     a user-entered DISTANCE, we would need the value for distance,
                     but for now we only need the text. */
                  var distanceText = element.distance.text;
                  /* Duration value is given in seconds so we make it MINUTES.
                     We need both the value and the text. */
                  var duration = element.duration.value / 60;
                  var durationText = element.duration.text;
                  if (duration <= maxDuration) {
                      //markers[queried_origin.markerNumber].setMap(map);
                      atLeastOne = true;
                      /* Create a mini infowindow to open immediately and contain the
                         distance and duration.
                         The destinations[j] correspond to the queried_destinations[j] */
                      var infowindow = new google.maps.InfoWindow({
                        content: durationText + ' away, ' + distanceText +
                          '<div class="infowindow" id=\"class-destination' + j + '\">'+
                          '<input id=\"destination' + j + '\" type=\"button\" ' +
                          'value=\"View Route\"></input>' + '</div>',
                        disableAutoPan: true,
                      });
                      // Open and render the button for the infowindow
                      infowindow.open(viewModel.map,
                        destinationMarkers[queried_destinations[j].markerNumber]);
                      viewModel.renderRouteInfoWindow(j, destinations[j], mode);
                      // It is for the small window closes if the user clicks
                      destinationMarkers[queried_destinations[j].markerNumber]
                        .infowindow_distance = infowindow;
                      // It is for placing the window in front of others
                      google.maps.event.addListener(destinationMarkers[queried_destinations[j]
                        .markerNumber], 'mouseover', viewModel.SetZIndex(destinationMarkers,
                        destinationMarkers[queried_destinations[j].markerNumber].infowindow_distance));

                  }
              }
          }


          if (!atLeastOne) {
              window.alert('We could not find any locations within that distance!');
          }
          // Adjust the zoom for a proper view
          if(viewModel.searchType() === "Markers"){
              this.showMarkers(false);
          } else if(viewModel.searchType() === "Nearby") {
              this.showNearPlaceMarkers(false);
          }
          // Replace the initial position
          //viewModel.map.setZoom(viewModel.oldZoom);
          //viewModel.map.setCenter(viewModel.oldCenter);
      },

      /* This function clears the routes in the map, and also the infowindows
         when they are been chosen. */
      clearRoutes: function() {
          console.log('at clear routes');
          if (viewModel.directionsRenderer.getMap() !== null) {
              viewModel.directionsRenderer.setMap(null);
          }
          // Adjust the zoom for a proper view
          if(viewModel.searchType() === "Markers"){
              this.showMarkers(true);
          } else if(viewModel.searchType() === "Nearby") {
              this.showNearPlaceMarkers(true);
          }
          // Replace the initial position
          viewModel.map.setZoom(viewModel.oldZoom);
          viewModel.map.setCenter(viewModel.oldCenter);
      },


      // --- NEARBY SEARCHING NEW PLACES ---

      /* Helper function for the next setSearchBox
         This function clears the array of the nearby searched places */
      clearNearPlaceMarkers: function() {
          console.log('at clear near places markers');
          for (var i=0; i<viewModel.nearPlaceMarkers.length; i++){
              viewModel.nearPlaceMarkers[i].setMap(null);
          }
          viewModel.nearPlaceMarkers = [];
          console.log('place markers', viewModel.nearPlaceMarkers);
      },

      // Helper function for the click next listener.
      NearbyMarkerClicked: function(marker) {
          return function() {
              console.log('at nearby places NearbyMarkerClicked, marker:', marker);
              // Deselect if already selected, and returns
              if (marker.status === 'selected'){
                  // If the option to create user marker was selected, creates a marker.
                  //if (document.getElementById('add-marker').checked === true) {
                  //    viewModel.createUserMarkerForNearbyPlace();
                  //}
                  // Deselect the nearby place marker
                  marker.setOpacity(0.5);
                  marker.status = 'unselected';
                  // Closing info window
                  if (marker.infowindow !== null) {
                      marker.infowindow.close();
                  }
                  // Clear all distance infowindows
                  viewModel.clearDistanceInfowindows();
                  return;
              }
              // Before selecting the marker, deselect all others
              for (var i = 0; i < viewModel.nearPlaceMarkers.length; i++) {
                  viewModel.nearPlaceMarkers[i].status = 'unselected';
                  viewModel.nearPlaceMarkers[i].setOpacity(0.5);
              }
              // Select the marker
              console.log('marker:', marker);
              marker.status = 'selected';
              marker.setOpacity(1.0);

              // If the option to create marker was selected, creates a marker.
              // If not, just shows the infoWindow.
              //if (document.getElementById('add-marker').checked === true) {
              //    viewModel.createUserMarkerForNearbyPlace();
              //} else {
              		viewModel.populateInfoWindow(marker);
              //}
          };
      },

      // Helper function for mouse over next listener.
      NearbyMarkerOver: function(marker) {
          return function() {
              console.log('in NearbyMarkerOver');
              if(marker.status !== 'selected'){
                  viewModel.highlightPlaceMarker(marker, true);
                  marker.setZIndex(1.0);
              }
          };
      },

      // Helper function for mouse out next listener.
      NearbyMarkerOut: function(marker) {
          return function(){
              console.log('in NearbyMarkerOut');
              if (marker.status !== 'selected') {
                  viewModel.highlightPlaceMarker(marker, false);
                  marker.setZIndex(0);
              }
        };
      },

      /* Helper function for the next setSearchBox.
         This function creates markers for each place found in nearby places search. */
      createMarkersForNearbyPlaces: function(results) {
          console.log('create markers for places','results',results);
          //var bounds = viewModel.map.getBounds();
          // For each place discovered, create an icon and a  marker and stores
          // in the 'nearPlacesMarkers' array.
          for (var i = 0; i < results.length; i++) {
              var place = results[i];
              var icon = {
                url: place.icon,
                size: new google.maps.Size(35, 35),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15, 34),
                scaledSize: new google.maps.Size(25, 25)
              };
              // Create a marker for each place.
              var marker = new google.maps.Marker({
                map: viewModel.map,
                icon: icon,
                title: place.name,
                position: place.geometry.location.toJSON(),
                address: place.formatted_address,
                infowindow: null,
                opacity: 0.5,
                status: 'unselected',
                place_id: place.place_id,
                id: viewModel.lastID.toString()
              });
              console.log('marker created, marker:', marker);
              console.log('location:', place.geometry.location.toJSON());
              viewModel.lastID += 1;
              // Create a single infowindow to be used with the place details information
              // so that only one is open at once.
              var placeInfoWindow = viewModel.placeInfoWindow;
              // Link marker with the info window
              marker.infowindow = placeInfoWindow;
              // Listeners
              // If a marker is clicked, do a place details search on it in the next function.
              marker.addListener('click', viewModel.NearbyMarkerClicked(marker));
              // listener
              marker.addListener('mouseover', viewModel.NearbyMarkerOver(marker));
              // listener
              marker.addListener('mouseout', viewModel.NearbyMarkerOut(marker));
              // Save in the array of 'nearPlaceMarkers'
              viewModel.nearPlaceMarkers.push(marker);
              // Writes the marker to the map
              marker.setMap(viewModel.map);

              console.log('create marker for nearby place, marker:', marker);
          }
          //viewModel.map.fitBounds(bounds);
      },

      /* Helper function for the next setSearchBox.
         This function will loop through the near places markers array and display
         them all. */
      showNearPlaceMarkers: function(adjustBounds) {
          console.log('in show markers', 'markers', viewModel.nearPlaceMarkers);
          if (viewModel.nearPlaceMarkers.length > 0) {
            var bounds = new google.maps.LatLngBounds();
            // Extend the boundaries of the map for each marker and display the marker
            for (var i = 0; i < viewModel.nearPlaceMarkers.length; i++) {
              viewModel.nearPlaceMarkers[i].setMap(viewModel.map);
              bounds.extend(viewModel.nearPlaceMarkers[i].position);
            }
            if(adjustBounds === true){
              viewModel.map.fitBounds(bounds);
            }
            //Limit zoom in caso of only one marker
            if (viewModel.map.getZoom() > 15) {
              viewModel.map.setZoom(15);
            }
          }
      },

      /* This function sets the SearchBox and is called via knockout bind, when the user
         clicks on the 'search for nearby new places' text box.
         When the user selects a place, it automatically (via listener) creates the array
         of nearby places. */
      setSearchBox: function() {
          console.log('in setSearchBox');
          viewModel.searchPlaces('');
          // Clear the nearPlaceMarkers array before the search
          viewModel.clearNearPlaceMarkers();
          var bounds = viewModel.map.getBounds();
          viewModel.searchBox.setBounds(bounds);
      },

      /* This function fires when the user selects "go" on the places search.
         It will do a nearby search using the entered query string or place.*/
      goSearchPlaces: function() {
          console.log('in goSearchPlaces');
          var placesToSearch = viewModel.searchPlaces();
          console.log('placesToSearch:', placesToSearch);
          var bounds = viewModel.map.getBounds();
          console.log('bounds for searching:', bounds);
          var placesService = new google.maps.places.PlacesService(viewModel.map);
          if (placesToSearch !== ''){
              placesService.textSearch({
                  query: placesToSearch,
                  bounds: bounds
              }, function(results, status) {
                  if (status === google.maps.places.PlacesServiceStatus.OK) {
                      viewModel.createMarkersForNearbyPlaces(results);
                      // Adjust the map
                      viewModel.showNearPlaceMarkers(false);
                  } else {
                      window.alert('We did not find any places matching that search!');
                  }
              });
          } else {
              window.alert('You need to enter an address for search!');
          }
      },

      /* Helper for displayDirections.
         This function will loop through the listings and hide them all.
         It is used by the displayDirections. */
      hideNearPlaceMarkers: function() {
          for (var i = 0; i < viewModel.nearPlaceMarkers.length; i++) {
            viewModel.nearPlaceMarkers[i].setMap(null);
          }
      },

      /* This function is called via knockout bind on the 'Mark a nearby place' button,
         and creates a user marker on the selected nearby place */
      createUserMarkerForNearbyPlace: function() {
          console.log('in createUserMarkerForNearbyPlace');
          var marker = '';
          for (var j = 0; j < viewModel.nearPlaceMarkers.length; j++) {
              if(viewModel.nearPlaceMarkers[j].status === 'selected'){
                  marker = viewModel.nearPlaceMarkers[j];
                  break;
              }
          }
          if (marker === ''){
              alert("Please, select a nearby place first! Click on it!");
              return;
          }
          console.log('marker:', marker);
          var lat = marker.position.lat();
          var lng = marker.position.lng();
          var address = marker.address;
          var title = marker.title;
          var place_id = marker.place_id;
          // Create a place and put in the user's place array and create the marker
          viewModel.createPlace(lat, lng, address, title, place_id);
      },


      // --- HELPER FUNCTIONS FOR RENDERING THE DOM AND THE MAP ---

      // Control the screen appearance.
      setMobile: function(data) {
          viewModel.mobile(data);
          console.log('mobile:', viewModel.mobile());
      },

      // Helper for highlight the place on the places list and markers on the map.
      highlightPlace: function(data, event) {
          console.log('at view highlightPlace, data:', data);
          //console.log('at view highlight event, event type:', event.type);
          //console.log('at view highlight, marker id:', data.marker_id());
          var placeListed = $('#' + data.marker_id());
          switch (event.type) {
            case 'mouseenter':
              //console.log('mouse enter');
              placeListed.css('background-color', '#d2cd7f');
              viewModel.highlightMarker(data.marker_id(), true);
              break;
            case 'mouseleave':
              //console.log('mouse leave');
              var markerSelected = viewModel.getSelectedMarker();
              if (markerSelected !== undefined) {
                  console.log('markerSelected:', markerSelected);
                  if (markerSelected.id !== data.marker_id()) {
                      placeListed.css('background-color', '');
                      viewModel.highlightMarker(data.marker_id(), false);
                  }
              } else {
                  placeListed.css('background-color', '');
                  viewModel.highlightMarker(data.marker_id(), false);
              }
              break;
            case 'click':
              //console.log('click');
              viewModel.selectMarker(data.marker_id());
              break;
          }
      },

      // Helper for place title edition.
      editPlaceTitle: function() {
        var marker = viewModel.getSelectedMarker();
        if(marker !== undefined){
            console.log('edit marker clicked', 'marker.id', marker.id);
            var place = viewModel.getMarkerPlace(marker);
            console.log('place obj', place);
            var old_title = place.title();
            console.log('old title', old_title);
            var title = prompt("Please enter the new place title", old_title);
            if (title !== null) {
                place.title(title);
            }
        } else {
          alert("Please select a marker");
        }
      },

      // Helper for zoom events.
      clearZoom: function (data){
          console.log('in clear zoom');
          console.log('data', data);
          if ((data.address()!=='')||(data.lat()!=='')||(data.lng()!=='')){
              data.address('');
              data.lat('');
              data.lng('');
              viewModel.showMarkers(true);
          }
      },

      setZoomAddress: function() {
          console.log('in set zoom address');
          if ((viewModel.address() !== '')||(viewModel.lat() !== '')||(viewModel.lng() !== '')){
              viewModel.address('');
              viewModel.lat('');
              viewModel.lng('');
              viewModel.showMarkers(true);
          }
          var marker = viewModel.getSelectedMarker();
          if (marker !== undefined) {
              console.log('marker:', marker);
              viewModel.address(marker.address);
              viewModel.lat(marker.position.lat());
              viewModel.lng(marker.position.lng());
          }
      },

      // Helper for route infowindows.
      renderRouteInfoWindow: function(destination_number, destination, mode) {
          console.log('in render route info window');
          var buttonDistanceInfoWindow = $('#destination' + destination_number.toString());
          buttonDistanceInfoWindow.click(function() {
              console.log('dom info window click fired');
              viewModel.displayDirections(destination, mode);
          });
      },

      // Helper for nearby places searching.
      setSearchWithinTime: function() {
          console.log('at setSearchWithinTime');
          viewModel.searchAddress('');
          viewModel.clearDistanceInfowindows();
          var marker = viewModel.getSelectedMarker();
          console.log('marker:', marker);
          if (marker !== undefined) {
              viewModel.searchAddress(marker.address);
              console.log('search address', viewModel.searchAddress());
          }
      },

      // Helper for highlight the markers of the 'new places' search.
      highlightPlaceMarker: function(marker, value){
          if (value === true){
              marker.setOpacity(1.0);
          } else {
                marker.setOpacity(0.5);
          }
      },


      // --- INIT the ViewModel ---

      init: function() {
          console.log('in octopus', 'init');
          var urlFirebase = "https://www.gstatic.com/firebasejs/4.9.1/firebase.js";
          // Init Firebase
          $.getScript(urlFirebase)
              .done(function(){
                  try{
                      viewModel.defaultApp = firebase.initializeApp(viewModel.firebaseConfig);
                      viewModel.defaultDatabase = viewModel.defaultApp.database();
                      firebase.auth().onAuthStateChanged( function(firebaseUser) {
                          viewModel.firebaseUser = firebaseUser;
                          if(firebaseUser !== null) {
                            console.log('firebaseUser',firebaseUser);
                            viewModel.isLogged(true);
                            if(viewModel.firebaseUser.email !== null){
                                console.log('firebaseUser email', firebaseUser.email);
                                viewModel.email(firebaseUser.email);
                            }
                          } else {
                            console.log('not logged in');
                            viewModel.isLogged(false);
                            console.log('firebaseUser',firebaseUser);
                          }
                      });
                  } catch (error) {
                      alert("Loading Firebase result an error: " + error);
                  }
              })
              .fail(function(jqxhr, settings, exception) {
                  console.log(jqxhr.status);
                  console.log(settings);
                  console.log(exception);
                  alert("Error on loading Firebase. Error number: " + jqxhr.status);
          });
          // Load locally stored data
          try{
              var city = localStorage.city;
              console.log('loaded local storaged city:', city);
              if(city !== undefined){
                  viewModel.city(city);
                  console.log('loaded city', viewModel.city());
              }
              var neighborhood = localStorage.neighborhood;
              console.log('loaded local storaged neighborhood:', neighborhood);
              if(neighborhood !== undefined){
                  viewModel.neighborhood(neighborhood);
                  console.log('loaded neighborhood', viewModel.neighborhood());
              }
              var places = localStorage.places;
              //alert("Places loaded");
              console.log('loaded local storaged places json:', places);
              //if(places != '[]'){
              if(places !== undefined){
                  var newPlaces = [];
                  newPlaces = JSON.parse(places);
                  viewModel.placesArrayToPlaces(newPlaces);
                  //viewModel.setPlacesJSON(places);
                  // For when finished loading, the initial loading message
                  $('#loading-browser').css("display", "inline-block");
                  setTimeout( function() {$('#loading-browser').css("display", "none");}, 5000);
                  console.log('loaded places', viewModel.places());
              } else {
                  //alert("Loading default app places...");
                  $('#loading-defaults').css("display", "inline-block");
                  setTimeout( function() {$('#loading-defaults').css("display", "none");}, 5000);
              }
          } catch (error) {
              console.log('not possible to load from local storage: ' + error);
          }
          // Initialize Map
          var urlGoogleAPIs="https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyArfeuIwGwLrR9A2ODUm3xUph780SGJZUw&v=3";
          $.getScript(urlGoogleAPIs)
              .done(function(){
                  viewModel.map = new google.maps.Map(document.getElementById('map'),
                    this.mapOptions);
                  viewModel.largeInfowindow = new google.maps.InfoWindow();
                  viewModel.placeInfoWindow = new google.maps.InfoWindow();
                  viewModel.drawingManager = new google.maps.drawing.DrawingManager({
                      drawingMode: google.maps.drawing.OverlayType.POLYGON,
                      drawingControl: true,
                      drawingControlOptions: {
                      position: google.maps.ControlPosition.TOP_LEFT,
                      drawingModes: [
                        google.maps.drawing.OverlayType.POLYGON,
                      ]
                    }
                  });
                  viewModel.directionsRenderer = new google.maps.DirectionsRenderer();
                  var box = document.getElementById('places-search');
                  viewModel.searchBox = new google.maps.places.SearchBox(box);
                  viewModel.initMap();
              })
              .fail(function(jqxhr, settings, exception) {
                  console.log(jqxhr.status);
                  console.log(settings);
                  console.log(exception);
                  alert("Error on loading Google APIs. Error number: " + jqxhr.status);
                  return;
          });

          /* This makes knockout calls the setInfoWindow function when the
             infoWebsite observable changes. This is necessary because knockout
             was not updating the radio buttons if the 'click' event was bounded. */
          viewModel.infoWebsite.subscribe(function(newValue){
              this.setNewInfoWindow(newValue);
          }, this);

      },

  };

  ko.applyBindings(viewModel);

  viewModel.init();

}());
