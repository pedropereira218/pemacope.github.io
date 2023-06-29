var map;
var geojsonLayer;

function mapCreate(listDisasters){

    map = L.map('map', {
        zoomControl: false, // Remove Zoom button from map
        center: [20,0], // Define center of the map. LatLng
        zoom: 3, // Define map zoom
    })
    
    // Make country names show up on top of polygons and markers
    var labels = map.createPane('labels');

    labels.style.zIndex = 650;
    labels.style.pointerEvents = 'none';

    // CartoDB basemap without labels
    var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        subdomains: 'abcd',
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    }).addTo(map);

    // CartoDB only the labels
    var positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        pane: 'labels'
    }).addTo(map);

    // ---------------------------------------------------------------------------------------------------------------------------

    geojsonLayer = L.geoJSON(countriesGeoJSON, {
        // Applies styles by cycling through features
        style: function(feature){
            // Cycle through list of disasters
            for (var i = 0; i < listDisasters.length; i++){
                // Cycle through countries in disasters
                for(var j = 0; j < listDisasters[i].fields.country.length; j++){
                    // If countries match
                    if (feature.properties.ISO_A3.toLowerCase() == listDisasters[i].fields.country[j].iso3){
                        // Add key disaster information to features
                        feature.properties.date = listDisasters[i].fields.date.event;
                        feature.properties.description = listDisasters[i].fields.description;
                        feature.properties.title = listDisasters[i].fields.name;
                        feature.properties.type = listDisasters[i].fields.primary_type.name;
                        feature.properties.url = listDisasters[i].fields.url;

                        // Add property to geojson object and colour accordingly
                        feature.properties.activeDisaster = "ongoing";
                        let colour = "#EB0734";
                        // Check if status is alert or ongoing
                        if (listDisasters[i].fields.status == "alert"){
                            feature.properties.activeDisaster = "alert";
                            colour = "#FFA500";
                        }
                        // Style for countries with ongoing or alert disaster
                        return {
                            color: colour,
                            fillOpacity: 0.8,
                            weight: 2
                        }
                    }
                }
            }
            // Style for all others
            return{
                fillColor: "green",
                color: "#7bba78",
                weight: 2
            }
        },
        // Add functionality to each feature (loops through all features)
        onEachFeature: function(feature, layer) {
            if (feature.properties.activeDisaster == "ongoing" || feature.properties.activeDisaster == "alert"){
                layer.on({
                    mouseover: highlightAndTitle,
                    mouseout: resetHighlight,
                    click: displayDisasterInfo
                });
            }
        }
    }).addTo(map);
    
    // Static legend to the map explaing country's disaster status
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend');
        div.innerHTML += '<b>Countries by Disaster status </b> <br>';
        div.innerHTML += '<i style="background:#EB0734"></i> Ongoing Disaster <br>';
        div.innerHTML += '<i style="background:#FFA500"></i> On Disaster Alert <br>';
        div.innerHTML += '<i style="background:#7bba78"></i> No Ongoing Disaster';
        return div;
    };

    legend.addTo(map);

    // Dynamic legend with the title of disaster currently being hovered over
    var hoverTitle = L.control({position: 'topleft'});

    hoverTitle.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend');
        div.innerHTML += '<p id="hoverTitle"></p>';
        div.innerHTML += '<p id="hoverInfo" style="display: none">Click on a country for more info!</p>';
        return div;
    };

    hoverTitle.addTo(map);

    // Static legend with onclick to go back to home page
    var homeLegend = L.control({position: 'topright'});

    homeLegend.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend');
        div.innerHTML += "<b> Return to home page</b>";
        div.onclick= backHome;
        div.style="cursor: pointer;"
        return div;
    };

    homeLegend.addTo(map);
}

function backHome(){
    window.location.href="index.html";
}

// Map interaction functions --------------------------------------------------------------------------------------

function updateMap(listDisasters){
    //Update disaster information
    geojsonLayer.eachLayer(function(layer) {
        // Cycle through list of disasters
        for (var i = 0; i < listDisasters.length; i++){
            // Cycle through countries in disasters
            for(var j = 0; j < listDisasters[i].fields.country.length; j++){
            // If countries match
                if (layer.feature.properties.ISO_A3.toLowerCase() == listDisasters[i].fields.country[j].iso3){
                    // Add key disaster information to features
                    layer.feature.properties.date = listDisasters[i].fields.date.event;
                    layer.feature.properties.description = listDisasters[i].fields.description;
                    layer.feature.properties.title = listDisasters[i].fields.name;
                    layer.feature.properties.type = listDisasters[i].fields.primary_type.name;
                    layer.feature.properties.url = listDisasters[i].fields.url;

                    // Add property to geojson object and colour accordingly
                    layer.feature.properties.activeDisaster = "ongoing";
                    let colour = "#EB0734";
                    // Check if status is alert or ongoing
                    if (listDisasters[i].fields.status == "alert"){
                        layer.feature.properties.activeDisaster = "alert";
                        colour = "#FFA500";
                    }
                    // Style for countries with ongoing or alert disaster
                    layer.setStyle ({
                        color: colour,
                        fillOpacity: 0.8,
                        weight: 2
                    });
                    return;
                }
            }
        }
        layer.setStyle ({
            fillColor: "green",
            color: "#7bba78",
            weight: 2
        });
    });
}

