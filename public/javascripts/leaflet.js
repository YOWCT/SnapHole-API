   var mymap = L.map('mapid').setView([45.2502975, -76.0804332], 9);
   L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
       attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18,
       id: 'mapbox.streets',
       accessToken: 'pk.eyJ1IjoidG9tbXlkZXYiLCJhIjoiY2oxcDl6Z3R6MDFmbDJ3cGlzMG1rNTltOSJ9.znZbcJMg8q_ujLa4nv-t9w'
   }).addTo(mymap);

   var holes = [{
       "type": "Feature",
       "properties": { "size": "Republican" },
       "geometry": {
           "type": "Point",
           "coordinates": [
               [-104.05, 48.99]
           ]
       }
   }];

   L.geoJSON(holes, {
       style: function(feature) {
           switch (feature.properties.party) {
               case 'Republican':
                   return { color: "#ff0000" };
               case 'Democrat':
                   return { color: "#0000ff" };
           }
       }
   }).addTo(map);