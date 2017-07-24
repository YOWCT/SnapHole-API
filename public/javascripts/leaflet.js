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
    var icon = L.icon({
        iconUrl: '/images/dot.png',
        iconRetinaUrl: '/images/dot.png',
        iconSize: [20, 20],
        iconAnchor: [9, 10],
        popupAnchor: [1, -4],
        shadowUrl: '/images/dot.png',
        shadowSize: [0, 0]
    });
    var mymap = L.map('mapid').setView([45.2502975, -76.0804332], 9);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoidG9tbXlkZXYiLCJhIjoiY2oxcDl6Z3R6MDFmbDJ3cGlzMG1rNTltOSJ9.znZbcJMg8q_ujLa4nv-t9w'
    }).addTo(mymap);
    L.geoJSON(holes, {
        pointToLayer: function(feature, layer) {
            console.log(layer, feature);
            return L.marker(layer, {
                icon: icon
            });
        },
        onEachFeature: onEachFeature
    }).addTo(mymap);
});