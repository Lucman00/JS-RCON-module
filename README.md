# Factorio RCON Client

A simple, fast tool to send console commands to your Factorio server using Node.js. It keeps a single connection open and automatically handles raw network data to prevent crashes.
## Example Usage

Create a new file (like `index.js`) in the same folder and use this code:

```javascript
const { createRCONclient } = require('./rcon.js');

// Connect to your Factorio server
const rcon = createRCONclient('127.0.0.1', 27015, 'YourRconPassword');

async function run() {
    try {
        // Send a command and get the response text
        const result = await rcon.sendCommand('/players');
        console.log(result);
    } catch (error) {
        console.error('Something went wrong:', error.message);
    }

setTimeout(run, 1000);
```
