import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import AirbnbCard from '../components/AirbnbCard';
import { formatDuration, formatReleaseDate } from '../helpers/formatter';
const config = require('../config.json');

export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

export default function AlbumInfoPage() {
  const { bnb_name } = useParams();

  const [airbnbData, setAirbnbData] = useState([{}]);
  const [songData, setSongData] = useState([{}]); // default should actually just be [], but empty object element added to avoid error in template code
  const [albumData, setAlbumData] = useState([]);

  const [selectedAirbnbName, setSelectedAirbnbName] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/airbnbs/${bnb_name}`)
      .then(res => res.json())
      .then(resJson => setAirbnbData(resJson[0]));
  }, []);

  return (
    
    <Container>
      <h1 style={{ fontSize: 64, textAlign: 'center' }}>{airbnbData.name}</h1>
      {selectedAirbnbName && <AirbnbCard airbnbName={selectedAirbnbName} handleClose={() => setSelectedAirbnbName(null)} />}
      <Stack direction='row' justify='center'>
        <img
          src={airbnbData.picture_url}
          style={{
            marginTop: '40px',
            marginRight: '40px',
            marginLeft: '40px',
            marginBottom: '40px',
            width: '1000px',
            height: '700px',
            alignSelf: 'center'
          }}
        />
        
      </Stack>
      <h2>Listing URL:&nbsp;
      <Link href="#" onClick = {() => openInNewTab(airbnbData.listing_url)}>{airbnbData.name}</Link></h2>
      <p>Price/Night: ${airbnbData.price} </p>
      <p>Neighborhood: {airbnbData.neighborhood} </p>
      <p>Minimum # of nights: {airbnbData.min_nights} </p>
      <p>Max # of guests: {airbnbData.num_accommodates} </p>
      <p>Rating: {airbnbData.review_score} </p>
      <p>Number of reviews: {airbnbData.num_reviews} </p>
      {airbnbData.host_is_superhost == 't' &&
        <h2>
          This host is a superhost!
        </h2>
      }
    </Container>
  );
}