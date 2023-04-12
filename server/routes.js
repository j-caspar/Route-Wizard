const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

/******************
 * FINAL PROJECT ROUTES *
 ******************/

// GET /best_airbnb
const bestAirbnbs = async function (req, res) {
  connection.query(`
      WITH top_accommodations AS (
        SELECT name, lat, lng, review_score
        FROM accommodations
        ORDER BY review_score DESC
        LIMIT 500
    ),
    nearby_restaurants AS (
        SELECT a1.name AS ac_name, COUNT(DISTINCT a3.name) AS num_restaurants
        FROM top_accommodations a1, restaurants a3
        WHERE ABS(a1.lat - a3.lat) < .01 AND ABS(a1.lng - a3.lng) < .01
        GROUP BY a1.name
    ),
    nearby_attractions AS (
        SELECT a1.name AS ac_name, COUNT(DISTINCT a2.name) AS num_attractions
        FROM top_accommodations a1, attractions a2
        WHERE ABS(a1.lat - a2.lat) < .01 AND ABS(a1.lng - a2.lng) < .01
        GROUP BY a1.name
    )
    SELECT Ac.name, Ac.picture_url, Ac.price, Ac.listing_url, Ac.review_score, Ac.lat, Ac.lng, num_restaurants AS nearby_restaurants, num_attractions as nearby_attractions
    FROM nearby_restaurants R JOIN nearby_attractions A ON R.ac_name = A.ac_name JOIN accommodations Ac ON Ac.name = R.ac_name
    ORDER BY Ac.review_score DESC, (num_restaurants + num_attractions) DESC;
  `, (err, data) => {
    if (err || data.length === 0) {
      // if there is an error for some reason, or if the query is empty (this should not be possible)
      // print the error message and return an empty object instead
      console.log(err);
      res.json([]);
    } else {
      console.log(data);
      res.json(data);
    }
  });
}

// GET /restaurants
const restaurants = async function (req, res) {
  const city = req.query.city || 'Amsterdam';
  const keyword = req.query.keyword || '';
  const subcategory = req.query.subcategory || '';

  const page = req.query.page || 1;
  const pageSize = 10; // do not allow user to change page size; set to 10
  const offset = pageSize * (page - 1);

  connection.query(`
	SELECT name, subcategory, img_url
	FROM restaurants
	WHERE name LIKE '%${keyword}%' AND location = '${city}' AND subcategory = '${subcategory}'
  LIMIT ${pageSize}
  OFFSET ${offset}
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      console.log(data);
      res.json(data);
    }
  });
}

// GET /random_rest
const random_rest = async function (req, res) {
  const city = req.query.city || 'Amsterdam';

  connection.query(`
	SELECT R.name, R.subcategory, S.picture_url
  FROM Restaurants R JOIN subcategory S ON R.subcategory = S.name
  WHERE location = '${city}'
  ORDER BY RAND() LIMIT 10
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      console.log(data);
      res.json(data);
    }
  });
}

// GET /pizza
const pizza = async function (req, res) {
  const city = req.query.city || 'Amsterdam';

  connection.query(`
  SELECT R.name, R.subcategory, S.picture_url
  FROM restaurants JOIN subcategory S ON R.subcategory = S.name
  WHERE (name LIKE '%pizza%' AND location = '${city}'
  ORDER BY RAND() LIMIT 10
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      console.log(data);
      res.json(data);
    }
  });
}

// GET /vegetarian
const vegetarian = async function (req, res) {
  const city = req.query.city || 'Amsterdam';

  connection.query(`
  SELECT R.name, R.subcategory, S.picture_url
  FROM restaurants JOIN subcategory S ON R.subcategory = S.name
  WHERE name LIKE '%Veg%' OR subcategory = 'Vegetarian / Vegan Restaurant' AND location = '${city}'
  ORDER BY RAND() LIMIT 10
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      console.log(data);
      res.json(data);
    }
  });
}


