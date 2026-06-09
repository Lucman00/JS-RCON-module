const net = require("net");

//Safety net if no explicit host or port is given
const fallbackhost = "127.0.0.1"
const fallbackport = 27015

//RCON packetTypes
const SERVERDATA_AUTH = 3
const SERVERDATA_EXECCOMMAND = 2
const SERVERDATA_RESPONSE_VALUE = 0

function createRCONclient(host=fallbackhost, port=fallbackport, password){
    if (!password) throw new Error('RCON password is required');
    const socket = net.createConnection({host,port})
    socket.on('connect',() =>{
        const payloadlen = Buffer.byteLength(password, "utf8")
        const packetsize = 4+4+4+payloadlen+1+1
        const buf = Buffer.alloc(packetsize)
        
        buf.writeInt32LE(packetsize -4, 0)
        buf.writeInt32LE(1, 4)
        buf.writeInt32LE(SERVERDATA_AUTH, 8)
        buf.write(password,12,"utf8")
        socket.write(buf)
    
    })

    socket.on('data', (chunk) =>{
        console.log(chunk)
    })
}
createRCONclient('127.0.0.1', 27020, 'psw')