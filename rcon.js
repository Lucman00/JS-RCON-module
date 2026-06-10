const net = require('net');

const fallbackhost = '127.0.0.1'
const fallbackport = 27015

//RCON packetTypes
const SERVERDATA_AUTH = 3
const SERVERDATA_EXECCOMMAND = 2
const SERVERDATA_RESPONSE_VALUE = 0

function createRCONclient(host=fallbackhost, port=fallbackport, password){
    if (!password) throw new Error('RCON password is required');
    
    const socket = net.createConnection({host,port})
    const pendingRequests = new Map();
    let streamBuffer = Buffer.alloc(0);

    let requestId = 1;


    socket.on('connect',() =>{
        
        const payloadlen = Buffer.byteLength(password, 'utf8')
        const packetsize = 14+payloadlen //consists of: packetlength(4) + requestID (4) + type(4) + payloadlen + null bytes(2)
        const buf = Buffer.alloc(packetsize)
        
        buf.writeInt32LE(packetsize-4, 0)       //length of the packet
        buf.writeInt32LE(requestId, 4)                  //request ID
        buf.writeInt32LE(SERVERDATA_AUTH, 8)    //Type
        buf.write(password,12,'utf8')           //Payload
        
        pendingRequests.set(requestId,'Auth')
        socket.write(buf)
        
        requestId++;
    })
    socket.on('data', (chunk) =>{
        streamBuffer = Buffer.concat([streamBuffer,chunk])
        while (streamBuffer.length >=4){
            
            let len = streamBuffer.readInt32LE(0)
            
            if (streamBuffer.length >=len+4){
                
                let packet = streamBuffer.subarray(0,len+4);
                let packetID = packet.readInt32LE(4)
                let packetType = packet.readInt32LE(8)
                
                streamBuffer = streamBuffer.subarray(len+4)
                
                if (packetID == -1){
                    socket.destroy()

                    for (let [id, request] of pendingRequests.entries()) {
                        if (request && typeof request === 'object' && request.reject) {
                            request.reject(new Error('RCON Authentication Failed'));
                        }
                    }
                    pendingRequests.clear();
                }

                else if (pendingRequests.get(packetID)=='Auth'){
                    pendingRequests.delete(packetID);
                }

                else if(pendingRequests.has(packetID)){
                    
                    let payload = packet.subarray(12, len+2).toString('utf8')
                    let request = pendingRequests.get(packetID)
                    
                    request.resolve(payload);
                    pendingRequests.delete(packetID)
                }
            } else { break; }
        }})
    function sendCommand(command){
        return new Promise((resolve,reject)=>{
            
            pendingRequests.set(requestId, {resolve,reject})
            
            const payloadlen = Buffer.byteLength(command, 'utf8')
            const packetsize = 14+payloadlen
            const buf = Buffer.alloc(packetsize)
            
            buf.writeInt32LE(packetsize-4, 0)       
            buf.writeInt32LE(requestId, 4)                  
            buf.writeInt32LE(SERVERDATA_EXECCOMMAND, 8)
            buf.write(command,12,'utf8')

            requestId++;

            socket.write(buf)
        })
    }

        return{
            sendCommand
        };
} module.exports = { createRCONclient };