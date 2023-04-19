import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import './pages.css';

import AirbnbCard from '../components/AirbnbCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function SongsPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [selectedAirbnbName, setSelectedAirbnbName] = useState(null);
    const [city, setCity] = useState('Amsterdam');
    const [numPeople1, setNumPeople1] = useState(1);
    const [nights1, setNights1] = useState(1);
    const [numPeople2, setNumPeople2] = useState(1);
    const [nights2, setNights2] = useState(1);
    const [price1, setPrice1] = useState([20, 1000]);
    const [price2, setPrice2] = useState([20, 1000]);

    const search = () => {
        console.log("reached");
        fetch(`http://${config.server_host}:${config.server_port}/travelwithfriend?A_num_people=${numPeople1}` +
            `&A_min_nights=${nights1}` +
            `&city=${city}` +
            `&A_min_price=${price1[0]}` +
            `&A_max_price=${price1[1]}` +
            `&B_num_people=${numPeople2}`+
            `&B_min_nights=${nights2}` +
            `&B_min_price=${price2[0]}` +
            `&B_max_price=${price2[1]}`
        )
            .then(res => res.json())
            .then(resJson => {
                const airbnbsWithName = resJson.map((airbnb) => ({ id: `${airbnb.name}-${airbnb.bname}`, ...airbnb }));
                console.log(resJson);
                setData(airbnbsWithName);
              });
    }
    

    // This defines the columns of the table of songs used by the DataGrid component.
    // The format of the columns array and the DataGrid component itself is very similar to our
    // LazyTable component. The big difference is we provide all data to the DataGrid component
    // instead of loading only the data we need (which is necessary in order to be able to sort by column)
    const columns = [
        { field: 'name', headerName: 'Name 1', width: 300, renderCell: (params) => (
            <Link onClick={() => setSelectedAirbnbName(params.row.id)}>{params.value}</Link>
        ) },
        { field: 'price', headerName: 'Price/Night 1' },
        { field: 'review_score', headerName: 'Rating 1' }, 
        { field: 'bname', headerName: 'Name 2', width: 300, renderCell: (params) => (
            <Link onClick={() => setSelectedAirbnbName(params.row.id)}>{params.value}</Link>
        ) },
        { field: 'bprice', headerName: 'Price/Night 2' },
        { field: 'breview_score', headerName: 'Rating 2' },
        { field: 'Distance', headerName: 'Distance (km)' }

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
            <Grid container spacing={0}>
            <Grid item xs={6} style = {{marginTop: 20}}>
                <h1>Traveling With a Friend</h1>
            </Grid>
            <Grid item xs={6}>
            <h4>City</h4>
                <select value={city} onChange={(e) => setCity(e.target.value)} className='dropdown'>
                    <option value="Amsterdam">Amsterdam</option>
                    <option value="Barcelona">Barcelona</option>
                    <option value="Berlin">Berlin</option>
                    <option value="London">London</option>
                    <option value="Paris">Paris</option>
                    <option value="Rome">Rome</option>
                </select>
            </Grid>
            <Grid item xs={6}>
                <h4>Person 1: Length of Stay</h4>
                <TextField label='Number of nights (Ex: 2)' value={nights1} onChange={(e) => setNights1(e.target.value)} style={{ width: 300, height: 100}}/>
            </Grid>
             <Grid item xs={6}>
                <h4>Person 1: Number of Guests</h4>
                <TextField label='Number of guests (Ex: 1)' value={numPeople1} onChange={(e) => setNumPeople1(e.target.value)} style={{ width: 300, height: 100 }}/>
            </Grid>
            <Grid item xs={6}>
                <h4>Person 2: Length of Stay</h4>
                <TextField label='Number of nights (Ex: 2)' value={nights2} onChange={(e) => setNights2(e.target.value)} style={{ width: 300, height: 100}}/>
            </Grid>
             <Grid item xs={6}>
                <h4>Person 2: Number of Guests</h4>
                <TextField label='Number of guests (Ex: 1)' value={numPeople2} onChange={(e) => setNumPeople2(e.target.value)} style={{ width: 300, height: 100 }}/>
            </Grid>

            <Grid item xs={5}>
            <h4>Person 1: Price</h4>
                <Slider
                    value={price1}
                    min={20}
                    max={1000}
                    step={20}
                    onChange={(e, newValue) => setPrice1(newValue)}
                    valueLabelDisplay='auto'
                />
            </Grid>
            <Grid item xs={5} style={{ marginLeft: 80}}>
            <h4>Person 2: Price</h4>
                <Slider
                    value={price2}
                    min={20}
                    max={1000}
                    step={20}
                    onChange={(e, newValue) => setPrice2(newValue)}
                    valueLabelDisplay='auto'
                />
            </Grid>
            <Grid item xs={12}>
                <Button onClick={() => search()} style={{ margin: 50, color: 'white', backgroundColor: '#051c3b', fontSize: '2rem', left: '10%', transform: 'translateX(-50%)' }}>
                    Show Me Airbnbs
                </Button>
            </Grid>
        </Grid>

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