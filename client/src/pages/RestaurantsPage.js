import { useEffect, useState } from 'react';
import { Button, Checkbox, Container, FormControlLabel, Grid, Link, Slider, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

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
    { field: 'title', headerName: 'Title', width: 300, renderCell: (params) => (
        <Link onClick={() => setSelectedSongId(params.row.song_id)}>{params.value}</Link>
    ) },
    { field: 'duration', headerName: 'Duration' },
    { field: 'plays', headerName: 'Plays' },
    { field: 'danceability', headerName: 'Danceability' },
    { field: 'energy', headerName: 'Energy' },
    { field: 'valence', headerName: 'Valence' },
    { field: 'tempo', headerName: 'Tempo' },
    { field: 'key_mode', headerName: 'Key' },
    { field: 'explicit', headerName: 'Explicit' },
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
      {selectedSongId && <SongCard songId={selectedSongId} handleClose={() => setSelectedSongId(null)} />}
      <h2>Search for a restaurant:</h2>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          <TextField label='Enter Restaurant Name' value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }}/>
        </Grid>
        <Grid item xs={4}>
          <FormControlLabel
            label='Explicit'
            control={<Checkbox checked={explicit} onChange={(e) => setExplicit(e.target.checked)} />}
          />
        </Grid>
        <Grid item xs={6}>
          <p>Duration</p>
          <Slider
            value={duration}
            min={60}
            max={660}
            step={10}
            onChange={(e, newValue) => setDuration(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{formatDuration(value)}</div>}
          />
        </Grid>
        <Grid item xs={6}>
          <p>Plays (millions)</p>
          <Slider
            value={plays}
            min={0}
            max={1100000000}
            step={10000000}
            onChange={(e, newValue) => setPlays(newValue)}
            valueLabelDisplay='auto'
            valueLabelFormat={value => <div>{value / 1000000}</div>}
          />
        </Grid>
        {/* TODO (TASK 24): add sliders for danceability, energy, and valence (they should be all in the same row of the Grid) */}
        {/* Hint: consider what value xs should be to make them fit on the same row. Set max, min, and a reasonable step. Is valueLabelFormat is necessary? */}
      </Grid>
      <Button onClick={() => search() } style={{ left: '50%', transform: 'translateX(-50%)' }}>
        Search
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

  const searchButton = document.getElementById("searchButton");
const searchedNews = document.getElementById("searchedNews");
const categoryOfNews = document.getElementById("categoryOfNews");
const detailsForNews = document.getElementById("detailsForNews");
var newsDataArr = [];


searchButton.addEventListener("click", function() {
    categoryOfNews.innerHTML="<h4>Search : "+searchedNews.value+"</h4>";
    getSearchResults();
});

const getSearchResults = async () => {

    if(searchedNews.value == null) {
        console.log("Nothing searched for");
        return;
    }

    $(document).ready(function() {
        $.get('/getSearchedNews?searchedNews='+searchedNews.value, function (data) {
            newsDataArr = [];
            newsDataArr = JSON.parse(JSON.stringify(data.results));
            showSearchedNews();
        });
    });
}

// window.onload = function() {
//     console.log("made it to ejs file");
//     categoryOfNews.innerHTML="<h4>All News</h4>";
//     getFrontPage();
// };

$(document).ready(function() {
    $.get('/getAllNews', function (data) {
        categoryOfNews.innerHTML="<h4>All News</h4>";
        newsDataArr = JSON.parse(JSON.stringify(data.data));
        showNews();
    });
});

function showNews() {
    detailsForNews.innerHTML = "";

    if (newsDataArr.length == 0) {
        detailsForNews.innerHTML = "<h5>No news articles have been found</h5>"
        return;
    }
    console.log("Below is all the data");
    console.log(newsDataArr);
    console.log(newsDataArr.length);
    newsDataArr.forEach(articles => {
        console.log("We are in for each loop");
        console.log(articles);
        console.log(articles.authors.S);
        var column = document.createElement('div');
        column.className="col-sm-12 col-md-4 col-lg-3 p-2 card";

        var article = document.createElement('div');
        article.className="p-2";

        var img = document.createElement('img');
        img.setAttribute("height", "matchparent");
        img.setAttribute("width", "100%");
        img.src; //INSERT IMG FOR EACH ARTICLE HERE

        var articleBody = document.createElement('div');
        
        var articleHeading = document.createElement('h5');
        articleHeading.className="articleHeading";
        articleHeading.innerHTML=articles.headline.S;

        var date = document.createElement('h6');
        date.className="text-dark";
        date.innerHTML=articles.date.S;

        var description = document.createElement('p');
        description.className="text-secondary";
        description.innerHTML=articles.short_description.S;

        var url = document.createElement('a');
        url.className="btn btn-dark";
        url.setAttribute("target", "_blank");
        url.href=articles.link.S;
        url.innerHTML="Continue Reading";


        articleBody.appendChild(articleHeading);
        articleBody.appendChild(date);
        articleBody.appendChild(description);
        articleBody.appendChild(url);

        article.appendChild(img);
        article.appendChild(articleBody);

        column.appendChild(article);

        detailsForNews.appendChild(column);
    });

    
}


function showSearchedNews() {
    detailsForNews.innerHTML = "";

    if (newsDataArr.length == 0) {
        detailsForNews.innerHTML = "<h5>No news articles have been found</h5>"
        return;
    }
    console.log("Below is all the data");
    console.log(newsDataArr);
    console.log(newsDataArr.length);
    newsDataArr.forEach(articles => {
        console.log("We are in for each loop");
        console.log(articles);
        console.log(articles.authors);
        var column = document.createElement('div');
        column.className="col-sm-12 col-md-4 col-lg-3 p-2 card";

        var article = document.createElement('div');
        article.className="p-2";

        var img = document.createElement('img');
        img.setAttribute("height", "matchparent");
        img.setAttribute("width", "100%");
        img.src; //INSERT IMG FOR EACH ARTICLE HERE

        var articleBody = document.createElement('div');
        
        var articleHeading = document.createElement('h5');
        articleHeading.className="articleHeading";
        articleHeading.innerHTML=articles.headline;

        var date = document.createElement('h6');
        date.className="text-dark";
        date.innerHTML=articles.date;

        var description = document.createElement('p');
        description.className="text-secondary";
        description.innerHTML=articles.short_description;

        var url = document.createElement('a');
        url.className="btn btn-dark";
        url.setAttribute("target", "_blank");
        url.href=articles.link;
        url.innerHTML="Continue Reading";


        articleBody.appendChild(articleHeading);
        articleBody.appendChild(date);
        articleBody.appendChild(description);
        articleBody.appendChild(url);

        article.appendChild(img);
        article.appendChild(articleBody);

        column.appendChild(article);

        detailsForNews.appendChild(column);
    });

    
}
}