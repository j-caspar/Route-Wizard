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
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [selectedAirbnbName, setSelectedAirbnbName] = useState(null);
    const [city, setCity] = useState(null);

    const [numPeople, setNumPeople] = useState([1]);
    const [nights, setNights] = useState([1]);
    const [price, setPrice] = useState([0, 1000]);
    const [duration, setDuration] = useState([60, 660]);
    const [plays, setPlays] = useState([0, 1100000000]);
    const [danceability, setDanceability] = useState([0, 1]);
    const [energy, setEnergy] = useState([0, 1]);
    const [valence, setValence] = useState([0, 1]);
    const [explicit, setExplicit] = useState(false);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/best_airbnb`)
          .then(res => res.json())
          .then(resJson => {
            const airbnbsWithName = resJson.map((airbnb) => ({ id: airbnb.name, ...airbnb }));
            setData(airbnbsWithName);
          });
      }, []);

    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/airbnbs?numPeople=${numPeople}` +
            `&nights=${nights}` +
            `&city=${city}` +
            `&minPrice=${price[0]}` +
            `&maxPrice=${price[1]}`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
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

            <h4>City:</h4>
            <Grid container spacing={6}>

                <Grid item xs={8}>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className='dropdown'>
                        <option city="amsterdam">Pick a city from the dropdown</option>
                        <option city="amsterdam">Amsterdam</option>
                        <option city="barcelona">Barcelona</option>
                        <option city="berlin">Berlin</option>
                        <option city="london">London</option>
                        <option city="paris">Paris</option>
                        <option city="rome">Rome</option>
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