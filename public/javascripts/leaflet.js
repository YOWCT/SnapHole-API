var holes = [];
$.get("/map/json", function(data) {
    console.log(data)
    holes = data;

    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.size) {
            layer.bindPopup(feature.properties.size);
        }
    }
    var greenIcon = L.icon({
        iconUrl: '/images/pin.png',
        shadowUrl: '/images/pin.png',
        iconSize: [38, 95], // size of the icon
        shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62], // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    var mymap = L.map('mapid').setView([45.2502975, -76.0804332], 9);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoidG9tbXlkZXYiLCJhIjoiY2oxcDl6Z3R6MDFmbDJ3cGlzMG1rNTltOSJ9.znZbcJMg8q_ujLa4nv-t9w'
    }).addTo(mymap);
    L.geoJSON(holes, {
        filter: function(feature, layer) {
            return feature.properties.show_on_map;
        }
    }, ).addTo(mymap);

    L.geoJSON(holes, {
        onEachFeature: onEachFeature
    }).addTo(mymap);
});