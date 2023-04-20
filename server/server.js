const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/best_airbnb', routes.bestAirbnbs);
app.get('/airbnbs', routes.airbnbs);
app.get('/restaurants', routes.restaurants);
app.get('/restaurants/random_rest', routes.random_rest);
app.get('/restaurants/pizza', routes.pizza);
app.get('/restaurants/vegetarian', routes.vegetarian);
app.get('/airbnbs/nearby_nightlife', routes.nearby_nightlife);
app.get('/airbnbs/nearby_rest', routes.nearby_rest);
app.get('/airbnbs/:bnb_name', routes.bnb);
app.get('/attractions', routes.attractions);
app.get('/random_attr', routes.random_attr);
app.get('/attractions/museums', routes.museums);
app.get('/attractions/adult_only', routes.adult_only);
app.get('/itinerary', routes.itinerary);
app.get('/travelwithfriend', routes.friends);

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
