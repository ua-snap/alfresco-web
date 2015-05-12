require = require || requirejs;

// Set the require.js configuration for your application.
require.config({
    deps: [
        "main"
    ],
    paths: {
        jquery: "../../bower_components/jquery/dist/jquery",
        jsoneditor: "../../bower_components/jsoneditor/dist/jsoneditor.min",
        leaflet: "../../bower_components/leaflet/dist/leaflet",
        "leaflet-src": "../../bower_components/leaflet/dist/leaflet-src",
        mapbox: "../../bower_components/mapbox.js/mapbox",
        proj4: "../../bower_components/proj4/dist/proj4"
    },
    shim: {

    },
    packages: [

    ]
});
