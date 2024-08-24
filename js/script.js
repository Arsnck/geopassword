document.addEventListener('DOMContentLoaded', function () {

    
    const mapboxAccessToken = 'pk.eyJ1IjoiYXJzYW5pY2siLCJhIjoiY2x6dXJpOTNnMGNpdDJrcHR6NHlybXN5cyJ9.AXzP-FudWZR_bCzed9rMPQ';


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
        layers: [streets],
        worldCopyJump: false, // Disable infinite scroll by duplicating the world
        maxBounds: [[-90, -180], [90, 180]], // Set bounds to prevent infinite scrolling
        maxBoundsViscosity: 1.0, // Prevent the user from panning out of bounds
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

    
    let currentMarker = null;
    let roundedLat;
    let roundedLng;

    function addMarker(latlng) {

        selectedLL = latlng;
        
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        displayLat = parseFloat(latlng.lat).toFixed(4)
        displayLng = parseFloat(latlng.lng).toFixed(4)
        roundedLat = (parseFloat(latlng.lat) + 90).toFixed(4)
        roundedLng = (parseFloat(latlng.lng) + 180).toFixed(4)

        // console.log(typeof(roundedLat));
    
        currentMarker = L.marker([latlng.lat, latlng.lng]).addTo(map)
            .bindPopup(`<b>Lat:</b> ${displayLat}<br><b>Lng:</b> ${displayLng}`)
            .openPopup();

        // Update the coordinates display in the popup
        currentMarker.getPopup().setContent(`<b>Lat:</b> ${displayLat}<br><b>Lng:</b> ${displayLng}`).openOn(map);
    }

    map.on('click', function (e) {
        addMarker(e.latlng);
    });

    document.getElementById('generate-password').addEventListener('click', function () {
        const altitude = document.getElementById('altitude').value;

        if (roundedLat && roundedLng && altitude) {
            if(roundedLat > 180 || roundedLat < 0 || roundedLng > 360 || roundedLng < 0){
                alert("Please make sure your latitude and longitude are within bounds.\nIf you are getting this error you probably scrolled too far on the map.");
            }else{
                const password = generatePassword(roundedLat, roundedLng, altitude);
                document.getElementById('password-output').textContent = password;
                showModal();
            }
        } else {
            alert("Please select a location and enter an altitude.");
        }
    });


    function lcg(seed, steps) { //Linear Congruential Generator
        
        const a = BigInt('6364136223846793005');
        const c = BigInt(1); 
        const m = BigInt('18446744073709551616'); // 2^64

       
        let x = BigInt(seed);

        for (let i = 0; i < steps; i++) {
            x = (a * x + c) % m;
        }

        return x;
    }



    function generatePassword(latitude, longitude, altitude) {
        
        // lat and lng are normalized to get rid of negative values.
        // (using absolute value would result in each pair of coordinates sharing 4 locations)

        latitude+=90;
        longitude+=180;
        console.log(latitude);
        console.log(longitude);
        // Ensure inputs are formatted correctly
        latitude*=10000;
        longitude*=10000;
        seed = parseInt("" + latitude + longitude)
        steps = parseInt(altitude, 10);

        randnum = BigInt(lcg(seed, steps))

        
        // Define a character set for the password
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+[]{}?';
        const charLen = BigInt(characters.length);
    
        // Convert the combined value to a password
        let password = '';
        while(randnum > 0){
            const index = randnum % charLen;
            password += characters[index];
            randnum = randnum / charLen;
        }

        console.log(password)
        
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
