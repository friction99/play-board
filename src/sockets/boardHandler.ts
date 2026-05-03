import {Server,Socket} from 'socket.io'
import type {DrawEvent} from "../types/board.js";
import redis from '../configs/redisClient.js';
import {publish} from '../configs/pubsub.js';
import { boardQueue } from '../configs/queue.js';

export async function boardHandler(io:Server,socket:Socket){
    // Client sends roomId when connecting 
    socket.on('join-room',async(roomId:string)=>{
        console.log("User connected",roomId);
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`)
        //load strokes for this room only 
        const saved = await redis.get(`board:${roomId}:strokes`);
        const strokes: DrawEvent[] = saved ? JSON.parse(saved) : [];
        socket.emit('init',strokes);
        //update roomSize
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        io.to(roomId).emit('user-count',roomSize);
    })  
    socket.on('draw', async (data: DrawEvent) => {
        const { roomId } = data;

        // Write to Redis immediately so new joiners get latest strokes
        const saved = await redis.get(`board:${roomId}:strokes`);
        const strokes: DrawEvent[] = saved ? JSON.parse(saved) : [];
        strokes.push(data);
        await redis.set(`board:${roomId}:strokes`, JSON.stringify(strokes));

        // Queue for any additional persistence (postgres etc)
        await boardQueue.add('persist', { stroke: data, roomId });

        publish({ ...data, roomId });
    });

    socket.on('undo', async ({ roomId }) => {
        console.log('undo event recieved',roomId);
        const saved = await redis.get(`board:${roomId}:strokes`);
        const strokes: DrawEvent[] = saved ? JSON.parse(saved) : [];
        strokes.pop(); // remove last stroke
        await redis.set(`board:${roomId}:strokes`, JSON.stringify(strokes));
        io.to(roomId).emit('undo', strokes); // send updated strokes to room
    });

    socket.on('clear', async ({ roomId }) => {
        console.log('clear event recieved',roomId);
        await redis.del(`board:${roomId}:strokes`);
        io.to(roomId).emit('clear');
    });

    socket.on('disconnect',()=>{
        console.log('User disconnected',socket.id);
        io.emit('user-count',io.engine.clientsCount);
    })
}