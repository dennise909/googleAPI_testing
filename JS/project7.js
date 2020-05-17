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
      newRestMarker(map, pos);
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
    addCreatedCards(newList)
    addPhototoCard(newList)
    replaceCardContent(newList)
    filterCardbyrate(newList)
    addStarRating(newList)
  }
}

function newRestMarker(map, pos) {
  var myLatlng = pos;
  infoWindow2 = new google.maps.InfoWindow(
    { content: 'Click on the map to add new restaurant', position: myLatlng });
  infoWindow2.open(map);

  // Configure the click listener.
  map.addListener('click', function (mapsMouseEvent) {

    let iconImage = '..//Images/cutlery.svg';
    let marker = createPosMarker(mapsMouseEvent.latLng, { title: 'Hola' }, iconImage)
    // Close the current InfoWindow.
    infoWindow2.close();
    currentPlace = { position: mapsMouseEvent.latLng.toString() }
    //console.log(currentPlace.position)
    modalWindow("modal-newrestaurant", "map", "content-restcard")
    let divModal = document.getElementById("modal-newrestaurant")
        divContent = document.getElementById("content-restcard")
        span = document.getElementById("close-span")
    divModal.style.width = "67%";
    divModal.style.height = "73%";
    divContent.style.width = "50%";
    divContent.style.height = "50%";
    content = $();
    content = content.add(addRestaurantForm())
    $('#content-restcard').append(content)
    console.log(name)
    
    $("#submitForm.btn.btn-info").click(function () {
      let newRestaurant = [];
          rating = parseFloat($("#inputRating.form-control").val())
          name = $("#inputName.form-control").val()
          address = $("#inputAddress.form-control").val()

         newRestaurant.push({
          placeName: name,
          placeReview: [],
          placeRating: rating,
          placePhoto: undefined,
          placeVecinity: address,

    })

   let divModal = document.getElementById("modal-newrestaurant")
    divModal.remove();
    divModal.style.display = "none";

    createCard(newRestaurant)
    addCreatedCards(newRestaurant)
   /* window.addEventListener('load', function() {
      document.querySelector('input[type="file"]').addEventListener('change', function() {
          if (this.files && this.files[0]) {
              var img = document.getElementById('myImg');  // $('img')[0]
              img.src = URL.createObjectURL(this.files[0]); // set src to blob url
              img.onload = imageIsLoaded;
          }
      });
   });
    
    function imageIsLoaded() { 
      alert(this.src);  // blob url
     cardsImage = $(".img-square-wrapper")
     $(cardsImage[20]).attr("src", this.src);
      // update width and height ...
    }*/
    //cardsImage = $(".img-square-wrapper")
    //$(cardsImage[20]).attr("src", "..//Images/img_not_found.jpg");
    //$('input[type=file]').change(function () {
    //  console.dir(this.files[0])
//})
    cardsImage = $(".img-square-wrapper")
   $(cardsImage[20]).attr("src", '..//Images/restaurant-chocolat.jpg');
    addStarRating(newRestaurant)
    

    });


  infoWindow3 = new google.maps.InfoWindow(
     { content: "laJosefina", position: currentPlace });
  infoWindow3.open(map);
   
    
    
    span.onclick = function () {
      let divModal = document.getElementById("modal-newrestaurant")
      divModal.remove();
      divModal.style.display = "none";
      // ocultar la lista actual
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      let divModal = document.getElementById("modal-newrestaurant")
      if (event.target == divModal) {
        divModal.remove();
        divModal.style.display = "none";
      }
    }
  });
}

function modalWindow(idModal, idDivContainer, idContent) {
  this.divModal = document.createElement("div");
  this.divModal.id = idModal;
  this.divModal.classList.add("modal")
  this.divModal.style.display = "block";

  this.divContent = document.createElement("div");
  this.divContent.classList.add("modal-content");
  this.divContent.id = idContent;

  document.getElementById(idDivContainer).appendChild(divModal);
  document.getElementById(idModal).appendChild(divContent);

  this.span = document.createElement("span")
  this.span.classList.add("close");
  this.span.innerHTML = "&times;";
  this.span.id = "close-span"

  divContent.appendChild(span)


}

