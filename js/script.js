document.addEventListener('DOMContentLoaded', function () {
    // Replace 'your-mapbox-access-token' with your actual Mapbox token
    const mapboxAccessToken = 'hehehaha';


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

    const map = L.map('map', {
        center: [0, 0],
        zoom: 2,
        layers: [streets]
    });

    const baseLayers = {
        "Streets": streets,
        "Satellite": satellite
    };

    L.control.layers(baseLayers).addTo(map);

    const geocoder = L.Control.geocoder({
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
        
        const latlng = e.geocode.center;
        addMarker(latlng);
    })
    .addTo(map);

    let selectedLatLng;
    let currentMarker = null;

    function addMarker(latlng) {
        selectedLatLng = latlng;

        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        const roundedLat = selectedLatLng.lat.toFixed(4);
        const roundedLng = selectedLatLng.lng.toFixed(4);

        currentMarker = L.marker([selectedLatLng.lat, selectedLatLng.lng]).addTo(map)
            .bindPopup(`<b>Lat:</b> ${roundedLat}<br><b>Lng:</b> ${roundedLng}`)
            .openPopup();

        // Update the coordinates display in the popup
        currentMarker.getPopup().setContent(`<b>Lat:</b> ${roundedLat}<br><b>Lng:</b> ${roundedLng}`).openOn(map);
    }

    map.on('click', function (e) {
        addMarker(e.latlng);
    });

    document.getElementById('generate-password').addEventListener('click', function () {
        const altitude = document.getElementById('altitude').value;

        if (selectedLatLng && altitude) {
            const password = generatePassword(selectedLatLng.lat, selectedLatLng.lng, altitude);
            document.getElementById('password-output').textContent = password;
            showModal();
        } else {
            alert("Please select a location and enter an altitude.");
        }
    });

    // function generatePassword(lat, lng, altitude) {
    //     const roundedLat = lat.toFixed(4); // Round to 4 decimal places
    //     const roundedLng = lng.toFixed(4); // Round to 4 decimal places
    //     const rawString = `${roundedLat}${roundedLng}${altitude}`;
    //     return btoa(rawString); // Encode the string in base64
    // }

    function generatePassword(latitude, longitude, altitude) {
        // Ensure inputs are formatted correctly
        latitude = Math.round(parseFloat(latitude) * 10000);
        longitude = Math.round(parseFloat(longitude) * 10000);
        altitude = parseInt(altitude, 10);
        
        // Combine the values using XOR and addition
        let combinedValue = latitude ^ longitude ^ altitude;
        
        // Define a character set for the password
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
        const charactersLength = characters.length;
    
        // Convert the combined value to a password
        let password = '';
        for (let i = 0; i < 12; i++) {
            // Use modulo to get an index in the character set
            const index = Math.abs(combinedValue) % charactersLength;
            password += characters[index];
            
            // Update combinedValue for next character
            combinedValue = Math.floor(combinedValue / charactersLength);
        }
        
        return password;
    }

    function showModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = 'block';

        const closeBtn = document.querySelector('.close');
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }

    document.getElementById('copy-password').addEventListener('click', function () {
        const password = document.getElementById('password-output').textContent;

        if (password) {
            navigator.clipboard.writeText(password).then(function() {
                alert('Password copied to clipboard!');
            }, function(err) {
                console.error('Could not copy text: ', err);
            });
        } else {
            alert('No password to copy.');
        }
    });

    // Initially hide the modal
    document.getElementById('passwordModal').style.display = 'none';
});
