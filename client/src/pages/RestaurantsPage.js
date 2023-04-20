import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import './pages.css';
import Avatar from '@mui/material/Avatar';

import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function RestaurantsPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [data2, setData2] = useState([]);
    const [data3, setData3] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('Amsterdam');

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/restaurants`)
            .then(res => res.json())
            .then(resJson => {
                const data = resJson.map((restaurant) => ({ id: restaurant.name, city: restaurant.city, subcategory: restaurant.subcategory, ...restaurant}));
                setData(data);
            });
    }, []);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/restaurants/pizza`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                const data2 = resJson.map((pizzaRest) => ({ id: pizzaRest.name, image: pizzaRest.image, city: pizzaRest.city, ...pizzaRest}));
                setData2(data2);
            });
    }, []);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/restaurants/vegetarian`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                const data3 = resJson.map((vegRest) => ({ id: vegRest.name, image: vegRest.image, city: vegRest.city, ...vegRest}));
                setData3(data3);
            });
    }, []);

    
    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/restaurants?keyword=${keyword}` +
        `&city=${city}`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                const data = resJson.map((restaurant) => ({ id: restaurant.name, city: restaurant.city, subcategory: restaurant.subcategory, ...restaurant}));
                setData(data);
            });
    }

    const filterPizza = () => {
        fetch(`http://${config.server_host}:${config.server_port}/restaurants/pizza?city=${city}`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                const data2 = resJson.map((pizzaRest) => ({ id: pizzaRest.name, image: pizzaRest.image, city: pizzaRest.city, ...pizzaRest}));
                setData2(data2);
            });
    }

    const filterVeg = () => {
        fetch(`http://${config.server_host}:${config.server_port}/restaurants/vegetarian?city=${city}`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                const data3 = resJson.map((vegRest) => ({ id: vegRest.name, image: vegRest.image, city: vegRest.city, ...vegRest}));
                setData3(data3);
            });
    }


    // This defines the columns of the table of songs used by the DataGrid component.
    // The format of the columns array and the DataGrid component itself is very similar to our
    // LazyTable component. The big difference is we provide all data to the DataGrid component
    // instead of loading only the data we need (which is necessary in order to be able to sort by column)
    const columns = [
        {field: 'name', headerName: 'Name', width: 400},
        { field: 'subcategory', headerName: 'Subcategory', width: 300},
        { field: 'location', headerName: 'City', width: 300},
    ]

    const columns2 = [
        { field: 'name', headerName: 'Name', width: 400},
        { field: 'image', headerName: 'Picture', width: 300, renderCell: (params) => <Avatar src={params.value} />},
        { field: 'location', headerName: 'City', width: 300}
    ]

    const columns3 = [
        { field: 'name', headerName: 'Name', width: 400},
        { field: 'image', headerName: 'Picture', width: 300, renderCell: (params2) => <Avatar src={params2.value} />},
        { field: 'location', headerName: 'City', width: 300}
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
            <h1>Restaurants</h1>
            <Grid container spacing={4}>
                <Grid item xs={8}>
                    <h4>I'm looking for:</h4>
                    <TextField label='Keyword Search' value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: 1000, height: 100 }} />
                </Grid>

            <Grid item xs={7}>
                <h4>City:</h4>
                <select value={city} onChange={(e) => {setCity(e.target.value)}} className='dropdown'>
                        <option value="Amsterdam">Amsterdam</option>
                        <option value="Barcelona">Barcelona</option>
                        <option value="Berlin">Berlin</option>
                        <option value="London">London</option>
                        <option value="Paris">Paris</option>
                        <option value="Rome">Rome</option>
                    </select>
            </Grid>


            <Grid item xs={5}>
                <Button onClick={() => {search(); filterPizza(); filterVeg();}} style={{margin: 50, color: 'white', width: '100%', backgroundColor: '#051c3b', fontSize: '2rem', transform: 'translateX(-50%)' }}>
                    SHOW ME RESTAURANTS
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

            <h2>Hungry for pizza? Check these out.</h2>
            <DataGrid
                rows={data2}
                columns={columns2}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                autoHeight
            />

            <h2>Obsessed with veggies? You'd love these places.</h2>
            <DataGrid
                rows={data3}
                columns={columns3}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25]}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                autoHeight
            />

        </Container>
        
        
    );
}