function closeModalWindow (nameContainer){
  span = document.getElementById("close-span")
  span.onclick = function () {
    let divModal = document.getElementById(nameContainer)
    divModal.remove();
    divModal.style.display = "none";
    // ocultar la lista actual
  }
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    let divModal = document.getElementById(nameContainer)
    if (event.target == divModal) {
      divModal.remove();
      divModal.style.display = "none";
    }

}}

function createPosMarker(pos, markerOptions, iconImage) {
  markerOptions = markerOptions || {}

  icon = {
    url: iconImage || '..//Images/mylocation.png',
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0)
  }

  return new google.maps.Marker({
    ...markerOptions,
    position: pos,
    icon: icon,
    map: map
  })
}
// Set markers at the location of each place result
function createMarkers(places) {
  let iconImage = '..//Images/cutlery.svg';
  places.forEach(place => {
    let marker = createPosMarker(
      place.geometry.location,
      { title: place.name },
      iconImage
    );

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
function addCreatedCards(newList){
  let cards = $();
    // Store all the card nodes
    newList.forEach(function (item) {
      cards = cards.add(createCard(item));
    });
    $('#restaurantlist').append(cards);
}

function addPhototoCard(newList){
    // adds cards to the restaurant area
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

function replaceCardContent(newList) {
  
  // gets buttons and adds id with name od the restaurant
  $modalButtons = $("button.btn.btn-danger")
  $modalButtons.each(function (i) {
    $(this).attr('id', newList[i].placeName);
  })

  document.addEventListener('click', function (e) {
    listRestNames = []
    for (i = 0; i < newList.length; i++) {
      listRestNames.push(newList[i].placeName)
    }

    let clickedButton = e.target.id;
    checkList = listRestNames.includes(clickedButton)
    if (checkList === true) {
      modalWindow("myModal", "modalcontainer","modal-content")

      //creates card for content
      content = $();
      content = content.add(modalContent())
      $('.modal-content').append(content)

      //adds comments 
      $(".btn.btn-outline-info").click(function () {
        //$('.btn.btn-outline-info').off('click');
        let myText = $('#fileinput').val();
        $("ul.list-group.list-group-flush").append('<li class="list-group-item">' + myText + '</li>');
        $("#fileinput.form-control").val('');
      });

      //adds span to item
      span.onclick = function () {
        document.getElementById("myModal").remove();
        document.querySelectorAll('.row.content').forEach(function (a) {
          a.remove()
        })
        divModal.style.display = "none";
        // ocultar la lista actual
      }
      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == divModal) {
          document.getElementById("myModal").remove();
          document.querySelectorAll('.row.content').forEach(function (a) {
            a.remove()
          })

          divModal.style.display = "none";
        }
      }
    }
  });

}

function addModaltoContainter() {
  containerTemplate = [
    '<div id="myModal" class="modal">',
    '<div class="modal-content">',
    '<span class="close">&times;</span>',
    '</div>',
    '</div>'
  ]
  return $(containerTemplate.join(''));
}
function addStarRating(newJson) {
  let $divstars = $("div.row.cardarea")
  starTotal = 5;
  ratings = {};

  $divstars.each(function (i) {
    $(this).addClass("item" + (i + 1));
  });

  for (i = 0; i < newJson.length; i++) {
    ratings["item" + (i + 1)] = newJson[i].placeRating
  }

  
  for (const rating in ratings) {
    console.log(rating)
    const starPercentage = (ratings[rating] / starTotal) * 100;
    console.log(starPercentage)
    const starPercentageRounded = `${(Math.round(starPercentage / 10) * 10)}%`;
    console.log(starPercentageRounded)
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
    cardData.placeVecinity || "No address provided",
    '</p>',
    '<div class="row">',
    '<div class="col-lg-6 col-md-3 text-right">',
    '<span> Rating :  ',
    cardData.placeRating || "No rating provided",
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

function modalContent() {
  commentTemplate = [
    '<div class="row content">',
    '<div class="container-fluid" style="width:571px; height: 674px; overflow-y: scroll; float: center;">',
    '<div class="card" style="width: 50rem;">',
    '<ul class="list-group list-group-flush">',
    ' </ul>',
    '</div>',
    '<div class="row input-group mb-3">',
    '<input id="fileinput" type="text" class="form-control" placeholder="Write a review" aria-label="Recipients username" aria-describedby="basic-addon2">',
    '<div class="input-group-append">',
    '<button class="btn btn-outline-info" type="button">Add</button>',
    '</div>',
    '</div>',
    '</div>'
  ];
  return $(commentTemplate.join(''));
}


function addRestaurantForm() {
  formTemplate = [
    '<div class="container-fluid" style="width:571px; height: 674px; overflow-y: scroll; float: center;">',
    '<form>',
    '<div class="form-group">',
    '<label for="inputName">Restaurant name</label>',
    '<input type="text" class="form-control" id="inputName" aria-describedby="emailHelp" placeholder="Enter name">',
    '</div>',
    '<div class="form-group">',
    '<label for="inputAddress">Address</label>',
    '<input type="text" class="form-control" id="inputAddress" placeholder="Enter address">',
    '</div>',
    '<div class="form-group">',
    '<label for="inputRating">Rating</label>',
    '<input type="number" class="form-control" id="inputRating" placeholder="Add rating">',
    '</div>',
    '<div class="form-group">',
    '<input type="file" />',
    '<br><img id="myImg" src="#" alt="your image" height=200 width=100></br>',
    '</div>',
    '<button type="button" id="submitForm" class="btn btn-info">Submit</button>',
    '</form>',
    '</div>'
  ]
  return $(formTemplate.join(''));
}

function filterCardbyrate(newJson) {
  let filter1 = [];

  $("#rate1").on('click', function () {
    filter1 = [];
    $("div.row.cardarea").remove()
    newJson.forEach(function (item) {
      if (item.placeRating > 2 && item.placeRating < 3) {
        if (filter1.length < newJson.length) { filter1.push(item) }
      }
    });
    $(".card,.row cardarea,.col-lg-12").remove();
    createCard(filter1)
    addCreatedCards(filter1)
    addPhototoCard(filter1)
    replaceCardContent(filter1)
    addStarRating(filter1)
  });
  $("#rate2").on('click', function () {
    filter2 = [];
    $("div.row.cardarea").remove()
    newJson.forEach(function (item) {
      if (item.placeRating > 3 && item.placeRating < 4) {
        if (filter2.length < newJson.length) { filter2.push(item) }
      }
    });
    $(".card,.row cardarea,.col-lg-12").remove();
    createCard(filter2)
    addCreatedCards(filter2)
    addPhototoCard(filter2)
    replaceCardContent(filter2)
    addStarRating(filter2)

  });

  $("#rate3").on('click', function () {
    filter3 = [];
    $("div.row.cardarea").remove()
    newJson.forEach(function (item) {
      if (item.placeRating >= 4 && item.placeRating <= 5) {
        if (filter3.length < newJson.length) { filter3.push(item) }
      }
    });
    $(".card,.row cardarea,.col-lg-12").remove();
    createCard(filter3)
    addCreatedCards(filter3)
    addPhototoCard(filter3)
    replaceCardContent(filter3)
    addStarRating(filter3)
  });

  $("#all").on('click', function () {
    // there are two on click events thats why is breaking
    $("div.row.cardarea").remove()
    createCard(newJson)
    addCreatedCards(newJson)
    addPhototoCard(newJson)
    replaceCardContent(newJson)
    addStarRating(newJson)
  });

}
