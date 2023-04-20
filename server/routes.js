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
        LIMIT 100
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
	SELECT DISTINCT(R.name), R.location, R.subcategory, S.image
	FROM restaurants R JOIN subcategory S ON R.subcategory = S.name
  WHERE (R.name LIKE '%${keyword}%' OR R.subcategory LIKE '%${keyword}%') AND R.location LIKE '%${city}%'
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
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
	SELECT R.name, R.subcategory, S.image
  FROM Restaurants R JOIN subcategory S ON R.subcategory = S.name
  WHERE location LIKE '${city}'
  ORDER BY RAND() LIMIT 10
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
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
  SELECT R.name, S.image, R.location
  FROM restaurants R LEFT JOIN subcategory S ON R.subcategory = S.name
  WHERE (R.name LIKE '%pizza%' OR R.subcategory LIKE '%Pizza Place%') AND R.location LIKE '${city}' AND S.image IS NOT NULL
  ORDER BY RAND() LIMIT 5;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
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
  SELECT R.name, S.image, R.location
  FROM restaurants R LEFT JOIN subcategory S ON R.subcategory = S.name
  WHERE (R.name LIKE '%Veg%' OR R.subcategory = 'Vegetarian / Vegan Restaurant') AND R.location LIKE '${city}' AND S.image IS NOT NULL
  ORDER BY RAND() LIMIT 5;
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      console.log(data);
      res.json(data);
    }
  });
}

// GET /nearby_nightlife
const nearby_nightlife = async function (req, res) {
  const lng = req.query.lng ;
  const lat = req.query.lat ;
  const location = req.query.location ;

  connection.query(`
  SELECT A.name, A.subcategory, S.image, A.lat, A.lng
  FROM attractions A JOIN subcategory S ON A.subcategory = S.name
  WHERE location = '${location}' AND S.adult_only = true
  GROUP BY A.name, A.subcategory, S.image
  ORDER BY MIN(SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)))
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

// GET /nearby_rest
const nearby_rest = async function (req, res) {
  const lng = req.query.lng ;
  const lat = req.query.lat ;
  const location = req.query.location ;

  connection.query(`
  SELECT A.name, A.subcategory, S.image, A.lat, A.lng
  FROM restaurants A JOIN subcategory S ON A.subcategory = S.name
  WHERE location = '${location}'
  GROUP BY A.name, A.subcategory, S.image
  ORDER BY MIN(SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)))
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

  // const lng = req.query.lng;
  // const lat = req.query.lat;

  // connection.query(`
  // CREATE TABLE tempDist(name varchar(255), dist DECIMAL(28, 20));
  // INSERT INTO tempDist(name, dist)
  // SELECT name, (SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)))
  // FROM location
  // WHERE type = 'Restaurant';
  
  // CREATE INDEX IX_closest ON tempDist(dist);
  
  // SELECT R.name, R.subcategory, tempDist.dist
  // FROM restaurants R JOIN tempDist USE INDEX(IX_closest) ON R.name = tempDist.name
  // LIMIT 10
  // ;
  
  // DROP TABLE IF EXISTS tempDist`, (err, data) => {
  //   if (err || data.length === 0) {
  //     console.log(err);
  //     res.json({});
  //   } else {
  //     console.log(data);
  //     res.json(data);
  //   }
  // });
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
      S.adult_only = true
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

