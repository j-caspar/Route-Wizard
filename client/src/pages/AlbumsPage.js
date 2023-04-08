import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';
import './pages.css';
import world from '../images/world.jpeg';

const config = require('../config.json');

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/albums`)
      .then(res => res.json())
      .then(resJson => setAlbums(resJson));
  }, []);

  // flexFormat provides the formatting options for a "flexbox" layout that enables the album cards to
  // be displayed side-by-side and wrap to the next line when the screen is too narrow. Flexboxes are
  // incredibly powerful. You can learn more on MDN web docs linked below (or many other online resources)
  // https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox
  const flexFormat = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' };

  return (
    // TODO (TASK 22): replace the empty object {} in the Container's style property with flexFormat. Observe the change to the Albums page.
    // TODO (TASK 22): then uncomment the code to display the cover image and once again observe the change, i.e. what happens to the layout now that each album card has a fixed width?
    <Container style={{ backgroundImage: `url(${world})`, backgroundSize: "cover"}}>
      
      <h2 className="centered-h2"> TIME TO TRAVEL:&nbsp; 
      </h2>
      <h4 className="centered-h2">What are you searching for?&nbsp;
      </h4>
      <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}}>
      <Box
          className="left-panel"
          p={3}
          m={2}
          style={{ width: 300, height: 100, background: 'paleturquoise', borderRadius: '16px', border: '2px solid #000', textAlign: 'center' }}
        >
          Hotels
         </Box>
      <Box
          className="middle-panel"
          p={3}
          m={2}
          style={{ width: 300, height: 100, background: 'paleturquoise', borderRadius: '16px', border: '2px solid #000', textAlign: 'center' }}
        >
          Attractions
         </Box>
      <Box
          className="right-panel"
          p={3}
          m={2}
          style={{ width: 300, height: 100, background: 'paleturquoise', borderRadius: '16px', border: '2px solid #000', textAlign: 'center' }}
        >
          Restaurants
         </Box>
         </div>
      <h2 className="centered-h2"> OR&nbsp; 
      </h2>
      <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}}>
      <Box
          p={3}
          m={2}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',width: 300, height: 100, background: 'paleturquoise', borderRadius: '16px', border: '2px solid #000', textAlign: 'center' }}
        >
          Build an itinerary
         </Box>
         </div>
      {albums.map((album) =>
        <Box
          key={album.album_id}
          p={3}
          m={2}
          style={{ background: 'white', borderRadius: '16px', border: '2px solid #000'}}
        >
          {
          <img
            src={album.thumbnail_url}
            alt={`${album.title} album art`}
          />
          }
          <h4><NavLink to={`/albums/${album.album_id}`}>{album.title}</NavLink></h4>
        </Box>
      )}
    </Container>
  );
}