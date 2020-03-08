
let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;

function initMap() {
  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  /* TODO: Step 4A3: Add a generic sidebar */
  // Try HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 15
      });
      bounds.extend(pos);
      infoWindow.setPosition(pos);
      infoWindow.setContent('You are here');
      infoWindow.open(map);
      map.setCenter(pos);
      // Call Places Nearby Search on user's location
      getNearbyPlaces(pos);
    }, () => {
      // Browser supports geolocation, but user has denied permission
      handleLocationError(true, infoWindow);
    });
  } else {
    // Browser doesn't support geolocation
    handleLocationError(false, infoWindow);
  }
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {
  // Set default location to Sydney, Australia
  pos = { lat: -33.856, lng: 151.215 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 15
  });
  // Display an InfoWindow at the map center
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Geolocation permissions denied. Using default location.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
  currentInfoWindow = infoWindow;
  // Call Places Nearby Search on the default location
  getNearbyPlaces(pos);
}
function getNearbyPlaces(position) {
  let request = {
    location: position,
    rankBy: google.maps.places.RankBy.DISTANCE,
    keyword: 'restaurant'
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}
// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);
    createCards(results);
  }
}
 // Set markers at the location of each place result
 function createMarkers(places) {
  places.forEach(place => {
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name
    });
    /* TODO: Step 4B: Add click listeners to the markers */
    // Add click listener to each marker
    google.maps.event.addListener(marker, 'click', () => {
      let request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'rating',
          'website', 'photos']
      };
      
      /* Only fetch the details of a place when the user clicks on a marker.
       * If we fetch the details for all place results as soon as we get
       * the search response, we will hit API rate limits. */
      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status)
        console.log(placeResult)
      });
    });
    // Adjust the map bounds to include the location of this marker
    bounds.extend(place.geometry.location);
  });
  /* Once all the markers have been placed, adjust the bounds of the map to
   * show all the markers within the visible area. */
  map.fitBounds(bounds);
}
function showDetails(placeResult, marker, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    let rating = "None";
    if (placeResult.rating) rating = placeResult.rating;
    placeInfowindow.setContent('<div><strong>' + placeResult.name +
      '</strong><br>' + 'Rating: ' + rating + '</div>');
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;
  } else {
    console.log('showDetails failed: ' + status);
  }
}


let places = [
  {
    name: "Tacos el paisa",
    location: [19.4968158, -99.2007130],
    rating: 4.2,
    photo: ['https://http2.mlstatic.com/corrida-financiera-para-proyecto-tacos-puesto-D_NQ_NP_735701-MLM20373186463_082015-O.webp'],
    description: "Deliciosos tacos de pastor, asada, chuleta y vegetarianos. Con diversas opciones de salsas"
  },
  {
    name: "Tortas el loro",
    location: [19.4971688, -99.1988667],
    rating: 3.2,
    photo: ['https://http2.mlstatic.com/D_NQ_NP_600593-MLM31810987438_082019-W.jpg'],
    description: "Deliciosos tacos al vapor de buche,ojo,lengua,maciza "
  },
  {
    name: "Carnitas el tio",
    location: [19.4946599, -99.1986569],
    rating: 4.7,
    photo: ['https://s3-media0.fl.yelpcdn.com/bphoto/VdbnBRjAIP8Ss7kZgemUvA/o.jpg'],
    description: "Deliciosos tacos de pastor, asada, chuleta y vegetarianos. Con diversas opciones de salsas"
  },
  {
    name: "Tacos el gallo",
    location: [19.4936983, -99.2016597],
    rating: 4.9,
    photo: ['https://i.pinimg.com/originals/0d/dc/59/0ddc596d1a893e5552d75575670eaaaa.jpg'],
    description: "Deliciosos tacos de pastor, asada, chuleta y vegetarianos. Con diversas opciones de salsas"

  },
  {
    name: 'Fonda "La Doña"',
    location: [19.4949635, -99.2038869],
    rating: 3.9,
    photo: ['https://media-cdn.tripadvisor.com/media/photo-s/01/7d/9f/64/the-ambience-bohemian.jpg'],
    description: "Platillos mexicanos y comida corrida del dia, "

  }
];



function createCards(listPlaces) {
let cardsTitle = $(".card-title")
    cardsText = $(".card-text")
    cardsImage = $(".img-square-wrapper")


  for (i = 0; i < listPlaces.length; i++) {
    $(cardsTitle[i]).html(listPlaces[i].name)
    $(cardsText[i]).text(listPlaces[i].reviews) 
    $(cardsImage[i]).attr("src",listPlaces[i].photos[0].getUrl());
}

} 