// GET /attractions
const attractions = async function (req, res) {
  const city = req.query.city || 'Amsterdam';
  const keyword = req.query.keyword || '';
  const subcategory = req.query.subcategory || '';

  const page = req.query.page || 1;
  const pageSize = 10; // do not allow user to change page size; set to 10
  const offset = pageSize * (page - 1);

  connection.query(`
	SELECT name, subcategory, img_url
	FROM attractions
	WHERE name LIKE '%${keyword}%' AND location = '${city}' AND subcategory = '${subcategory}'
  LIMIT ${pageSize}
  OFFSET ${offset}
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      console.log(data);
      res.json(data);
    }
  });
}

  // GET /random_attr
  const random_attr = async function (req, res) {
    const city = req.query.city || 'Amsterdam';

    connection.query(`
	SELECT A.name, A.subcategory, S.picture_url
  FROM attractions A JOIN subcategory S ON A.subcategory = S.name
  WHERE location = '${city}'
  ORDER BY RAND() LIMIT 10
  `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        console.log(data);
        res.json(data);
      }
    });
  }

  // GET /museums
  const museums = async function (req, res) {
    const city = req.query.city || 'Amsterdam';

    connection.query(`
    SELECT A.name, A.subcategory, S.picture_url
    FROM attractions A JOIN subcategory S ON A.subcategory = S.name
    WHERE A.name LIKE '%Museum%' OR A.subcategory = 'Museum' AND A.location = '${city}'
    ORDER BY RAND() LIMIT 10
    `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        console.log(data);
        res.json(data);
      }
    });
  }

  // GET /adult_only
  const adult_only = async function (req, res) {
    const city = req.query.city || 'Amsterdam';

    connection.query(`
      SELECT A.name, A.subcategory, S.picture_url
      FROM attractions A JOIN subcategory S ON A.subcategory = S.name
      WHERE location = '${city}' AND
      subcategory = ‘Bar’ OR subcategory = ‘Nightlife’ OR subcategory = ‘Cocktail Bar’ OR subcategory = ‘Pub’ OR subcategory = ‘Speakeasy’ OR subcategory = ‘Beer Garden’ OR subcategory = ‘Brewery’ OR subcategory = ‘Hookah Bar’ OR subcategory = ‘Gay Bar’ OR subcategory = ‘Lounge’ OR subcategory = ‘Casino’ OR subcategory = 'Comedy Club' OR subcategory = 'Dive Bar'
      LIMIT 10
      `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        console.log(data);
        res.json(data);
      }
    });
  }


  /******************
   * EXAMPLE SWIFTIFY ROUTES *
   ******************/

  // Route 2: GET /random
  const random = async function (req, res) {
    // you can use a ternary operator to check the value of request query values
    // which can be particularly useful for setting the default value of queries
    // note if users do not provide a value for the query it will be undefined, which is falsey
    const explicit = req.query.explicit === 'true' ? 1 : 0;

    // Here is a complete example of how to query the database in JavaScript.
    // Only a small change (unrelated to querying) is required for TASK 3 in this route.
    connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit}
    ORDER BY RAND()
    LIMIT 1
  `, (err, data) => {
      if (err || data.length === 0) {
        // if there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        res.json({});
      } else {
        // Here, we return results of the query as an object, keeping only relevant data
        // being song_id and title which you will add. In this case, there is only one song
        // so we just directly access the first element of the query results array (data)
        // TODO (TASK 3): also return the song title in the response
        res.json({
          song_id: data[0].song_id, title: data[0].title
        });
      }
    });
  }

  /********************************
   * BASIC SONG/ALBUM INFO ROUTES *
   ********************************/

  // Route 3: GET /song/:song_id
  const song = async function (req, res) {
    // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
    // Most of the code is already written for you, you just need to fill in the query

    const song_id = req.params.song_id;

    connection.query(`
  SELECT *
  FROM Songs
  WHERE song_id = '${song_id}'
  `, (err, data) => {
      if (err || data.length === 0) {
        // if there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        res.json({});
      } else {
        res.json({
          song_id: data[0].song_id, album_id: data[0].album_id, title: data[0].title, number: data[0].number,
          duration: data[0].duration, plays: data[0].plays, danceability: data[0].danceability,
          energy: data[0].energy, valence: data[0].valence, tempo: data[0].tempo, key_mode: data[0].key_mode,
          explicit: data[0].explicit
        });
      }
    });
  }

  // Route 4: GET /album/:album_id
  const album = async function (req, res) {
    // TODO (TASK 5): implement a route that given a album_id, returns all information about the album
    const album_id = req.params.album_id;

    connection.query(`
  SELECT *
  FROM Albums
  WHERE album_id = '${album_id}'
  `, (err, data) => {
      if (err || data.length === 0) {
        // if there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        res.json({});
      } else {
        console.log(data[0]);
        res.json({
          album_id: data[0].album_id, title: data[0].title, release_date: data[0].release_date,
          thumbnail_url: data[0].thumbnail_url
        });
      }
    });
  }

  // Route 5: GET /albums
  const albums = async function (req, res) {
    // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
    // Note that in this case you will need to return multiple albums, so you will need to return an array of objects

    connection.query(`
  SELECT *
  FROM Albums
  ORDER BY release_date DESC
  `, (err, data) => {
      if (err || data.length === 0) {
        // if there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        res.json([]);
      } else {
        console.log(data[0]);
        res.json(data);
      }
    });
  }

  // Route 6: GET /album_songs/:album_id
  const album_songs = async function (req, res) {
    // TODO (TASK 7): implement a route that given an album_id, returns all songs on that album ordered by track number (ascending)
    const album_id = req.params.album_id;

    connection.query(`
  SELECT song_id, title, number, duration, plays
  FROM Songs 
  WHERE album_id = '${album_id}'
  ORDER BY number
  `, (err, data) => {
      if (err || data.length === 0) {
        // if there is an error for some reason, or if the query is empty (this should not be possible)
        // print the error message and return an empty object instead
        console.log(err);
        res.json([]);
      } else {
        console.log(data);
        res.json(data);
      }
    });
  }

  /************************
   * ADVANCED INFO ROUTES *
   ************************/

  // Route 7: GET /top_songs
  const top_songs = async function (req, res) {
    const page = req.query.page;
    // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10

    //returns 10 if req.query.pageSize is null or undefined and req.query.pageSize otherwise
    const pageSize = req.query.page_size ?? 10;

    if (!page) {
      // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
      // Hint: you will need to use a JOIN to get the album title as well

      connection.query(`
    SELECT s.song_id, s.title, s.album_id, a.title AS album, s.plays
    FROM Songs s JOIN Albums a ON s.album_id = a.album_id
    ORDER BY s.plays DESC
    `, (err, data) => {
        if (err || data.length === 0) {
          // if there is an error for some reason, or if the query is empty (this should not be possible)
          // print the error message and return an empty object instead
          console.log(err);
          res.json([]);
        } else {
          console.log(data);
          res.json(data);
        }
      });
    } else {
      // TODO (TASK 10): reimplement TASK 9 with pagination
      // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)

      const offset = pageSize * (page - 1);
      connection.query(`
    SELECT s.song_id, s.title, s.album_id, a.title AS album, s.plays
    FROM Songs s JOIN Albums a ON s.album_id = a.album_id
    ORDER BY s.plays DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
    `, (err, data) => {
        if (err || data.length === 0) {
          // if there is an error for some reason, or if the query is empty (this should not be possible)
          // print the error message and return an empty object instead
          console.log(err);
          res.json([]);
        } else {
          res.json(data);
        }
      });
    }
  }

  // Route 8: GET /top_albums
  const top_albums = async function (req, res) {
    // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
    // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album

    const page = req.query.page;

    //returns 10 if req.query.pageSize is null or undefined and req.query.pageSize otherwise
    const pageSize = req.query.page_size ?? 10;

    if (!page) {
      connection.query(`
    SELECT a.album_id, a.title, SUM(s.plays) AS plays
    FROM Songs s JOIN Albums a ON s.album_id = a.album_id
    GROUP BY a.album_id, a.title
    ORDER BY SUM(s.plays) DESC
    `, (err, data) => {
        if (err || data.length === 0) {
          // if there is an error for some reason, or if the query is empty (this should not be possible)
          // print the error message and return an empty object instead
          console.log(err);
          res.json([]);
        } else {
          console.log(data);
          res.json(data);
        }
      });
    } else {
      const offset = pageSize * (page - 1);
      connection.query(`
    SELECT a.album_id, a.title, SUM(s.plays) AS plays
    FROM Songs s JOIN Albums a ON s.album_id = a.album_id
    GROUP BY a.album_id, a.title
    ORDER BY SUM(s.plays) DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
    `, (err, data) => {
        if (err || data.length === 0) {
          // if there is an error for some reason, or if the query is empty (this should not be possible)
          // print the error message and return an empty object instead
          console.log(err);
          res.json([]);
        } else {
          res.json(data);
        }
      });
    }
  }

  // Route 9: GET /search_songs
  const search_songs = async function (req, res) {
    // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
    // Some default parameters have been provided for you, but you will need to fill in the rest
    const title = req.query.title ?? '';
    const durationLow = req.query.duration_low ?? 60;
    const durationHigh = req.query.duration_high ?? 660;
    const playsLow = req.query.plays_low ?? 0;
    const playsHigh = req.query.plays_high ?? 1100000000;
    const danceabilityLow = req.query.danceability_low ?? 0;
    const danceabilityHigh = req.query.danceability_high ?? 1;
    const energyLow = req.query.energy_low ?? 0;
    const energyHigh = req.query.energy_high ?? 1;
    const valenceLow = req.query.valence_low ?? 0;
    const valenceHigh = req.query.valence_high ?? 1;
    const explicit = req.query.explicit === 'true' ? 1 : 0;

    if (title != '') {
      connection.query(`
    SELECT *
    FROM Songs
    WHERE title LIKE '%${title}%' AND explicit <= ${explicit} AND duration >= ${durationLow}
    AND duration <= ${durationHigh} AND plays >= ${playsLow} AND plays <= ${playsHigh} AND
    danceability >= ${danceabilityLow} AND danceability <= ${danceabilityHigh} AND 
    energy >= ${energyLow} AND energy <= ${energyHigh} AND valence >= ${valenceLow} AND valence <= ${valenceHigh}
    ORDER BY title
    `, (err, data) => {
        if (err || data.length === 0) {
          // if there is an error for some reason, or if the query is empty (this should not be possible)
          // print the error message and return an empty object instead
          console.log(err);
          res.json([]);
        } else {
          res.json(data);
        }
      });
    }
    else {
      connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit} AND duration >= ${durationLow}
    AND duration <= ${durationHigh} AND plays >= ${playsLow} AND plays <= ${playsHigh} AND
    danceability >= ${danceabilityLow} AND danceability <= ${danceabilityHigh} AND 
    energy >= ${energyLow} AND energy <= ${energyHigh} AND valence >= ${valenceLow} AND valence <= ${valenceHigh}
    ORDER BY title
    `, (err, data) => {
        if (err || data.length === 0) {
          // if there is an error for some reason, or if the query is empty (this should not be possible)
          // print the error message and return an empty object instead
          console.log(err);
          res.json([]);
        } else {
          res.json(data);
        }
      });
    }
  }

  module.exports = {
    author,
    random,
    song,
    album,
    albums,
    album_songs,
    top_songs,
    top_albums,
    search_songs,
  }
