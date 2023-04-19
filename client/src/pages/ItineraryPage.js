import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import './pages.css';

import AirbnbCard from '../components/AirbnbCard';
import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function ItineraryPage() {
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);

  const [family, setFamily] = useState(false);
  const [price, setPrice] = useState([20, 1000]);
  const [days, setDays] = useState('1');
  const [guests, setGuests] = useState('1');
  const [city, setCity] = useState('Amsterdam');
    const handleChange = (event) => {
        setCity(event.target.city);
    }

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/itinerary`)
      .then(res => res.json())
      .then(resJson => {
        const data = resJson.map((itinerary) => ({ id: itinerary.name, picture: itinerary.image, type: itinerary.type, ...itinerary }));
        setData(data);
      });
  }, []);

  // add lat and lng from map
  const search = () => {
    fetch(`http://${config.server_host}:${config.server_port}/itinerary?city=${city}` +
      `&days=${days}` + 
      `&num_people=${guests}` + 
      `&min_price=${price[0]}&max_price=${price[1]}` +
      `&adult_only=${family}`
    )
      .then(res => res.json())
      .then(resJson => {
        // DataGrid expects an array of objects with a unique id.
        // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
        const data = resJson.map((itinerary) => ({ id: itinerary.name, picture: itinerary.image, type: itinerary.type, ...itinerary }));
        setData(data);
      });
  }

  // This defines the columns of the table of songs used by the DataGrid component.
  // The format of the columns array and the DataGrid component itself is very similar to our
  // LazyTable component. The big difference is we provide all data to the DataGrid component
  // instead of loading only the data we need (which is necessary in order to be able to sort by column)
  const columns = [
    { field: 'name', headerName: 'Name', width: 300 },
    { field: 'picture', headerName: 'Picture', width: 300},
    { field: 'type', headerName: 'Type', width: 200 },
    { field: 'subcategory', headerName: "Subcategory", width: 200}
  ]

  // This component makes uses of the Grid component from MUI (https://mui.com/material-ui/react-grid/).
  // The Grid component is super simple way to create a page layout. Simply make a <Grid container> tag
  // (optionally has spacing prop that specifies the distance between grid items). Then, enclose whatever
  // component you want in a <Grid item xs={}> tag where xs is a number between 1 and 12. Each row of the
  // grid is 12 units wide and the xs attribute specifies how many units the grid item is. So if you want
  // two grid items of the same size on the same row, define two grid items with xs={6}. The Grid container
  // will automatically lay out all the grid items into rows based on their xs values.
  //       {selectedSongId && <AirbnbCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />}

  return (
    <Container>
      <h2>Build an itinerary</h2>
      <Grid container spacing={6}>
      
        <Grid item xs={4}>
          <h4>Length of Stay</h4>
          <TextField label='Number of days (Ex: 2)' value={days} onChange={(e) => setDays(e.target.value)} style={{ width: 300, height: 100 }}/>
        </Grid>
        <Grid item xs={4}>
          <h4>Number of Guests</h4>
          <TextField label='Number of guests (Ex: 1)' value={guests} onChange={(e) => setGuests(e.target.value)} style={{ width: 300, height: 100 }}/>
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel
            label='Only family friendly activities?' 
            control={<Checkbox checked={family} onChange={(e) => setFamily(e.target.checked)} />}
            style={{transform: 'translateY(170%)' }}
          />
        </Grid>
        <Grid item xs={5}>
          <h4>City</h4>
          <select value={city} onChange={handleChange} className='dropdown' style={{ width: 300, height: 50 }}>
            <option value="Amsterdam">Amsterdam</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Berlin">Berlin</option>
            <option value="London">London</option>
            <option value="Paris">Paris</option>
            <option value="Rome">Rome</option>
          </select>
        </Grid>
        <Grid item xs={5}>
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
        <Grid item xs={2} style={{ marginTop: 50 }}>

          <Button onClick={() => search() } style={{color: 'white', backgroundColor: '#051c3b', fontSize: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
            BUILD
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