function highlightAndTitle(e){
    
    highlightFeature(e);
    displayTitle(e);
}

function highlightFeature(e) {
    let layer = e.target;

    //General style for highlighting
    layer.setStyle({
        weight: 5,
        fillOpacity: 0.6
    });

    // Highlight colour based on disaster 
    if (layer.feature.properties.activeDisaster == "ongoing"){
        layer.setStyle({
            color: "#EB0734"
        })
    }
    else{
        layer.setStyle({
            color: '#FFA500',
        });
    }

    layer.bringToFront();
}

function displayTitle(e){
    let feature = e.target.feature

    document.getElementById("hoverTitle").innerHTML = "<b>" + feature.properties.title + "</b>";
    document.getElementById("hoverInfo").style.display= "block";
}

// Function to reset changes in style made by hover
function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
}

function displayDisasterInfo(e){
    openModal();
    let feature = e.target.feature;

    document.getElementById("disasterInfo").innerHTML = '<b>' + feature.properties.title + '</b><br>';
    document.getElementById("disasterInfo").innerHTML += '<p> Date of start: ' + formatDate(feature.properties.date) + '</p>';
    document.getElementById("disasterInfo").innerHTML += '<p> Disaster type: ' + feature.properties.type + '</p>';
    document.getElementById("disasterInfo").innerHTML += '<p> Country: ' + feature.properties.ADMIN + '</p>';
    document.getElementById("disasterInfo").innerHTML += '<p> Disaster description: ' + feature.properties.description + '</p>';
    document.getElementById("disasterInfo").innerHTML += '<p> Full UN article : <a target="_blank" href=' + feature.properties.url + '>' + feature.properties.title + '</a></p>';
}

// End of map interaction functions --------------------------------------------------------------------------------------

function formatDate(dateString){
    // 2022-05-10T00:00:00+00:00
    date = dateString.slice(0,10)

    return date.slice(8,10) + date.slice(4,7) + '-' + date.slice(0,4)
}


// Start of modal functions --------------------------------------------------------

function openModal(){
    document.getElementById("disasterModal").style.display = "block";
}

function closeModal(){
    document.getElementById("disasterModal").style.display = "none";
}

window.onclick = function(e){
    if(e.target == document.getElementById("disasterModal")){
        document.getElementById("disasterModal").style.display = "none";        
    }
}

// End of modal functions --------------------------------------------------------

function reliefWeb(){
    let firstTime = 0;
    //let defines a variable to only exist within this scope
    let xhttp = new XMLHttpRequest(); 

    //To set the parameters in the http request
    let parameters = {
       limit: 1000, // Number of results to return. Can be between 0 and 1000
       offset: 0, //Number of results to skip. Must be greater than 0, defaults to 0.
       sort: ["date.event:desc"], //Sorts the result by specified field. Can be asc or desc
       //profile: "full", // Can be minimal, full or list. Minimal returns only title and name field, Full returns all fields and List is similar to Full only it doesn't return as many fields
       fields: { //Specifies fields to include in the response. Can have an include or exclude field that can contain lists of fields to include or exclude, respectively
           "include": [
                "country",
                "date.event",
                "description",
                "status",
                "name",
                "primary_type.name",
                "url"
            ]
       },
       query:{
          "value": '\"ongoing\"\"alert\"',
          "fields": ["status"],
          "operator": "OR" // Default value is or. Can be AND or OR depending on how space in value field should be interpreted
       },
       //Additional parameters exist but are not used due to not being useful or necessary
    }

    //Turn JavaScript object into JSON string
    let paramJson = JSON.stringify(parameters)

    //HTTP Request URL
    let url = "https://api.reliefweb.int/v1/disasters"

    //True makes the request asynchronous
    xhttp.open("POST", url, true);
    //Send form data with the POST request
    xhttp.send(paramJson);

    //onreadystatechange allows a function to be executed when Ajax retrieves an answer
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //Transform response from JSON to JavaScript object
            let res = JSON.parse(this.responseText);
            
            //List of disasters without the variables concerning to the HTTP request
            let listDisasters = res["data"];

            if(firstTime == 0){
                firstTime = 1
                mapCreate(listDisasters);
            }
            else{
                updateMap(listDisasters);
            }
        }
    };

    //Update every 90 seconds function
    setInterval(function() {
        //True makes the request asynchronous
        xhttp.open("POST", url, true);

        xhttp.send(paramJson)
    }, 90000);
}