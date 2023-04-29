import { useEffect, useState } from 'react';
import { useParams, Link, json } from 'react-router-dom';
import { Container, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AirbnbCard from '../components/AirbnbCard';
const config = require('../config.json');
const google=window.google


export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};


export default function AirbnbInfoPage() {
  const { bnb_name } = useParams();
  var airbnbLat = '';
  var airbnbLng = '';
  var airbnbName = '';
  var airbnbLocation = '';
  const [pageSize, setPageSize] = useState(10);
  const [airbnbData, setAirbnbData] = useState([{}]);
  const [nearbyAttractions, setNearbyAttractions] = useState([{}]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([{}]);

  const [selectedAirbnbName, setSelectedAirbnbName] = useState(null);

  const cityCoordinates = {
    Amsterdam: {latCenter: 52.3676, lngCenter: 4.9041,
        latMin: 52.29034, latMax: 52.42512, lngMin: 4.75571, lngMax: 5.02643},
    Barcelona: {latCenter: 41.3874, lngCenter: 2.1686,
        latMin: 41.352608, latMax: 41.45956, lngMin: 2.09159, lngMax: 2.22771},
    Berlin: {latCenter: 52.5200, lngCenter: 13.4050,
        latMin: 52.36904, latMax: 52.65611, lngMin: 13.09808, lngMax: 13.72139},
    London: {latCenter: 51.5072, lngCenter: -0.118092,
        latMin: 51.295937, latMax: 51.6811419, lngMin: -0.4978, lngMax: 0.28857},
    Paris: {latCenter: 48.8566, lngCenter: 2.3522,
        latMin: 48.81608, latMax: 48.90167, lngMin: 2.22843, lngMax: 2.46712},
    Rome: {latCenter: 41.9028, lngCenter: 12.4964,
        latMin: 41.65701, latMax: 42.1216, lngMin: 12.25167, lngMax: 12.79247},
  };

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/airbnbs/${bnb_name}`)
      .then(res => res.json())
      .then(resJson => {
        setAirbnbData(resJson[0]);
        const airbnbLat = resJson[0].lat;
        const airbnbLng = resJson[0].lng;
        console.log(airbnbLat);
        console.log(airbnbLng);
        const airbnbName = resJson[0].name;
        const airbnbLocation = resJson[0].location;
        fetch(`http://${config.server_host}:${config.server_port}/airbnbs/nearby_nightlife?lng=${airbnbLng}&lat=${airbnbLat}&location=${airbnbLocation}`)
          .then(res => res.json())
          .then(resJson => {
            console.log("this is the lng" + airbnbLng);
            console.log("this is the lat" + airbnbLat);
            console.log("this is the location" + airbnbLocation);
            console.log(resJson);
            const attractions = resJson.map((attr) => ({ id: attr.name, ...attr }));
            setNearbyAttractions(attractions);
          });
  
        fetch(`http://${config.server_host}:${config.server_port}/airbnbs/nearby_rest?lng=${airbnbLng}&lat=${airbnbLat}&name=${airbnbName}`)
          .then(res => res.json())
          .then(resJson => {
            console.log(resJson);
            const restaurants = resJson.map((rest) => ({ id: rest.name, ...rest }));
            setNearbyRestaurants(restaurants);
          });
      });
  }, []);
  
  useEffect(() => {
    if (airbnbData.location && nearbyRestaurants.length > 0) {
      const { latCenter, lngCenter, latMin, latMax, lngMin, lngMax } = cityCoordinates[airbnbData.location];
      initMap(airbnbData.lat, airbnbData.lng, latMin, latMax, lngMin, lngMax);
    }
  }, [airbnbData.location, nearbyRestaurants]);
  
  function initMap(latCenter, lngCenter, latMin, latMax, lngMin, lngMax) {
    var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(latMin - 0.001, lngMin - 0.001), 
      new google.maps.LatLng(latMax + 0.001, lngMax + 0.001)
    );
  
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: {lat: latCenter, lng: lngCenter},
      draggable: true,
      restriction: {
        latLngBounds: bounds,
        strictBounds: false
      }
    });
    
    new google.maps.Marker({
      position: new google.maps.LatLng(airbnbData.lat, airbnbData.lng),
      map: map,
      icon: {url: "https://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png",
      title: airbnbData.name,
      scaledSize: new google.maps.Size(35, 35),
    },
    });


    nearbyRestaurants.map((restaurant) => {
      var markerTitle = restaurant.name;
      if (restaurant.subcategory) {
        markerTitle += ": " + restaurant.subcategory;
      }
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(restaurant.lat, restaurant.lng),
        map: map,
        icon: "https://maps.google.com/mapfiles/ms/icons/restaurant.png", 
        title: markerTitle,
      });
      marker.addListener('click', function() {
        var infowindow = new google.maps.InfoWindow({
          content: this.getTitle()
        });
        infowindow.open(map, this);
      });
    });

    nearbyAttractions.map((attraction) => {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(attraction.lat, attraction.lng),
        map: map,
        icon: "https://maps.google.com/mapfiles/ms/icons/bar.png",
        title: `${attraction.name}: ${attraction.subcategory}`
      });
      marker.addListener('click', function() {
        var infowindow = new google.maps.InfoWindow({
          content: this.getTitle()
        });
        infowindow.open(map, this);
      });
    });
  
    map.setOptions({ minZoom: 12, maxZoom: 20 });
  }

  return (
    
    <Container>
      <h1 style={{ fontSize: 64, textAlign: 'center' }}>{airbnbData.name}</h1>
      {selectedAirbnbName && <AirbnbCard airbnbName={selectedAirbnbName} handleClose={() => setSelectedAirbnbName(null)} />}
      <Stack direction='row' justify='center'>
        <img
          src={airbnbData.picture_url}
          style={{
            marginTop: '40px',
            marginRight: '40px',
            marginLeft: '40px',
            marginBottom: '40px',
            width: '1000px',
            height: '700px',
            alignSelf: 'center'
          }}
        />
        
      </Stack>
      <h2>Listing URL:&nbsp;
      <Link href="#" onClick = {() => openInNewTab(airbnbData.listing_url)}>{airbnbData.name}</Link></h2>
      <p><strong>Price/Night:</strong> ${airbnbData.price} </p>
      <p><strong>Neighborhood: </strong> {airbnbData.neighborhood} </p>
      <p><strong>Minimum Number of Nights: </strong> {airbnbData.min_nights} </p>
      <p><strong>Maximum Number of Guests: </strong> {airbnbData.num_accommodates} </p>
      <p><strong>Rating: </strong> {airbnbData.review_score} </p>
      <p><strong>Number of reviews: </strong> {airbnbData.num_reviews} </p>
      {airbnbData.host_is_superhost == 't' &&
        <h2>
          This host is a superhost!
        </h2>
      }

      <br></br>
      <h2>Nearby Restaurants and Attractions</h2>
      <p>Click on each marker to learn more</p>

      <div id="map" style={{ height: '500px'}}></div>     

    </Container>
  );
}