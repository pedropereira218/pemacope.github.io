var geojsonLayer;

function mapCreate(){

    var map = L.map('map', {
        zoomControl: false, // Remove Zoom button from map
        center: [20,0], // Define center of the map. LatLng
        zoom: 3, // Define map zoom
    })

    // ---------------------------------------------------------------------------------------------------------------------------

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
        // Add functionality to each feature (loops through all features)
        style: function(feature, layer) {
            for(var i = 0; i < disByCountry.length; i++){
                if (disByCountry[i].ISO == feature.properties.ISO_A3){
                    feature.properties.disInfo = disByCountry[i];
                }
            }
            if(feature.properties.hasOwnProperty("disInfo") == false){
                return{
                    color: "#999999",
                    fillOpacity: 1,
                    weight: 0.5
                }
            }

            let grades = getGrades("No_Disasters");
            colour = getColor(feature.properties.disInfo.No_Disasters, grades);
            return{
                fillColor: colour,
                fillOpacity: 1,
                weight: 1
            }

        },
    }).addTo(map);

    // Static legend to the map explaining country's disaster status
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend');
        div.id = "legend";
        div.innerHTML += '<b>No. Disasters </b><br>';
        div.innerHTML += '<i style="background:#042649"></i> <span> 601-1200</span> <br>';
        div.innerHTML += '<i style="background:#08519c"></i> <span> 251-600 </span><br>';
        div.innerHTML += '<i style="background:#3182bd"></i> <span> 121-250 </span><br>';
        div.innerHTML += '<i style="background:#6baed6"></i> <span> 51-120 </span><br>';
        div.innerHTML += '<i style="background:#bdd7e7"></i> <span> 0-50 </span><br>';
        div.innerHTML += '<i style="background:#999999"></i> N/A';
        return div;
    };

    legend.addTo(map);    

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

function updateMapMetric(){
    // Get metric from input with id metric
    metric = document.getElementById("metric").value;

    //Change bottom right legend visually
    applyScale(metric, getGrades(metric));

    // Change colour of countries given metric
    geojsonLayer.eachLayer(function(layer) {
        if(layer.feature.properties.hasOwnProperty("disInfo") == true){
            colour = getColor(layer.feature.properties.disInfo[metric], getGrades(metric));
            layer.setStyle({
                fillColor: colour
            })
        }
    });
}

// Retrieve colour of country based on its value for the set metric
function getColor(metric,grades){
    return metric < grades[1]  ?  "#bdd7e7"
            : metric < grades[2] ? "#6baed6"
            : metric < grades[3] ? "#3182bd"
            : metric < grades[4]  ?  "#08519c"
            : "#042649";
}

// Original equal step getGrades
/*
function getGrades(metric){    
    return metric == "No_Disasters"  ? [0, 240, 480, 720, 960, 1200] 
            : metric == "Total_Deaths" ? [0, 2600000, 5200000, 7800000, 10400000, 13000000] 
            : metric == "Total_Affected" ? [0, 700000000, 1400000000, 2100000000, 2800000000, 3500000000]
            : metric == "Total_Damages_(000_US)" ? [0, 480000000, 960000000, 1440000000, 1920000000, 2400000000]
            : [];
}
*/

// Grades function manually adjusted to be more helpful
function getGrades(metric){    
    return metric == "No_Disasters"  ? [0, 50, 120, 250, 600, 1200] 
            : metric == "Total_Deaths" ? [0, 50000, 500000, 2000000, 520000, 13000000] 
            : metric == "Total_Affected" ? [0, 1000000, 4000000, 1200000, 2100000000, 3500000000]
            : metric == "Total_Damages_(000_US)" ? [0, 120000000, 240000000, 480000000, 960000000, 2400000000]
            : [];
}

// Function responsible for changing the map scale visually given the metric and grades
function applyScale(metric, grades){
    document.getElementById("legend").getElementsByTagName("b")[0].innerHTML = metric.replaceAll("_", " ");
    listSpan = document.getElementById("legend").getElementsByTagName("span");

    for (var i = 0; i < listSpan.length; i++){
        listSpan[i].innerHTML = (grades[grades.length - (i+2)] + 1).toLocaleString()  + "-" + (grades[grades.length - (i+1)]).toLocaleString();
    }
}


// Styling functions ------------------------------------------------------------------------------

// Function responsible for opening and closing sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}