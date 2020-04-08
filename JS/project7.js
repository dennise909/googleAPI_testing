
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

    console.log(newList[1].placePhoto[0].getUrl())
    createCard(newList)
    var cards = $();
    // Store all the card nodes
    newList.forEach(function (item, i) {
      cards = cards.add(createCard(item));
    });
    agregarTarjeta(newList)
    // Add them to the page... for instance the <body>
    $(function (newList) {
      $('#restaurantlist').append(cards);
      cardsImage = $(".img-square-wrapper")
      console.log(cardsImage)
      for (i = 0; i < newList.length; i++) {
        $(cardsImage[i]).attr("src", newList[i].placePhoto[0].getUrl());
      }
    })
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
            placeReview: listPlaces[i].reviews,
            placeRating: listPlaces[i].rating,
            placePhoto: listPlaces[i].photos,
            placeVecinity: listPlaces[i].vicinity

          })
        }
        /*
        createCard(newJson)
        var cards = $();
        // Store all the card nodes
        newJson.forEach(function(item, i) {
        cards = cards.add(createCard(item));
        });
    
    // Add them to the page... for instance the <body>
        $(function() {
        $('#restaurantlist').append(cards);
        });
    */
        return newJson

      }

  function replaceCardsData(places) {
        let cardsTitle = $(".card-title")
        cardsText = $(".card-text")
        cardsImage = $(".img-square-wrapper")


        for (i = 0; i < places.length; i++) {
          rating = places[i].placeRating
          $(cardsTitle[i]).html(places[i].placeName)
          $(cardsText[i]).text(places[i].placeVecinity)
          /*if (rating >= 4 && rating <= 5){
              $("span[class='fa fa-star']").addClass("checked");*/

          addStarRating(rating);
          $(cardsImage[i]).attr("src", places[i].placePhoto[0].getUrl());
        }
      }

function addStarRating(rating) {
        $stars = $("span[class='fa fa-star']")
        if (rating >= 4.5 && rating <= 5) {
          $stars.addClass("checked");
        } else if (rating >= 4 && rating <= 4.5) {
          for (i = 0; i < 5; i++) {

          }
          //  block of code to be executed if the condition1 is false and condition2 is false
        }
      }


//creates modal window 
var modal = document.getElementById("myModal");
    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
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

    function createCard(cardData) {
      cardTemplate = [
        '<div class="row">',
        '<div class="card">',
        '<div class="card-horizontal">',
        '<div class="">',
        '<img class="img-square-wrapper"',
        'src=""',
        'alt="Card image cap">',
        '</div>',
        '<div class="card-body">',
        '<h2 class="card-title text-center h5">',
        cardData.placeName || "No name provided",
        '</h2>',
        '<p class="card-text text-justify">',
        cardData.placeVecinity || "No name provided",
        '</p>',
        '<span> Rating:',
        cardData.placeRating || "No name provided",
        '</span>',
        '<span class="fa fa-star"></span>',
        '<span class="fa fa-star"></span>',
        '<span class="fa fa-star"></span>',
        '<span class="fa fa-star"></span>',
        '<span class="fa fa-star"></span>',
        '<button type="button" class="btn btn-danger">Add review</button>',
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ];
      // a jQuery node
      return $(cardTemplate.join(''));

    }


/* var cards = $();
// Store all the card nodes
data.forEach(function(item, i) {
  cards = cards.add(createCard(item));
});

// Add them to the page... for instance the <body>
$(function() {
  $('restaurantlist').append(cards);
});  */
