import {Server,Socket} from 'socket.io'
import type {DrawEvent} from "../types/board.js";
const strokes: DrawEvent[] = [];
export function boardHandler(io:Server,socket:Socket){
    console.log("User connected",socket.id);
    socket.emit('init',strokes);
    io.emit("user-count",io.engine.clientsCount);
    socket.on('draw',(data:DrawEvent)=>{
        strokes.push(data); //store in memory
        socket.broadcast.emit('draw',data);//send to everyone except sender
    })
    socket.on('disconnect',()=>{
        console.log('User disconnected',socket.id);
        io.emit('user-count',io.engine.clientsCount);
    })
}