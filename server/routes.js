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

// // GET /random_rest
// const random_rest = async function (req, res) {
//   const city = req.query.city || 'Amsterdam';

//   connection.query(`
// 	SELECT R.name, R.subcategory, S.image
//   FROM Restaurants R JOIN subcategory S ON R.subcategory = S.name
//   WHERE location LIKE '${city}'
//   ORDER BY RAND() LIMIT 10
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       console.log(err);
//       res.json([]);
//     } else {
//       console.log(data);
//       res.json(data);
//     }
//   });
// }

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

const nearby_nightlife = async function (req, res) {
  const lng = req.query.lng;
  const lat = req.query.lat;
  const location = req.query.location;

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

/*

// GET /nearby_rest
// const nearby_rest = async function (req, res) {
//   const lng = req.query.lng ;
//   const lat = req.query.lat ;
//   const location = req.query.location ;

//   connection.query(`
//   SELECT A.name, A.subcategory, S.image, A.lat, A.lng
//   FROM restaurants A JOIN subcategory S ON A.subcategory = S.name
//   WHERE location = '${location}'
//   GROUP BY A.name, A.subcategory, S.image
//   ORDER BY MIN(SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)))
//   LIMIT 10
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       console.log(err);
//       res.json({});
//     } else {
//       console.log(data);
//       res.json(data);
//     }
//   });

/*
 const nearby_rest = async function (req, res) {
   const lng = req.query.lng ;
   const lat = req.query.lat ;

   connection.query(`
   CREATE TABLE tempDist(name varchar(255), dist DECIMAL(28, 20));
    INSERT INTO tempDist(name, dist) (
    SELECT name, (SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)))
    FROM location
    WHERE type = 'Restaurant');
    CREATE INDEX IX_closest ON tempDist(dist);
    SELECT DISTINCT(R.name), tempDist.dist, R.subcategory
      FROM restaurants R
      JOIN tempDist ON R.name = tempDist.name
      ORDER BY dist
      LIMIT 10;
    '
   `, (err, data) => {
     if (err || data.length === 0) {
       console.log(err);
       console.log("Data is empty");
       res.json({});
     } else {
      console.log("Data is NOT EMPTY");
      console.log(data);
       res.json(data);
   }});
 }

 */

const nearby_rest = async function (req, res) {
  const lng = req.query.lng;
  const lat = req.query.lat;

  connection.query(
  `SELECT name, (SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng))) AS dist, lat, lng
  FROM restaurants
  ORDER BY dist
  LIMIT 10`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json([]);
    } else {
      console.log(data);
      res.json(data);
    }
  });
}

/* 
const nearby_rest = (req, res) => {
const lng = req.query.lng ;
const lat = req.query.lat ;
 
// Execute the first query
const createTempTableQuery = `
CREATE TABLE tempDist(name varchar(255), dist DECIMAL(28, 20));
INSERT INTO tempDist(name, dist) (
SELECT name, (SQRT((${lat} - lat) * (${lat} - lat) + (${lng} - lng) * (${lng} - lng)))
FROM location
WHERE type = 'Restaurant');
`;
connection.query(createTempTableQuery, (err, results) => {
if (err) {
 // Handle error and send response
 console.error(err);
} else {
 // Execute the second query
 const createIndexQuery = 'CREATE INDEX IX_closest ON tempDist(dist);';
 connection.query(createIndexQuery, (err, results) => {
   if (err) {
     // Handle error and send response
     console.error(err);
   } else {
     // Execute the third query
     const fetchQuery = `
 SELECT DISTINCT(R.name), tempDist.dist, R.subcategory
 FROM restaurants R
 JOIN tempDist ON R.name = tempDist.name
 ORDER BY dist
 LIMIT 10;
 `;
     connection.query(fetchQuery, (err, results) => {
       if (err) {
         // Handle error and send response
         console.error(err);
       } else {
         // Send the results to the client
         console.log(results);
         res.json(results);
       }
     });
   }
 });
}
});
} */


