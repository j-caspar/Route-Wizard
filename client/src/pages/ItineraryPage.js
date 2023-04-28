import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import './pages.css';
import Avatar from '@mui/material/Avatar';
import AirbnbCard from '../components/AirbnbCard';
const config = require('../config.json');
const google=window.google


export default function ItineraryPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [selectedAirbnbName, setSelectedAirbnbName] = useState(null);

  const [family, setFamily] = useState(false);
  const [price, setPrice] = useState([20, 1000]);
  const [days, setDays] = useState('1');
  const [guests, setGuests] = useState('1');
  const [city, setCity] = useState('Unselected');
  const [lat, setLat] = useState(52.3676);
  const [lng, setLng] = useState(4.9041);

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
    Unselected: {latCenter: 47.3220, lngCenter: 5.0415}
  };

  useEffect(() => {
    if (city) {
        if (city === 'Unselected') {
            initMapEurope()
        } else {
            const { latCenter, lngCenter, latMin, latMax, lngMin, lngMax } = cityCoordinates[city];
             initMap(latCenter, lngCenter, latMin, latMax, lngMin, lngMax);
        }
    }
  }, [city]);

  function initMapEurope() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: {lat: 47.3220, lng: 5.0415},
        draggable: false,
        zoomControl: false
      });
}

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
    
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latCenter, lngCenter),
        map: map,
    });

    map.setOptions({ minZoom: 12, maxZoom: 20 });
    map.addListener('click', function(event) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({lat: lat, lng: lng});
        setLat(lat);
        setLng(lng);
    });
}

  const search = () => {
    if (city !== 'Unselected') {
      fetch(`http://${config.server_host}:${config.server_port}/itinerary?city=${city}` +
        `&days=${days}` + 
        `&num_people=${guests}` + 
        `&min_price=${price[0]}` +
        `&max_price=${price[1]}` +
        `&adult_only=${family}`+
        `&lat=${lat}` +
        `&lng=${lng}`
      )
        .then(res => res.json())
        .then(resJson => {
          if (Object.keys(resJson).length === 0) {
            setData([]);
          } else {
            const data = resJson.map((itinerary) => ({ id: itinerary.name, picture: itinerary.image, type: itinerary.type, ...itinerary }));
            setData(data);
          }
      });
    }
  }

  const columns = [
    { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => 
    params.row.type === 'Accommodation' ? (
      <Link onClick={() => setSelectedAirbnbName(params.row.name)}>{params.row.name}</Link>
     ) : null
    },
    { field: 'image', headerName: 'Picture', width: 300, renderCell: (params) => <Avatar src={params.value} />},
    { field: 'type', headerName: 'Type', width: 200 },
    { field: 'subcategory', headerName: "Subcategory", width: 200}
  ]

  return (
    <Container>
      {selectedAirbnbName && <AirbnbCard airbnbName={selectedAirbnbName} handleClose={() => setSelectedAirbnbName(null)} />}
      <h1>Build an itinerary</h1>
      <Grid container spacing={5}>
      
        <Grid item xs={4}>
          <h4>Length of Stay</h4>
          <TextField label='Number of days (Ex: 2)' value={days} onChange={(e) => setDays(e.target.value)} style={{ width: 300, height: 100 }}/>
        </Grid>
        <Grid item xs={4}>
          <h4>Number of Guests</h4>
          <TextField label='Number of guests (Ex: 1)' value={guests} onChange={(e) => setGuests(e.target.value)} style={{ width: 300, height: 100 }}/>
        </Grid>
        <Grid item xs={4}>
          <h4>City</h4>
          <select value={city} onChange={(e) => {setCity(e.target.value); setLat(cityCoordinates[e.target.value].latCenter);
                setLng(cityCoordinates[e.target.value].lngCenter)}} className='dropdown' style={{ width: 300, height: 50 }}>
            <option value="Unselected">Select a City</option>
            <option value="Amsterdam">Amsterdam</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Berlin">Berlin</option>
            <option value="London">London</option>
            <option value="Paris">Paris</option>
            <option value="Rome">Rome</option>
          </select>
        </Grid>
      
        <Grid item xs={12}>
                <div id="map" style={{ height: '450px', textAlign: 'center'}}></div>
                 <div style={{textAlign: 'center'}}>
                <h4>Click on the map to set a desired location</h4>
                </div>
            </Grid>

        <Grid item xs={4}>
          <FormControlLabel
            label='Seeking nightlife?' 
            control={<Checkbox checked={family} onChange={(e) => setFamily(e.target.checked)} />}
          />
        </Grid>

        <Grid item xs={5}style={{ marginTop: '-50px' }}>
          <h4>Price</h4>
          <Slider
            value={price}
            min={20}
            max={1000}
            step={20}
            onChange={(e, newValue) => setPrice(newValue)}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={3}>

          <Button onClick={() => search() } style={{color: 'white', backgroundColor: '#051c3b', fontSize: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
            BUILD
        </Button>
       </Grid>


      </Grid>

      <h2>Results</h2>
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        autoHeight
      />
    </Container>
  );
}