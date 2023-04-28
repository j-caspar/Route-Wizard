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
    const [data4, setData4] = useState([]);
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
                if (Object.keys(resJson).length === 0) {
                    setData([]);
                } else {
                    const data = resJson.map((attraction) => ({ id: attraction.name, city: attraction.city, subcategory: attraction.subcategory, ...attraction }));
                    setData(data);
                }
            });
        }, []);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions/museums`
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
        }, []);

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions/adult_only`
        )
            .then(res => res.json())
            .then(resJson => {
                if (Object.keys(resJson).length === 0) {
                    setData([]);
                } else {
                    const data3 = resJson.map((adult) => ({ id: adult.name, image: adult.image, city: adult.city, subcategory: adult.subcategory, ...adult }));
                    setData3(data3);
                }
            });
        }, []);

        useEffect(() => {
            fetch(`http://${config.server_host}:${config.server_port}/attractions/bar_hopping`
            )
                .then(res => res.json())
                .then(resJson => {
                    if (Object.keys(resJson).length === 0) {
                        setData([]);
                    } else {
                        const data4 = resJson.map((bars) => ({ id: bars.name, image: bars.image, subcategory: bars.subcategory, ...bars }));
                        setData4(data4);
                    }
                });
            }, []);


    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/attractions?keyword=${keyword}` +
            `&city=${city}`
        )
            .then(res => res.json())
            .then(resJson => {
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
                const data3 = resJson.map((adult) => ({ id: adult.name, image: adult.image, city: adult.city, subcategory: adult.subcategory, ...adult }));
                setData3(data3);
            }
        });
}
const filterBars = () => {
    fetch(`http://${config.server_host}:${config.server_port}/attractions/bar_hopping?city=${city}`
    )
        .then(res => res.json())
        .then(resJson => {
            if (Object.keys(resJson).length === 0) {
                setData([]);
            } else {
            const data4 = resJson.map((bars) => ({ id: bars.name, image: bars.image, subcategory: bars.subcategory, ...bars }));
            setData4(data4);
        }
    });
}

    const columns = [
        { field: 'name', headerName: 'Name', width: 400 },
        { field: 'subcategory', headerName: 'Subcategory', width: 300 },
        { field: 'location', headerName: 'City', width: 300 },
    ]
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
                    <Button onClick={() => { search(); filterMuseums(); filterAdult(); filterBars();}} style={{ margin: 50, color: 'white', width: '100%', backgroundColor: '#051c3b', fontSize: '2rem', transform: 'translateX(-50%)' }}>
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

                <h2>Want a bar crawl? Here are three spots within one km of each other!</h2>
                <Grid container spacing={2} direction="row" justifyContent="center" alignItems="stretch">
                    {data4.map((item, index) => (
                        <Grid item key={index} xs={12} sm={3} md={2} container direction="column" alignItems="center">
                            <ButtonBase sx={{ width: '100%', height: 128 }}>
                                <Img alt={item.name} src={item.image} />
                            </ButtonBase>
                            <Typography gutterBottom variant="subtitle1" component="div" align="center">
                                {item.name}
                            </Typography>
                            <Typography variant="body3" color="text.secondary" align="center">
                                {item.subcategory}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}