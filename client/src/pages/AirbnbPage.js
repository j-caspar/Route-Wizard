import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import './pages.css';

import AirbnbCard from '../components/AirbnbCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');
const google=window.google

export default function SongsPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [selectedAirbnbName, setSelectedAirbnbName] = useState(null);
    const [city, setCity] = useState('Amsterdam');

    const [numPeople, setNumPeople] = useState([1]);
    const [nights, setNights] = useState([1]);
    const [price, setPrice] = useState([0, 1000]);
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
      };

    useEffect(() => {
        if (city) {
          const { latCenter, lngCenter, latMin, latMax, lngMin, lngMax } = cityCoordinates[city];
          initMap(latCenter, lngCenter, latMin, latMax, lngMin, lngMax);
        }
      }, [city]);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/best_airbnb`)
          .then(res => res.json())
          .then(resJson => {
            const airbnbsWithName = resJson.map((airbnb) => ({ id: airbnb.name, ...airbnb }));
            setData(airbnbsWithName);
          });
      }, []);


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
    
        map.setOptions({ minZoom: 12, maxZoom: 20 });
        map.addListener('click', function(event) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            setLat(lat);
            setLng(lng);
            console.log("Lat: " + lat + ", Lng: " + lng);
        });
        map.setOptions({ minZoom: 12, maxZoom: 20 });
  }

    const search = () => {
        // console.log("numPeople: ", numPeople);
        // console.log("nights: ", nights);
        // console.log("city: ", city);
        // console.log("minPrice: ", price[0]);
        // console.log("maxPrice: ", price[1]);
        // console.log("lat: ", lat);
        // console.log("lng: ", lng);
        fetch(`http://${config.server_host}:${config.server_port}/airbnbs?numPeople=${numPeople}` +
            `&nights=${nights}` +
            `&city=${city}` +
            `&minPrice=${price[0]}` +
            `&maxPrice=${price[1]}` +
            `&lat=${lat}` +
            `&lng=${lng}`
        )
            .then(res => res.json())
            .then(resJson => {
                const airbnbsWithName = resJson.map((airbnb) => ({ id: airbnb.name, ...airbnb }));
                setData(airbnbsWithName);
              });
    }
    

    // This defines the columns of the table of songs used by the DataGrid component.
    // The format of the columns array and the DataGrid component itself is very similar to our
    // LazyTable component. The big difference is we provide all data to the DataGrid component
    // instead of loading only the data we need (which is necessary in order to be able to sort by column)
    const columns = [
        { field: 'name', headerName: 'Name', width: 300, renderCell: (params) => (
            <Link onClick={() => setSelectedAirbnbName(params.row.id)}>{params.value}</Link>
        ) },
        { field: 'price', headerName: 'Price/Night' },
        { field: 'review_score', headerName: 'Rating' }
    ]

    // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
    // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
    // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
    // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
    // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
    // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
    // will automatically lay out all the grid items into rows based on their xs values.
    return (
        <Container>
            {selectedAirbnbName && <AirbnbCard airbnbName={selectedAirbnbName} handleClose={() => setSelectedAirbnbName(null)} />}
            <h2 className='centered-h2-rest'>Airbnbs</h2>
                <h4>Number of Guests:</h4>
                <Grid item xs={8}>
                    <TextField label='#' value={numPeople} onChange={(e) => setNumPeople(e.target.value)} style={{ width: 70, height: 100 }} />
                </Grid>

            <h4>Number of nights:</h4>
            <Grid container spacing={8}>

                <Grid item xs={8}>
                    <TextField label='#' value={nights} onChange={(e) => setNights(e.target.value)} style={{ width: 70, height: 100 }} />
                </Grid>
            </Grid>

            <Grid item xs={12} sm={4}>
            <div id="map" style={{ height: '500px'}}></div>
            </Grid>

            <h4>City:</h4>
            <Grid container spacing={6}>

                <Grid item xs={8}>
                    <select value={city} onChange={(e) => {setCity(e.target.value); setLat(cityCoordinates[e.target.value].latCenter);
                    setLng(cityCoordinates[e.target.value].lngCenter)}} className='dropdown'>
                        <option value="Amsterdam">Pick a city from the dropdown</option>
                        <option value="Amsterdam">Amsterdam</option>
                        <option value="Barcelona">Barcelona</option>
                        <option value="Berlin">Berlin</option>
                        <option value="London">London</option>
                        <option value="Paris">Paris</option>
                        <option value="Rome">Rome</option>
                    </select>
                </Grid>
            </Grid>

            <h4>Price:</h4>
            <Grid container spacing={6}>
                <Grid item xs={4}>
                    <Slider
                        value={price}
                        min={0}
                        max={1000}
                        step={10}
                        onChange={(e, newValue) => setPrice(newValue)}
                        valueLabelDisplay='auto'
                    />
                </Grid>
            </Grid>



            <Button onClick={() => search()} style={{ margin: 50, color: 'white', backgroundColor: 'gray', fontSize: '3rem', left: '50%', transform: 'translateX(-50%)' }}>
                SHOW ME AIRBNBS
            </Button>
            <h2>Results</h2>
            {/* Notice how similar the DataGrid component is to our LazyTable! What are the differences? */}
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