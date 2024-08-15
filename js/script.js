document.addEventListener('DOMContentLoaded', function () {
    // Replace 'your-mapbox-access-token' with your actual Mapbox token
    const mapboxAccessToken = 'redacted';

    // Define the satellite and streets layers
    const satellite = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
        maxZoom: 20,
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© Mapbox © OpenStreetMap © Maxar'
    });

    const streets = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxAccessToken}`, {
        maxZoom: 20,
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© Mapbox © OpenStreetMap'
    });

    // Initialize the map with the streets layer
    const map = L.map('map', {
        center: [0, 0],
        zoom: 2,
        layers: [streets] // Default layer
    });

    // Layer control to switch between Satellite and Streets
    const baseLayers = {
        "Streets": streets,
        "Satellite": satellite
    };

    L.control.layers(baseLayers).addTo(map);

    // Add geocoder (search control)
    L.Control.geocoder({
        defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]).addTo(map);
        map.fitBounds(poly.getBounds());
        
        // Add marker at the geocoded location
        const latlng = e.geocode.center;
        addMarker(latlng);
    })
    .addTo(map);

    let selectedLatLng;
    let currentMarker = null;

    // Function to add marker and remove previous ones
    function addMarker(latlng) {
        selectedLatLng = latlng;

        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        currentMarker = L.marker([selectedLatLng.lat, selectedLatLng.lng]).addTo(map);
    }

    map.on('click', function (e) {
        addMarker(e.latlng);
    });

    document.getElementById('generate-password').addEventListener('click', function () {
        const altitude = document.getElementById('altitude').value;

        if (selectedLatLng && altitude) {
            const password = generatePassword(selectedLatLng.lat, selectedLatLng.lng, altitude);
            document.getElementById('password-output').textContent = password;
        } else {
            alert("Please select a location and enter an altitude.");
        }
    });

    function generatePassword(lat, lng, altitude) {
        const rawString = `${lat.toFixed(3)}${lng.toFixed(3)}${altitude}`;
        return btoa(rawString); // Encode the string in base64
    }
});
