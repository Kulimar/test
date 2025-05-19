# Gallery

A simple gallery that displays images from the local `images` directory. If the
`/images-list` route is unavailable (for example when the page is opened
directly from a file instead of via the Node server) the gallery falls back to
predefined remote URLs.

## Running locally

Install dependencies and start the server:

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser to view the site.
