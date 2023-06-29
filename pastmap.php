<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>Past Disasters Map</title>

	<!-- Leaflet CSS -->
	<link rel="stylesheet" href="leaflet/leaflet.css">
	<!-- Leaflet javascript -->
	<script src="leaflet/leaflet.js"></script>
	
	<!--External link to page's CSS-->
	<link rel="stylesheet" href="css/pastmap.css">
</head>
<body onload="mapCreate();">
	<?php
		// Using define makes the variable contants
		define('DB_SERVER', 'localhost');
		define('DB_USERNAME', 'root');
		define('DB_PASSWORD', '');
		define('DB_NAME', 'project');
		 
		$conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

		if($conn === false){
		    die("ERROR: Could not connect. " . mysqli_connect_error());
		}

		// Get records from table AND relevant fields (back ticks for column with space)
		$listDisastersByCountry = array();

		$res = $conn->query("
			SELECT 
				`Country`,`ISO`, COUNT(`Disaster No`) AS `No_Disasters`,SUM(`Total Deaths`) AS `Total_Deaths`,SUM(`Total Affected`) AS `Total_Affected`,SUM(`Total Damages Adjusted (000 US)`) AS `Total_Damages_(000_US)`
			FROM 
				disasters 
			GROUP BY
				`ISO`
			");

		if ($res->num_rows > 0){
			while($row = $res->fetch_assoc()) {
				array_push($listDisastersByCountry,$row);
			}
		}
	?>

	<div class="sidebar active">
		<h3 class="settings">Settings</h3>
		<hr class="rounded">
		<form class="form">
			<label for="metric">Metric:</label>
			<select id="metric" name="metric">
				<option value="No_Disasters">Number of Disasters</option>
				<option value="Total_Deaths">Total deaths</option>
				<option value="Total_Affected">Total affected</option>
				<option value="Total_Damages_(000_US)">Total Damages</option>
			</select>
			<input type="button" id="btnMetric" name="btnMetric" value="Change Metric" onclick="updateMapMetric();">
		</form>
		<div class="toggle-btn" onclick="toggleSidebar();">
			<span>&#9776;</span>
		</div>
	</div>

	<div id="map"></div>

	<script type="text/javascript">
		// Global variable that has to be set here so the php works
		var disByCountry = <?php echo json_encode($listDisastersByCountry) ; ?>;
	</script>

	<!--External link to page's JS-->
	<script type="text/javascript" src="js/countries.js"></script>
	<script type="text/javascript" src="js/pastmap.js"></script>
	
</body>
</html>