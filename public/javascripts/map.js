// ==== set up global variables ====
let travelData;
let tr_lat; // bounds: ne-latitude
let tr_lng; // bounds: ne-longitude
let bl_lat; // bounds: sw-latitude
let bl_lng; // bounds: sw-longitude
let currentPosition_lat;
let currentPosition_lng;

// ==== map styles ====
const myStyle = [
  {
    featureType: "all",
    elementType: "all",
    stylers: [
      {
        saturation: "32",
      },
      {
        lightness: "-3",
      },
      {
        visibility: "on",
      },
      {
        weight: "1.18",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [
      {
        visibility: "on",
      },
    ],
  },
  {
    featureType: "landscape",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "landscape.man_made",
    elementType: "all",
    stylers: [
      {
        saturation: "-70",
      },
      {
        lightness: "14",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [
      {
        saturation: "100",
      },
      {
        lightness: "-14",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
      {
        lightness: "12",
      },
    ],
  },
];

// ==== init map ========================================
function initMap() {
  // ======= get the page counter  ========
  function getPageCounter() {
    axios
      .get("/api/pagecounter")
      .then(function (response) {
        // ===== handle success ======
        console.log(response.data);
        pageCounter.innerHTML = response.data
          ? response.data.pageCounter
          : null;
      })
      .catch(function (error) {
        // ==== handle error =====
        console.log(error);
      });
  }

  // ======= get the weather  ========
  function getWeather(lat, lng) {
    axios
      .get("/api/weather", {
        params: {
          q: lat + "," + lng,
        },
      })
      .then(function (response) {
        // ===== handle success ======
        console.log("weather: ", response?.data?.current?.temp_c);
        // ===== weather condition =====
        weather.innerHTML = `${response?.data?.current?.temp_c}°C, ${response?.data?.current?.condition?.text}`;
      })
      .catch(function (error) {
        // ==== handle error =====
        console.log(error);
      });
  }

  // ======= get the restaurants information  ========
  function getRestaurants(tr_lat, tr_lng, bl_lat, bl_lng) {
    // === add the restaurants to the map ====
    function addMarker(prop) {
      var marker = new google.maps.Marker({
        position: prop.coordinates, // Passing the coordinates
        map: map, // Map that we need to add
        draggarble: false, // If set to true you can drag the marker
      });

      if (prop.iconImage) {
        marker.setIcon(prop.iconImage);
      }
      if (prop.content) {
        var information = new google.maps.InfoWindow({
          content: prop.content,
        });

        marker.addListener("click", function () {
          information.open(map, marker);
        });
      }
    }

    // ==== fetch data from the server side =====
    axios
      .get("/api/travel", {
        params: {
          tr_lat: tr_lat,
          tr_lng: tr_lng,
          bl_lat: bl_lat,
          bl_lng: bl_lng,
        },
      })
      .then(function (response) {
        // ====== handle success ======
        travelData = response.data;
        console.log("travelData data: ", travelData);

        // ===== display restaurants information ==========================
        restaurants.innerHTML = null; //clear last display
        // ===== display top5 restaurants information =====
        travelData?.restaurants_num_reviews.map((place, idx) => {
          const item = document.createElement("a");
          item.innerHTML = `${idx + 1}#: ${place.num_reviews}, ${place.name}`;
          item.className = "restaurants-rating";
          item.href = `${place.website}`;
          item.target = "_blank";
          restaurants.appendChild(item);
        });

        // ===== place top5 restaurants_num_reviews markers on Map ====
        if (travelData?.restaurants_num_reviews?.length > 4) {
          for (let idx = 0; idx < 5; idx++) {
            const place = travelData?.restaurants_num_reviews[idx];
            // ===== place restaurants_num_reviews markers on Map ====
            addMarker({
              coordinates: {
                lat: Number(place?.latitude),
                lng: Number(place?.longitude),
              },
              iconImage: `images/r${idx + 1}.png`,
              content: `<p>${place?.num_reviews}: ${place?.name}</p>`,
            });
          }
        } else {
          for (
            let idx = 0;
            idx < travelData?.restaurants_num_reviews?.length;
            idx++
          ) {
            const place = travelData?.restaurants_num_reviews[idx];
            // ===== place restaurants_num_reviews markers on Map ====
            addMarker({
              coordinates: {
                lat: Number(place?.latitude),
                lng: Number(place?.longitude),
              },
              iconImage: "images/starred1.png",
              content: `<p>${place?.num_reviews}: ${place?.name}</p>`,
            });
          }
        }

        // ==== display attractions information==========================
        attractions.innerHTML = null; //clear last display
        travelData?.attractions_num_reviews.map((place, idx) => {
          // ===== display restaurants information =====
          const item = document.createElement("a");
          item.innerHTML = `${idx + 1}#: ${place.num_reviews}, ${place.name}`;
          item.href = `${place.website}`;
          item.target = "_blank";
          item.className = "attractions-rating";
          attractions.appendChild(item);
        });

        // ===== place top5 attractions_num_reviews markers on Map ====
        if (travelData?.attractions_num_reviews?.length > 4) {
          for (let idx = 0; idx < 5; idx++) {
            const place = travelData?.attractions_num_reviews[idx];
            // ===== place restaurants_num_reviews markers on Map ====
            addMarker({
              coordinates: {
                lat: Number(place?.latitude),
                lng: Number(place?.longitude),
              },
              iconImage: `images/b${idx + 1}.png`,
              content: `<p>${place?.num_reviews}: ${place?.name}</p>`,
            });
          }
        } else {
          for (
            let idx = 0;
            idx < travelData?.attractions_num_reviews.length;
            idx++
          ) {
            const place = travelData?.attractions_num_reviews[idx];
            // ===== place restaurants_num_reviews markers on Map ====
            addMarker({
              coordinates: {
                lat: Number(place?.latitude),
                lng: Number(place?.longitude),
              },
              iconImage: "images/starblack.png",
              content: `<p>${place?.num_reviews}: ${place?.name}</p>`,
            });
          }
        }
      })
      .catch(function (error) {
        // ==== handle error ====
        console.log(error);
      });
  }

  // ===== initialize Google Maps =====
  const map = new google.maps.Map(document.getElementById("map"), {
    // default center
    center: { lat: -27.477337, lng: 153.028441 },
    zoom: 14,
    mapTypeControl: false,
    styles: myStyle,
  });

  // == get the location: input
  const input = document.getElementById("pac-input");
  const options = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
    zoom: 14,
  };

  // == use autocomplete to get the location
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");
  // == restaurants in html
  const restaurants = document.getElementById("restaurants");
  // == attractions in html
  const attractions = document.getElementById("attractions");
  // == page counter in html
  const pageCounter = document.getElementById("pageCounter");
  // == weather in html
  const weather = document.getElementById("weather");
  autocomplete.bindTo("bounds", map);

  infowindow.setContent(infowindowContent);

  // ====== refresh the page and then fetch the page counter =======
  getPageCounter();

  // ====== place change listener ======
  autocomplete.addListener("place_changed", () => {
    //=== clear last display and display 'loading' ====
    restaurants.innerHTML = "<p>Loading ...... </p>";
    attractions.innerHTML = "<p>Loading ...... </p>";

    infowindow.close();
    //=== get the coordinates of the current location
    const place = autocomplete.getPlace();

    // ====== fetch the restaurants data =======
    // Create a bounding box with sides ~1km away from the center point
    const dot = 0.015;
    tr_lat = place.geometry.location.lat() + dot;
    tr_lng = place.geometry.location.lng() + dot;
    bl_lat = place.geometry.location.lat() - dot;
    bl_lng = place.geometry.location.lng() - dot;

    // invoke function to get weather information
    getWeather(place.geometry.location.lat(), place.geometry.location.lng());
    // invoke function to get restaurants
    getRestaurants(tr_lat, tr_lng, bl_lat, bl_lng);

    if (!place.geometry || !place.geometry.location) {
      // === User entered the name of a Place that was not suggested and
      // === pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    infowindowContent.children["place-name"].textContent = place.name;
    infowindowContent.children["place-address"].textContent =
      place.formatted_address;

    // ===If the place has a geometry, zoom in to this location. ====
    if (place.geometry && place.geometry.location) {
      map.panTo(place.geometry.location);
      map.setZoom(14);
    }

    // ======
    console.log("autocomplete: ", place);
  });
}

window.initMap = initMap;
