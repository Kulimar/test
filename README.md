# Gallery

A simple gallery that displays images from the local `images` directory. The
list of files is read from `images-list.json`. If that file can't be loaded the
gallery falls back to a predefined set of URLs.

## Running locally

You can simply open `index.html` in a browser or start the optional Node
server for convenience:

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser if running the server.

## Likes API

The gallery displays a heart icon on each image. Like counts are retrieved from
`/api/likes` and updated via `/api/like` using `POST` and `DELETE` requests. A
sample serverless function is provided in `functions/likes.js` together with a
JSON file used for persistence during local development. When deploying to a
platform like Netlify, expose the function at `/api/likes` and `/api/like` and
point the front-end to that URL.
