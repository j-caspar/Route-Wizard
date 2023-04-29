import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { NavLink } from 'react-router-dom';
import './pages.css';
import world from '../images/world.jpeg';

const config = require('../config.json');

export default function HomePage() {

  const flexFormat = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' };
  return (
<Container style={{ backgroundImage: `url(${world})`, backgroundSize: "cover"}}>      
      <h2 className="centered-h2"> WELCOME TO ROUTE WIZARD! TIME TO TRAVEL...&nbsp; 
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
          style={{width: 300, height: 100, background: 'LightBlue', borderRadius: '16px', border: '2px solid #000', textAlign: 'center', fontFamily: 'Arial'}}
        >
          <h4> <NavLink className='navColor' to={`/airbnbs`}>AIRBNBS</NavLink></h4>
         </Box>
      <Box
          className="middle-panel"
          p={3}
          m={2}
          style={{ width: 300, height: 100, background: 'LightBlue', borderRadius: '16px', border: '2px solid #000', textAlign: 'center', fontFamily: 'Arial' }}
        >
          <h4><NavLink className='navColor' to={`/attractions`}>ATTRACTIONS</NavLink></h4>
         </Box>
      <Box
          className="right-panel"
          p={3}
          m={2}
          style={{ width: 300, height: 100, background: 'LightBlue', borderRadius: '16px', border: '2px solid #000', textAlign: 'center', fontFamily: 'Arial'  }}
        >
          <h4><NavLink className='navColor' to={`/restaurants`}>RESTAURANTS</NavLink></h4>
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
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',width: 300, height: 100, background: 'LightBlue', borderRadius: '16px', border: '2px solid #000', textAlign: 'center' }}
        >
          <h4><NavLink className='navColor' to={`/itinerary`}>BUILD AN ITINERARY</NavLink></h4>
         </Box>
         </div>
    </Container>
  );
}