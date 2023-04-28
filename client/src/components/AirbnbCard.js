import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Link, Modal } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useParams, NavLink } from 'react-router-dom';

import { formatDuration } from '../helpers/formatter';
const config = require('../config.json');

export default function AirbnbCard({ airbnbName, handleClose }) {
  const [airbnbData, setAirbnbData] = useState({});

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/airbnbs/${airbnbName}`)
    .then(res => res.json())
    .then(resJson => {
      if (resJson.length > 0) {
        setAirbnbData(resJson[0]);
      }
    })
  }, []);

  return (
    <>
    {airbnbData.length !== 0 && (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>Get More Info:&nbsp;
          <NavLink to={`/airbnbs/${airbnbData.name}`}>{airbnbData.name}</NavLink>
        </h1>
        <p>Price/Night: ${airbnbData.price} </p>
        <p>Neighborhood: {airbnbData.neighborhood} </p>
        <p>Minimum # of nights: {airbnbData.min_nights} </p>
        <p>Max # of guests: {airbnbData.num_accommodates} </p>
        <p>Rating: {airbnbData.review_score} </p>
        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
    )}
  </>
  );
}