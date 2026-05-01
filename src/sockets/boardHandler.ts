import {Server,Socket} from 'socket.io'
import type {DrawEvent} from "../types/board.js";
import redis from '../configs/redisClient.js';
const strokes: DrawEvent[] = [];
const BOARD_KEY = 'board:strokes';
export async function boardHandler(io:Server,socket:Socket){
    console.log("User connected",socket.id);
    //Load strokes from redis and send to new joiner
    const saved = await redis.get(BOARD_KEY);
    const strokes: DrawEvent[] = saved ? JSON.parse(saved): [];
    socket.emit('init',strokes);
    io.emit("user-count",io.engine.clientsCount);
    socket.on('draw',async (data:DrawEvent)=>{
        strokes.push(data); //store in memory
        await redis.set(BOARD_KEY,JSON.stringify(strokes));
        socket.broadcast.emit('draw',data);//send to everyone except sender
    })
    socket.on('disconnect',()=>{
        console.log('User disconnected',socket.id);
        io.emit('user-count',io.engine.clientsCount);
    })
}