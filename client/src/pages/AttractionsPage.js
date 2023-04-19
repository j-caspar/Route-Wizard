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

    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState([60, 660]);
    const [plays, setPlays] = useState([0, 1100000000]);
    const [danceability, setDanceability] = useState([0, 1]);
    const [energy, setEnergy] = useState([0, 1]);
    const [valence, setValence] = useState([0, 1]);
    const [explicit, setExplicit] = useState(false);

    const [value, setValue] = useState('fruit');
    const handleChange = (event) => {
        setValue(event.target.value);
    }

    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/search_songs`)
            .then(res => res.json())
            .then(resJson => {
                const songsWithId = resJson.map((song) => ({ id: song.song_id, ...song }));
                setData(songsWithId);
            });
    }, []);

    const search = () => {
        fetch(`http://${config.server_host}:${config.server_port}/search_songs?title=${title}` +
            `&duration_low=${duration[0]}&duration_high=${duration[1]}` +
            `&plays_low=${plays[0]}&plays_high=${plays[1]}` +
            `&danceability_low=${danceability[0]}&danceability_high=${danceability[1]}` +
            `&energy_low=${energy[0]}&energy_high=${energy[1]}` +
            `&valence_low=${valence[0]}&valence_high=${valence[1]}` +
            `&explicit=${explicit}`
        )
            .then(res => res.json())
            .then(resJson => {
                // DataGrid expects an array of objects with a unique id.
                // To accomplish this, we use a map with spread syntax (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                const songsWithId = resJson.map((song) => ({ id: song.song_id, ...song }));
                setData(songsWithId);
            });
    }

    // This defines the columns of the table of songs used by the DataGrid component.
    // The format of the columns array and the DataGrid component itself is very similar to our
    // LazyTable component. The big difference is we provide all data to the DataGrid component
    // instead of loading only the data we need (which is necessary in order to be able to sort by column)
    const columns = [
        {
            field: 'title', headerName: 'Title', width: 300, renderCell: (params) => (
                <Link onClick={() => setSelectedSongId(params.row.song_id)}>{params.value}</Link>
            )
        },
        { field: 'duration', headerName: 'Duration' },
        { field: 'plays', headerName: 'Plays' },
        { field: 'danceability', headerName: 'Danceability' },
        { field: 'energy', headerName: 'Energy' },
        { field: 'valence', headerName: 'Valence' },
        { field: 'tempo', headerName: 'Tempo' },
        { field: 'key_mode', headerName: 'Key' },
        { field: 'amsterdam', headerName: 'Amsterdam' },
        { field: 'barcelona', headerName: 'Barcelona' },
        { field: 'berlin', headerName: 'Berlin' },
        { field: 'london', headerName: 'London' },
        { field: 'paris', headerName: 'Paris' },
        { field: 'rome', headerName: 'Rome' }
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
            {selectedSongId && <AirbnbCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />}
            <h2 className='centered-h2-rest'>Attractions</h2>
            <h4>I'm looking for:</h4>
            <Grid container spacing={6}>

                <Grid item xs={8}>
                    <TextField label='Keyword Search' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 1000, height: 100 }} />
                </Grid>
            </Grid>

            <h4>I'm looking near:</h4>
            <Grid container spacing={6}>

                <Grid item xs={8}>
                    <TextField label='Where are you now?' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 1000, height: 100 }} />
                </Grid>
            </Grid>

            <h4>City:</h4>
            <Grid container spacing={6}>

                <Grid item xs={8}>
                    <select value={value} onChange={handleChange} className='dropdown'>
                        <option value="Amsterdam">Amsterdam</option>
                        <option value="Barcelona">Barcelona</option>
                        <option value="Berlin">Berlin</option>
                        <option value="London">London</option>
                        <option value="Paris">Paris</option>
                        <option value="Rome">Rome</option>
                    </select>
                </Grid>
            </Grid>



            <Button onClick={() => search()} style={{margin: 50, color: 'white', backgroundColor: '#051c3b', fontSize: '2rem', left: '50%', transform: 'translateX(-50%)' }}>
                SHOW ME ATTRACTIONS
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