# CIS-550-Final-Project
We are designing an application that will personalize an itinerary of accommodations, restaurants, and attractions in one or more out of 8 major European cities based on user input. 

Project demonstration: https://drive.google.com/file/d/1yS39PMr43nkOOekBbx6fqYDrjL8OnYyK/view?usp=sharing

Project writeup: https://docs.google.com/document/d/1H_8c2lso7QxjHyaLE9-ow2t_DitUdpKa7nBoHwOnqWQ/edit?usp=sharing

**Note: no longer AWS connection and Google Maps API Key. Please look at video above to see website demonstration**

Former instructions to run the app locally:
1) Ensure that you create an index.html file under the following path "client/public/index.html". Copy and paste the following code into that file:

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link href='https://fonts.googleapis.com/css?family=Alegreya' rel='stylesheet'>
    
    <!--MAP KEY-->
    <script src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAj4FozlLKpqlIS9KY3UhIuw6LjJgNy7Jc"></script>

    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only data inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>Route Wizard</title>

  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>

Note: We used gitignore for the index.html file so that our map API key would not get posted publically on github.

2) Create a split terminal and in one, cd into "client" and in the other, cd into "server"
3) Type the command "npm start" into both terminals and a website should pop up! Note: if you get npm errors, try running "npm install" before running "npm start".
