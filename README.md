# Neighborhood Map Application

This project is an exercise as part of the **Full Stack Web Developer Nanodegree**, by **Udacity**. It is a single page application featuring a map of a neighborhood. It provides a way for the user creates 'markers' for places of interest, and query for third-party information about these places, as Google Street View, Google Places and Wikipedia. The user's markers list can be saved at browser cache, locally, or at the cloud, in a remote Firebase database.

The application provides several functionalities, like creating a title for the user places, filtering the place list and corresponding markers showing on the map, drawing a shape and get the area, zoom to a location from the address entered or by the marker selected, zoom to a location by its coordinates, get the coordinates of a location based on its place marker, querying for routes to user markers within some time by some transport mode with several options, querying for new places (like restaurants) that are nearby, and querying for the routes to these new places starting from the user marker selected.

So, there are a lot of options for exploring the neighborhood, discovering new places, making a marker for these places and saving these markers locally or in the external database! 📁

The program uses:

a) **Google Maps JavaScript API** (<https://developers.google.com/maps/documentation/javascript>) for creating the map, plotting the markers, querying for routes and coordinates of places, and drawing.

b) **Wikipedia's web service API** (<https://www.mediawiki.org/wiki/API:Main_page>) to get additional information about the places.

c) **Firebase** (<https://www.firebase.google.com>) to save the place markers in the external database, with authentication by email and password. It is necessary to sign up for an account in the app, with an exclusive password. It was the sign method selected, but there are other options at **Firebase** that were not implemented in the app at the moment.

d) **Knockout** (<http://knockoutjs.com>) framework to create a rich, responsive display interface, in the events that belongs mainly to the text and button elements.

e) **JQuery** (<https://jquery.com/>) for making **AJAX** requests to third party servers, to obtain information about the places. Specifically, it queries the **MediaWiki API** (<https://www.mediawiki.org/wiki/API:Main_page>).


# Installation

* Just copy the `.html` file and the `css` and `js` folders in the same directory, and open the `.html` file with an internet browser.

* For developers, it is necessary to get a **Google Maps API key** (<https://console.developers.google.com>). You may include the key as the value of the `key` parameter when loading the script in the app.js via **AJAX**, setting the `urlGoogleAPIs` variable inside the `viewModel.init` function. For users, the app already has a `key` temporarily saved for evaluation purposes.

* For developers, it is also necessary to get the **Firebase** configuration file (<https://www.firebase.google.com>) and copy and paste the `firebaseConfig` global variable inside the `viewModel`. This configuration has an `apiKey` and `projectId`, so you need to create a project at your **Firebase** account. For users, the app already has a configuration temporarily saved for evaluation purposes.


# Common usage

Well, there are a lot of things you can do with this single page app! 😮

**When the app loads**: When the app loads, it tries to load data (places marked by the user and the city and neighborhood) saved locally at the browser cache. For saving, this option needs to be allowed by the browser configuration. If there is no data, or isn't possible loading, the app will use its internally programmed places.

**Adapting for mobile**: The screen shows the `map` area at the right and the `option box` at the left. You can toggle the view size by clicking on the hamburger menu icon in the upper right corner of the `option box`. This will make the size of the `option box` shrinks.

**Going to a neighborhood**: You can enter the city and the neighborhood, click `Go` and the map go to there!

**Adding a marker to a place**: First, you need to check the `For adding new places (markers)` box. The mouse will change its icon. Goes to a place on the map and right click.

**Selecting a marker**: If you click the place's icon, it will turns in `red` 🔴 showing that the marker is selected. If the icon is `blue` 🔵, this means that the marker is not selected. You can also select a place by clicking on the `place list` at the `option box`. Each place in the place list will highlight and so the corresponding marker! All the information that will automatically populate the `option box`, like the address for zooms, or for querying routes, will refer to the marker selected.

**Viewing information about the place**: Just select the marker (click on it or on the list, until it turns 🔴) and it will open a window showing information. The source of information can be selected in the `option box`: `Google Street View`, `Google Places`, `Wikipedia`.

**Measuring the size of the terrain**: You can click on the `Drawing Tools` button to toggle the mouse for drawing. After that, just click once, on the map, to make the first point of the polygon. Continue drawing and clicking to make points, until you close the polygon clicking again on the first point created. It will open a window with the coordinates and the area.

**Zoom to the area**: You can enter the address, or the latitude and longitude. If you select a marker, and after that, click inside the address box (at the left of the `Zoom` button), it will copy the address of the marker inside the box. Then, just click `Zoom` button. If you deselect the marker, and click again in the address box, it will automatically clear! This is a pattern of the app: when the marker is selected, its address is copied; when there is no marker selected, just click in the box for clearing it. 👌

**Getting coordinates of an location**: Well, just create a marker, select it and click in the address box for `Zoom`. It will copy the address and also the geo-coordinates.

**Searching for new places**: You can search for places based upon their activities, as restaurants, movie theaters, bars, etc..  Just enter the type of the place at the box below the `Search for nearby new places` and select the place type from the list box. It will query for places and show them on the map, with icons. If you don't select from the box list, you can type the text and click the `Go` button for a searching without the help of the searching list box.

**Querying more information for the new place**: If you click on an icon of a nearby place, like a restaurant, for example, you will see a window showing information from `Google Places`, `Google Street View`, or `Wikipedia`, according to the option selected by user in `option box`, that can be selected below the `Explore your places list with`.

**Marking a nearby place (favorite it)**: If you would like to turn that nearby searched place one of your favorite places list, just click the `Mark a nearby place` button, in the `options box`, and you will create a marker for that place. This will be your personalized marker which will automatically link to the place information. It will be shown in your places list, and will be saved together.

**Editing your marker title**: Select the marker and click on the `Edit Title` button. Enter the new title in the window that will open.

**Showing routes to places**: You can choose the time period and the transport mode to achieve a place (🔵 marker) or a nearby searched places (transparent icons) starting from a selected marker, address, or even a nearby place. Just select a marker or a nearby place (will be the place of origin), click on the address box below the `Show ⚪Markers ⚪Nearby places` title to set the origin address, choose the time and transport mode, select the destination in the `Show ⚪Markers ⚪Nearby places`, and click `Go`. It will open an little information box for each marker or new places that are in the range. If you click on the `View Route` button, it will show the route! 😮
To return to the last state, click on the `Clear Routes` button on the `options box`. Now, the screen will return to that point with the little information windows chosen. You can view route for another place, or just deselect the marker or icon (the place of origin) for clearing the information windows. If with the marker or icon unselected, you click on the address box, the address box will also clear.

**Saving in an external database**: First, sign up to create an account, using your email and a password that you must create exclusively for the app. Just enter the email and password and click `Sign up` button. If it succeeds in login you in, it will show a `Logged` word in the `option box`, near the new `Logout` button. When you are logged, just click the `Save` button to save! And the `Load` to restore your places saved! This will contact the **Firebase** external database for the operations.

That's it!

I hope you use the app for studying purposes, but it is worth in saying that the app can always be improved. The console logs were not commented to catch for any uncovered error.
But, I hope you find interesting places in your neighborhood, like a sushi restaurant that I've found near my home, which I didn't know was there! 🍣


* This app is for learning purposes. 📚


# Credits

**These are some useful links, in addition to Udacity itself, that were queried in this project**:

https://developers.google.com/maps/documentation/javascript/events?hl=pt-br

https://firebase.google.com/docs/database

https://firebase.google.com/docs/database/web/read-and-write

http://knockoutjs.com/documentation/introduction.html

http://knockoutjs.com/documentation/observables.html

http://knockoutjs.com/documentation/click-binding.html

http://knockoutjs.com/documentation/checked-binding.html

http://knockoutjs.com/documentation/value-binding.html

https://www.mediawiki.org/wiki/API:Main_page

https://www.w3schools.com

https://www.w3schools.com/howto/howto_css_browser_window.asp

https://www.w3schools.com/js/js_object_constructors.asp

http://www.javascriptkit.com/jsref/eventkeyboardmouse.shtml

https://developer.mozilla.org/pt-BR/docs/Web/Guide/Events/criando_e_disparando_eventos

http://api.jquery.com/jQuery.ajax/

https://stackoverflow.com/questions/2730929/how-to-trigger-the-onclick-event-of-a-marker-on-a-google-maps-v3

https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript

https://stackoverflow.com/questions/35026964/what-is-wrong-with-my-foursquare-api-call

https://stackoverflow.com/questions/15839169/how-to-get-value-of-selected-radio-button

https://stackoverflow.com/questions/15551779/open-link-in-new-tab-or-window

https://stackoverflow.com/questions/8423217/jquery-checkbox-checked-state-changed-event

https://stackoverflow.com/questions/5225597/set-timeout-for-ajax-jquery

https://stackoverflow.com/questions/16310423/addeventlistener-calls-the-function-without-me-even-asking-it-to

https://stackoverflow.com/questions/10126812/knockout-js-get-dom-object-associated-with-data

https://stackoverflow.com/questions/17314610/knockoutjs-when-checked-data-binding-call-function

*Firebase videos:*

https://youtu.be/WacqhiI-g_o

https://youtu.be/k1D0_wFlXgo

https://youtu.be/sKFLI5FOOHs

https://youtu.be/-OKrloDzGpU

Thank you!
