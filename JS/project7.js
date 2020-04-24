
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
      createPosMarker(pos);
      infoWindow.open(map);
      map.setCenter(pos);
      getCoordinates(map,pos);
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
    let newList = createJSON(results);
    createCard(newList)
    replaceCardsData(newList)
    modalWindow()
    addStarRating(newList)
    filterCardbyrate(newList)
  }
}

function getCoordinates(map,pos){
var myLatlng = pos;
    infoWindow2 = new google.maps.InfoWindow(
    {content: 'Click to add new restaurant', position: myLatlng});
    infoWindow2.open(map);
  // Configure the click listener.
   map.addListener('click', function(mapsMouseEvent) {
    let icons = {
      url: '..//Images/mylocation.png',
      scaledSize: new google.maps.Size(50, 50), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0)
    }
  
    marker = new google.maps.Marker({
      position: pos,
      icon: icons,
      map: map
    })    
     // Close the current InfoWindow.
        infoWindow2.close();
        currentPlace = {position: mapsMouseEvent.latLng.toString()}
        console.log(currentPlace.position)
        // Create a new InfoWindow.
        infoWindow2 = new google.maps.InfoWindow({position: mapsMouseEvent.latLng});
        infoWindow2.setContent(mapsMouseEvent.latLng.toString());
        infoWindow2.open(map);
      });
    
}
function modalWindow() {
  // creates the modal window
  var modal = document.getElementById("myModal");
  // Get the button that opens the modal
  btn = document.getElementById("btn btn-danger");
  // Get the <span> element that closes the modal
  span = document.getElementsByClassName("close")[0];
  // When the user clicks on the button, open the modal
  $("button.btn.btn-danger").click(function () {
    modal.style.display = "block";
  });
  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
function createPosMarker(pos) {
  let icons = {
    url: '..//Images/mylocation.png',
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0)
  }

  marker = new google.maps.Marker({
    position: pos,
    icon: icons,
    map: map
  })
}
// Set markers at the location of each place result
function createMarkers(places) {
  let icons = {
    url: '..//Images/cutlery.svg',
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0)
  }
  places.forEach(place => {
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      icon: icons
    });
    /* TODO: Step 4B: Add click listeners to the markers */
    // Add click listener to each marker
    google.maps.event.addListener(marker, 'click', () => {
      let request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'rating',
          'website', 'photos', 'vicinity']
      };
      /* Only fetch the details of a place when the user clicks on a marker.
       * If we fetch the details for all place results as soon as we get
       * the search response, we will hit API rate limits. */
      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status)
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

function createJSON(listPlaces) {
  let newJson = []

  for (i = 0; i < listPlaces.length; i++) {
    newJson.push({
      placeName: listPlaces[i].name,
      placeReview: [],
      placeRating: listPlaces[i].rating,
      placePhoto: listPlaces[i].photos,
      placeVecinity: listPlaces[i].vicinity

    })
  }
  return newJson

}

function replaceCardsData(newList) {
  var cards = $();
  // Store all the card nodes
  newList.forEach(function (item, i) {
    cards = cards.add(createCard(item));
  });

  $('#restaurantlist').append(cards);
  cardsImage = $(".img-square-wrapper")
  for (i = 0; i < newList.length; i++) {
    if (newList[i].placePhoto === undefined) {
      $(cardsImage[i]).attr("src", "..//Images/img_not_found.jpg");
      continue
    }
    else {
      $(cardsImage[i]).attr("src", newList[i].placePhoto[0].getUrl());
    }
  }
}


function addStarRating(newJson) {
  let $divstars = $("div.row.cardarea")
      starTotal = 5;
      ratings = {};

  $divstars.each(function(i) {
    $(this).addClass("item"+(i+1));
   });
  
  for (i = 0; i < newJson.length; i++) {
    ratings["item" + (i+1)] = newJson[i].placeRating 
  }

  for(const rating in ratings) {  
    const starPercentage = (ratings[rating] / starTotal) * 100;
    const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
    document.querySelector(`.${rating} .stars-inner`).style.width = starPercentageRounded; 
  }

}

function createCard(cardData) {
  cardTemplate = [
    '<div class="row cardarea">',
    '<div class= "col-lg-12 ">',
    '<div class="card mx-auto">',
    '<div class="card-horizontal">',
    '<div class="d-inline-flex align-items-center ml-4" style="height:200px; weight:100px;">',
    '<img class="img-square-wrapper img-fluid max-width:100%"',
    'src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fbitsofco.de%2Fhandling-broken-images-with-service-worker%2F&psig=AOvVaw2SAahJ6wv2k5q-AMNFyE5b&ust=1586533570747000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKiEjqHY2-gCFQAAAAAdAAAAABAY"',
    'alt="Card image cap">',
    '</div>',
    '<div class="card-body">',
    '<h2 class="card-title text-center h5">',
    cardData.placeName || "No name provided",
    '</h2>',
    '<p class="card-text text-center">',
    cardData.placeVecinity || "No name provided",
    '</p>',
    '<div class="row">',
    '<div class="col-lg-6 col-md-3 text-right">',
    '<span> Rating :  ',
    cardData.placeRating || "No name provided",
    '</span>',
    '</div>',
    '<div class="col-lg-6 col-md-3 text-left">',
    '<div class="stars-outer">',
    '<div class="stars-inner"></div>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="row mt-2">',
    '<div class= "col-md-8 offset-md-4">',
    '<button type="button" class="btn btn-danger">Add review</button>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</div>'
  ];
  // a jQuery node
  return $(cardTemplate.join(''));

}

  
function filterCardbyrate(newJson) {
  let filter1 = [];
  $("#rate1").on('click', function () {
    filter1 = [];
    newJson.forEach(function (item) {
      if (item.placeRating > 2 && item.placeRating < 3) {
        if (filter1.length < newJson.length)
          {filter1.push(item)}
      }
     });
      $(".card,.row cardarea,.col-lg-12").remove();
      createCard(filter1)
      replaceCardsData(filter1)
      modalWindow()
  });
  $("#rate2").on('click', function () {
    filter1 = [];
    newJson.forEach(function (item) {
      if (item.placeRating > 3 && item.placeRating < 4) {
        if (filter1.length < newJson.length)
          {filter1.push(item)}
      }
    });
    $(".card,.row cardarea,.col-lg-12").remove();
    createCard(filter1)
    replaceCardsData(filter1)
    modalWindow()
    
  });

  $("#rate3").on('click',function(){
    filter1 = [];
    newJson.forEach(function (item) {
      if (item.placeRating >= 4 && item.placeRating <= 5) {
        if (filter1.length < newJson.length)
          {filter1.push(item)}
      }
    });
    $(".card,.row cardarea,.col-lg-12").remove();
    createCard(filter1)
    replaceCardsData(filter1)
    modalWindow()
  });

  $("#all").on('click',function(){
    filter1 = [];
    $(".card,.row cardarea,.col-lg-12").remove();
    createCard(newJson)
    replaceCardsData(newJson)
    modalWindow()
  });
  
}
