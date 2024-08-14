document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map
    const map = L.map('map').setView([0, 0], 2); // Centered on the world

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let selectedLatLng;
    let currentMarker = null; // Reference to the current marker

    map.on('click', function (e) {
        selectedLatLng = e.latlng;

        // Remove the existing marker if it exists
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Add a new marker at the selected location
        currentMarker = L.marker([selectedLatLng.lat, selectedLatLng.lng]).addTo(map);
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
        // Simple example of combining the values (can be replaced with a more complex hash function)
        const rawString = `${lat.toFixed(6)}${lng.toFixed(6)}${altitude}`;
        return btoa(rawString); // Encode the string in base64
    }
});