// GET /attractions
const attractions = async function (req, res) {
  const city = req.query.city || 'Amsterdam';
  const keyword = req.query.keyword || '';

  const page = req.query.page || 1;
  const pageSize = 10; // do not allow user to change page size; set to 10

  connection.query(`
	SELECT DISTINCT(A.name), A.location, A.subcategory, S.image
	FROM attractions A LEFT JOIN subcategory S ON A.subcategory = S.name
	WHERE (A.name LIKE '%${keyword}%' OR A.subcategory LIKE '%${keyword}%') AND A.location LIKE '%${city}%'
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

// // GET /random_attr
// const random_attr = async function (req, res) {
//   const city = req.query.city || 'Amsterdam';

//   connection.query(`
// 	SELECT A.name, A.subcategory, S.image
//   FROM attractions A JOIN subcategory S ON A.subcategory = S.name
//   WHERE location LIKE '%${city}%'
//   ORDER BY RAND() LIMIT 10
//   `, (err, data) => {
//     if (err || data.length === 0) {
//       console.log(err);
//       res.json({});
//     } else {
//       console.log(data);
//       res.json(data);
//     }
//   });
// }

// GET /museums
const museums = async function (req, res) {
  const city = req.query.city || 'Amsterdam';

  connection.query(`
    SELECT A.name, S.image, A.location
    FROM attractions A LEFT JOIN subcategory S ON A.subcategory = S.name
    WHERE (A.name LIKE '%Museum%' OR A.subcategory = 'Museum') AND A.location LIKE '%${city}%'
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

// GET /adult_only
const adult_only = async function (req, res) {
  const city = req.query.city || 'Amsterdam';

  connection.query(`
      SELECT A.name, S.image, A.location, A.subcategory
      FROM attractions A LEFT JOIN subcategory S ON A.subcategory = S.name
      WHERE A.location LIKE '%${city}%' AND
      S.adult_only = true AND S.image IS NOT NULL
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

// GET /bar_hopping
const bar_hopping = async function (req, res) {
  const city = req.query.city || 'Amsterdam';

  connection.query(`
  WITH bar1 AS (
    SELECT A.name, A.lat, A.lng, S.image, S.name AS subcategory
    FROM attractions A JOIN subcategory S on A.subcategory = S.name
    WHERE S.adult_only = true and A.location LIKE '%${city}%'
    ORDER BY RAND()
    LIMIT 1
), bar2 AS (
    SELECT a1.name, S.image, S.name AS subcategory
    FROM attractions a1 JOIN subcategory S on a1.subcategory = S.name JOIN bar1 a2
    WHERE S.adult_only = true and a1.location LIKE '%${city}%' AND a1.name != a2.name AND
    SQRT((a1.lat - a2.lat) * (a1.lat - a2.lat) + (a1.lng - a2.lng) * (a1.lng - a2.lng)) * 111.139 < 1
    ORDER BY RAND()
    LIMIT 1
), bar3 AS (
    SELECT a1.name, S.image, S.name AS subcategory
    FROM attractions a1 JOIN subcategory S on a1.subcategory = S.name JOIN bar2 a3 JOIN bar1 a2
    WHERE S.adult_only = true and a1.location LIKE '%${city}%' AND a1.name != a2.name AND a1.name != a3.name AND
    SQRT((a1.lat - a2.lat) * (a1.lat - a2.lat) + (a1.lng - a2.lng) * (a1.lng - a2.lng)) * 111.139 < 1
    ORDER BY RAND()
    LIMIT 1
)
SELECT name, image, subcategory FROM bar1
UNION
SELECT name, image, subcategory FROM bar2
UNION
SELECT name, image, subcategory FROM bar3;
      `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      console.log('no data');
      res.json([]);
    } else {
      console.log('there data');
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

  WITH AccommodationsA AS (SELECT name, picture_url, price, listing_url, review_score, num_reviews, lat, lng
    FROM accommodations
    WHERE ${A_min_nights} >= min_nights AND ${A_min_price} <= price AND ${A_max_price} >= price AND ${A_num_people} <= num_accommodates AND location = '${city}'
    AND review_score IS NOT NULL),
    AccommodationsB AS (SELECT name, picture_url, price, listing_url, review_score, num_reviews, lat, lng
    FROM accommodations
    WHERE ${B_min_nights} >= min_nights AND ${B_min_price} <= price AND ${B_max_price} >= price AND ${B_num_people} <= num_accommodates AND location = '${city}'
    AND review_score IS NOT NULL)
    SELECT A.name, B.name as bname, A.picture_url, A.price, A.listing_url, A.review_score, A.num_reviews, B.picture_url as bpicture_url, B.price as bprice, B.listing_url as blisting_url, B.review_score as breview_score, B.num_reviews as bnum_reviews,
    SQRT((A.lat - B.lat) * (A.lat - B.lat) + (A.lng - B.lng) * (A.lng - B.lng)) * 111.139 AS Distance
    FROM AccommodationsA A JOIN AccommodationsB B ON SQRT((A.lat - B.lat) * (A.lat - B.lat) + (A.lng - B.lng) * (A.lng - B.lng)) * 111.139 < 1
    WHERE A.name <> B.name
    ORDER BY (exp(SQRT((A.lat - B.lat) * (A.lat - B.lat) + (A.lng - B.lng) * (A.lng - B.lng))) * -4 *
    (LOG(((A.num_reviews + B.num_reviews) / 2) + 1) * 0.2) *
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

module.exports = {
  bestAirbnbs,
  restaurants,
  pizza,
  vegetarian,
  nearby_nightlife,
  attractions,
  museums,
  adult_only,
  itinerary,
  friends,
  nearby_rest,
  airbnbs,
  bnb,
  bar_hopping
}
