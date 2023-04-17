import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Link, Modal } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useParams, NavLink } from 'react-router-dom';

import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

// SongCard is a modal (a common example of a modal is a dialog window).
// Typically, modals will conditionally appear (specified by the Modal's open property)
// but in our implementation whether the Modal is open is handled by the parent component
// (see HomePage.js for example), since it depends on the state (selectedSongId) of the parent
export default function AirbnbCard({ airbnbName, handleClose }) {
  const [airbnbData, setAirbnbData] = useState({});

  const [barRadar, setBarRadar] = useState(true);

  // TODO (TASK 20): fetch the song specified in songId and based on the fetched album_id also fetch the album data
  // Hint: you need to both fill in the callback and the dependency array (what variable determines the information you need to fetch?)
  // Hint: since the second fetch depends on the information from the first, try nesting the second fetch within the then block of the first (pseudocode is provided)
  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    // fetch(song data, id determined by songId prop)
    //   .then(res => res.json())
    //   .then(resJson => {
    //     set state variable with song dta
    //     fetch(album data, id determined by result in resJson)
    //       .then(res => res.json())
    //       .then(resJson => set state variable with album data)
    //     })
    fetch(`http://${config.server_host}:${config.server_port}/airbnbs/${airbnbName}`)
    .then(res => res.json())
    .then(resJson => {
      setAirbnbData(resJson[0]); console.log(resJson[0])
    })
  }, []);

  const chartData = [
    { name: 'Image', value: airbnbData.picture_url},
    { name: 'Price', value: airbnbData.price},
    { name: 'Neighborhood', value: airbnbData.neighborhood},
    { name: 'Minimum # of nights', value: airbnbData.min_nights },
    { name: 'Max # of guests', value: airbnbData.num_accommodates},
    { name: 'Listing URL', value: airbnbData.listing_url },
    { name: 'Review Score', value: airbnbData.review_score},
    { name: '# of reviews', value: airbnbData.num_reviews},
    { name: 'Host is superhost', value: airbnbData.host_is_superhost },
    { name: 'Review Score', value: airbnbData.review_score}
  ];

  const handleGraphChange = () => {
    setBarRadar(!barRadar);
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>{airbnbData.name}</h1>
        <h2>Link:&nbsp;
          <NavLink to={`/airbnb/${airbnbData.bnb_name}`}>{airbnbData.name}</NavLink>
        </h2>
        <p>Price/Night: {airbnbData.price} </p>
        <p>Neighborhood: {airbnbData.neighborhood} </p>
        <p>Minimum # of nights: {airbnbData.min_nights} </p>
        <p>Max # of guests: {airbnbData.num_accommodates} </p>
        <p>Rating: {airbnbData.review_score} </p>
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  );
}