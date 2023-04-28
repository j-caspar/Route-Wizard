import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DATA_GRID_PROPS_DEFAULT_VALUES, DataGrid } from '@mui/x-data-grid';
import './pages.css';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

import AirbnbCard from '../components/AirbnbCard';
const config = require('../config.json');
const google=window.google

export default function AirbnbPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [selectedAirbnbName, setSelectedAirbnbName] = useState(null);
    const [city, setCity] = useState('Unselected');
    const [numPeople, setNumPeople] = useState(1);
    const [nights, setNights] = useState(1);
    const [price, setPrice] = useState([20, 1000]);
    const [lat, setLat] = useState(52.3676);
    const [lng, setLng] = useState(4.9041);
    const [displayTable, setDisplayTable] = useState(false);

    const Img = styled('img')({
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    });


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

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/best_airbnb`)
          .then(res => res.json())
          .then(resJson => {
            const airbnbsWithName = resJson.map((airbnb) => ({ id: airbnb.name, ...airbnb }));
            setData(airbnbsWithName);
          });
      }, []);

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
                    if (Object.keys(resJson).length === 0) {
                        setData([]);
                    } else {
                        const airbnbsWithName = resJson.map((airbnb) => ({ id: airbnb.name, ...airbnb }));
                        setData(airbnbsWithName);
                        setDisplayTable(true);
                    }
                });
            } else {
                setDisplayTable(false);
            }
    }
    
    const columns = [
        { field: 'name', headerName: 'Name', width: 400, renderCell: (params) => (
            <Link onClick={() => setSelectedAirbnbName(params.row.id)}>{params.value}</Link>
        ) },
        { field: 'price', headerName: 'Price/Night' , width: 400},
        { field: 'review_score', headerName: 'Rating', width: 400}
    ]

    return (
        <Container>
            {selectedAirbnbName && <AirbnbCard airbnbName={selectedAirbnbName} handleClose={() => setSelectedAirbnbName(null)} />}
            <Grid container spacing={0}>
            <Grid item xs={6}>
                <h1>Airbnbs</h1>
            </Grid>
            <Grid item xs={6} style={{ display: 'flex', justifyContent: 'right' }}>
                <form action="/airbnb-friend">
                    <button type="submit" style={{color: 'white', backgroundColor: '#051c3b', marginTop: 30, fontSize: '1.5rem', transform: 'translateX(-30%)', fontFamily: 'Alegreya'}} >Traveling with A Friend? Click Me</button>
                </form>
            </Grid>
            <Grid item xs={4}>
                <h4>Length of Stay</h4>
                <TextField label='Number of nights (Ex: 2)' value={nights} onChange={(e) => setNights(e.target.value)} style={{ width: 300, height: 100}}/>
            </Grid>
             <Grid item xs={4}>
                <h4>Number of Guests</h4>
                <TextField label='Number of guests (Ex: 1)' value={numPeople} onChange={(e) => setNumPeople(e.target.value)} style={{ width: 300, height: 100 }}/>
            </Grid>
            <Grid item xs={4}>
            <h4>City</h4>
                <select value={city} onChange={(e) => {setCity(e.target.value); setLat(cityCoordinates[e.target.value].latCenter);
                setLng(cityCoordinates[e.target.value].lngCenter)}} className='dropdown'>
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

            <Grid item xs={6}>
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
            <Grid item xs={6}>
                <Button onClick={() => search()} style={{ margin: 50, color: 'white', backgroundColor: '#051c3b', fontSize: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
                    Show Me Airbnbs
                </Button>
            </Grid>
        </Grid>

        {displayTable && (
        <>
            <h2>Results</h2>
            <p>The displayed results are optimized for user ratings, proximity to desired location, and number of reviews.</p>
        <DataGrid
            rows={data}
            columns={columns}
            pageSize={pageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            autoHeight
        />
        </>
        )}
            <h2>Don't know where to start? Here are our best Airbnbs.</h2>
                <Grid container spacing={2} direction="row" justifyContent="center" alignItems="stretch">
                    {data.slice(0, 12).map((item, index) => (
                        <Grid item key={index} xs={12} sm={3} md={2} container direction="column" alignItems="center">
                            <ButtonBase sx={{ width: '100%', height: 128 }}>
                                <Img alt={item.name} src={item.picture_url} />
                            </ButtonBase>
                            
                            <Typography gutterBottom variant="subtitle1" component="div" align="center">
                                {<Link onClick={() => setSelectedAirbnbName(item.name)}>{item.name}</Link>}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                                {item.location}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
        </Container>
    );
}