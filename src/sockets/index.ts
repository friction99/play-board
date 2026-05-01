import {Server,Socket} from 'socket.io';
import {boardHandler} from "./boardHandler.js";

export function registerSocketHandler(io:Server){
    io.on('connection',(socket:Socket)=>{
        boardHandler(io,socket);
    })
}