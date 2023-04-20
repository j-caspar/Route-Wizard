import { useEffect, useState } from 'react';
import { Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import './pages.css';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
const config = require('../config.json');

export default function AttractionsPage() {
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState([]);
    const [data2, setData2] = useState([]);
    const [data3, setData3] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('Amsterdam');

    const Img = styled('img')({
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    });

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions`)
            .then(res => res.json())
            .then(resJson => {
                    const data = resJson.map((attraction) => ({ id: attraction.name, city: attraction.city, subcategory: attraction.subcategory, ...attraction }));
                    setData(data);
                });
            }, []);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions/museums`
        )
            .then(res => res.json())
            .then(resJson => {
                const data2 = resJson.map((museum) => ({ id: museum.name, image: museum.image, city: museum.city, ...museum }));
                setData2(data2);
            });
        }, []);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions/adult_only`
        )
            .then(res => res.json())
            .then(resJson => {
                const data3 = resJson.map((adult) => ({ id: adult.name, image: adult.image, city: adult.city, subcategory: adult.subcategory, ...adult }));
                setData3(data3);
            });
        }, []);


    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions?keyword=${keyword}` +
            `&city=${city}`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                if (Object.keys(resJson).length === 0) {
                    setData([]);
                } else {
                    const data = resJson.map((attraction) => ({ id: attraction.name, city: attraction.city, subcategory: attraction.subcategory, ...attraction }));
                    setData(data);
                }
            });
    }

    const filterMuseums = () => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions/museums?city=${city}`
        )
            .then(res => res.json())
            .then(resJson => {
                if (Object.keys(resJson).length === 0) {
                    setData([]);
                } else {
                const data2 = resJson.map((museum) => ({ id: museum.name, image: museum.image, city: museum.city, ...museum }));
                setData2(data2);
            }
        });
}

    const filterAdult = () => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions/adult_only?city=${city}`
        )
            .then(res => res.json())
            .then(resJson => {
                if (Object.keys(resJson).length === 0) {
                    setData([]);
                } else {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                const data3 = resJson.map((adult) => ({ id: adult.name, image: adult.image, city: adult.city, subcategory: adult.subcategory, ...adult }));
                setData3(data3);
            }
        });
}


    // This defines the columns of the table of songs used by the DataGrid component.
    // The format of the columns array and the DataGrid component itself is very similar to our
    // LazyTable component. The big difference is we provide all data to the DataGrid component
    // instead of loading only the data we need (which is necessary in order to be able to sort by column)
    const columns = [
        { field: 'name', headerName: 'Name', width: 400 },
        { field: 'subcategory', headerName: 'Subcategory', width: 300 },
        { field: 'location', headerName: 'City', width: 300 },
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
            <h1>Attractions</h1>
            <Grid container spacing={4}>
                <Grid item xs={8}>
                    <h4>I'm looking for:</h4>
                    <TextField label='Keyword Search' value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: 1000, height: 100 }} />
                </Grid>

                <Grid item xs={7}>
                    <h4>City:</h4>
                    <select value={city} onChange={(e) => { setCity(e.target.value) }} className='dropdown'>
                        <option value="Amsterdam">Amsterdam</option>
                        <option value="Barcelona">Barcelona</option>
                        <option value="Berlin">Berlin</option>
                        <option value="London">London</option>
                        <option value="Paris">Paris</option>
                        <option value="Rome">Rome</option>
                    </select>
                </Grid>


                <Grid item xs={5}>
                    <Button onClick={() => { search(); filterMuseums(); filterAdult(); }} style={{ margin: 50, color: 'white', width: '100%', backgroundColor: '#051c3b', fontSize: '2rem', transform: 'translateX(-50%)' }}>
                        SHOW ME ATTRACTIONS
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

            <Paper
                sx={{
                    p: 2,
                    margin: 'auto',
                    maxWidth: '100%',
                    flexGrow: 1,
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
                }}
            >
                <h2>Paintings, scultpures, artifacts... Check out a museum! </h2>
                <Grid container spacing={2} direction="row" justifyContent="center" alignItems="stretch">
                    {data2.map((item, index) => (
                        <Grid item key={index} xs={12} sm={3} md={2} container direction="column" alignItems="center">
                            <ButtonBase sx={{ width: '100%', height: 128 }}>
                                <Img alt={item.name} src={item.image} />
                            </ButtonBase>
                            <Typography gutterBottom variant="subtitle1" component="div" align="center">
                                {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                                {item.location}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>

                <h2>21+? We know the spots.</h2>
                <Grid container spacing={2} direction="row" justifyContent="center" alignItems="stretch">
                    {data3.map((item, index) => (
                        <Grid item key={index} xs={12} sm={3} md={2} container direction="column" alignItems="center">
                            <ButtonBase sx={{ width: '100%', height: 128 }}>
                                <Img alt={item.name} src={item.image} />
                            </ButtonBase>
                            <Typography gutterBottom variant="subtitle1" component="div" align="center">
                                {item.name}
                            </Typography>
                            <Typography variant="body3" color="text.secondary" align="center">
                                {item.subcategory} in {item.location}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}