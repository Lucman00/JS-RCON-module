# Javascript RCON module
Made this when i got told there wasn't any official module updated in the last 4 years and didn't find none. 
Tested right now only with Factorio for this is the usecase for myself right now.

And if it exists then it's Coding practise (:

## Example Usage
example used is a Factorio Server using RCON.

Create a new file in the same folder and use this code:

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