// GET /airbnbs
const airbnbs = async function (req, res) {
  const city = req.query.city || 'Amsterdam';
  const nights = req.query.nights || 1;
  const num_people = req.query.numPeople || 1;
  const min_price = req.query.minPrice || 20;
  const max_price = req.query.maxPrice || 1000;
  const lng = req.query.lng || 4.9041;
  const lat = req.query.lat || 52.3676;

  connection.query(`
  SELECT name, picture_url, price, listing_url, review_score, lat, lng
  FROM accommodations
  WHERE ${nights} >= min_nights AND ${min_price} <= price AND ${max_price} >= price AND
  ${num_people} < num_accommodates AND location = '${city}' AND review_score IS NOT NULL
  GROUP BY name, picture_url, price, listing_url, review_score, lat, lng
  ORDER BY MAX(exp(SQRT((${lat}- lat) * (${lat}- lat) + (${lng} - lng) * (${lng} - lng))) * -3 * (LOG(num_reviews + 1) * 0.2) * (POWER(review_score, 3) / 150 ))
  LIMIT 20  
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

// GET /airbnbs/:bnb_name
const bnb = async function (req, res) {

  const bnb_name = req.params.bnb_name;

  connection.query(`
  Select *
  FROM accommodations
  WHERE name = '${bnb_name}'
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

// GET /itinerary
const itinerary = async function (req, res) {
  const city = req.query.city || 'Amsterdam';
  const days = req.query.days || 1;
  const num_people = req.query.num_people || 1;
  const min_price = req.query.min_price || 20;
  const max_price = req.query.max_price || 1000;
  const adult_only = req.query.adult_only || true;
  const lng = req.query.lng || 4.9041;
  const lat = req.query.lat || 52.3676;
  const num_rest_att = req.query.days * 2 || 2;

  connection.query(`

  WITH hotel AS ( 
    SELECT name, lat, lng, picture_url as image, 'Accommodation' AS type, 'Airbnb' AS subcategory
    FROM accommodations
    WHERE  ${days} >= min_nights AND ${min_price} <= price AND ${max_price} >= price AND ${num_people} < num_accommodates AND location = '${city}' AND review_score IS NOT NULL
  GROUP BY name, picture_url, price, lat, lng, type
  ORDER BY MAX(exp(SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng))) * -3 * (LOG(num_reviews + 1) * 0.2) * (POWER(review_score, 3) / 150 )) LIMIT 1
  ), rest AS (
    SELECT R.name, lat, lng, S.image as image, 'Restaurant' AS type, R.subcategory AS subcategory
    FROM restaurants R join subcategory S on R.subcategory=S.name
    WHERE location = '${city}' AND 
    (R.subcategory <> 'Bagel Shop' AND R.subcategory <> 'Bakery'
     AND R.subcategory <> 'Breakfast Spot' AND R.subcategory <> 'Donut Shop' AND R.subcategory <> 'Coffee Shop') AND
  SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)) * 111.139 < 5
  ORDER BY RAND()
  LIMIT ${num_rest_att}
  ), attrac AS (
    SELECT A.name, lat, lng, S.image as image, 'Attraction' AS type, A.subcategory AS subcategory
    FROM attractions A join subcategory S on A.subcategory=S.name
    WHERE location = '${city}' AND (S.adult_only = false OR S.adult_only = ${adult_only}) AND
  SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)) * 111.139 < 5
  ORDER BY RAND()
  LIMIT ${num_rest_att}
  ), nightlife AS (
    SELECT B.name, lat, lng, S.image as image, 'Nightlife' AS type, B.subcategory AS subcategory
    FROM attractions B join subcategory S on B.subcategory = S.name
    WHERE B.location = '${city}' AND S.adult_only = ${adult_only} AND 
    (S.adult_only = true OR B.subcategory = 'Bowling Alley'
    OR B.subcategory = 'Harbor / Marina' OR B.subcategory = 'Movie Theater' OR B.subcategory = 'Theater') AND
  SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)) * 111.139 < 5
  ORDER BY RAND()
  LIMIT ${days}
  ), breakfast AS (
     SELECT R.name, lat, lng, S.image as image, 'Breakfast' AS type, R.subcategory AS subcategory
    FROM restaurants R join subcategory S on R.subcategory=S.name
    WHERE location = '${city}' AND (R.subcategory = 'Bagel Shop' OR R.subcategory = 'Bakery'
     OR R.subcategory = 'Breakfast Spot' OR R.subcategory = 'Donut Shop' OR R.subcategory = 'Coffee Shop')
     ORDER BY RAND()
     LIMIT ${days}
  )
  SELECT * FROM hotel
  UNION
  SELECT * FROM rest
  UNION
  SELECT * FROM attrac
  UNION
  SELECT * FROM nightlife
  UNION
  SELECT * FROM breakfast;
  
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

// GET /travelwithfriend
const friends = async function (req, res) {
  const city = req.query.city;
  const A_num_people = req.query.A_num_people || 1;
  const A_min_price = req.query.A_min_price || 20;
  const A_max_price = req.query.A_max_price || 1000;
  const A_min_nights = req.query.A_min_nights || 1;
  const B_num_people = req.query.B_num_people || 1;
  const B_min_price = req.query.B_min_price || 20;
  const B_max_price = req.query.B_max_price || 1000;
  const B_min_nights = req.query.B_min_nights || 1;


  connection.query(`

  SELECT A.name as name, A.picture_url as picture_url, A.price as price, A.listing_url as listing_url, A.review_score as review_score, A.num_reviews as num_reviews,
  B.name as bname, B.picture_url as bpicture_url, B.price as bprice, B.listing_url as blisting_url, B.review_score as breview_score, B.num_reviews as bnum_reviews,
  SQRT((A.lat - B.lat) * (A.lat - B.lat) + (A.lng - B.lng) * (A.lng - B.lng)) * 111.139 AS Distance
  FROM accommodations A JOIN accommodations B ON SQRT((A.lat - B.lat) * (A.lat - B.lat) + (A.lng - B.lng) * (A.lng - B.lng)) * 111.139 < 1
  WHERE ${A_min_nights} >= A.min_nights AND ${B_min_nights} >= B.min_nights
  AND ${A_min_price} <= A.price AND ${A_max_price} >= A.price AND ${B_min_price} <= B.price AND ${B_max_price} >= B.price
  AND ${A_num_people} <= A.num_accommodates AND ${B_num_people} <= B.num_accommodates AND A.location = '${city}'  AND B.location = '${city}'
  AND A.review_score IS NOT NULL AND B.review_score IS NOT NULL
  AND A.name != B.name
  GROUP BY A.name, B.name, A.picture_url, A.price, A.listing_url, A.review_score, A.num_reviews,
  B.picture_url, B.price, B.listing_url, B.review_score, B.num_reviews
  ORDER BY MAX(exp(Distance) * -4 * (LOG(((A.num_reviews + B.num_reviews) / 2) + 1) * 0.2) *
  (POWER(((A.review_score + B.review_score) / 2), 3) / 150 )) LIMIT 10
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
    bestAirbnbs,
    restaurants,
    random_rest,
    pizza,
    vegetarian,
    nearby_nightlife,
    attractions,
    random_attr,
    museums,
    adult_only,
    itinerary,
    friends,
    nearby_rest,
    airbnbs,
    bnb,
  }
