import path from 'node:path';
import express from 'express';
import { fileURLToPath } from 'url';
import {httpServer,io,app} from "./src/configs/socketServer.js";
import {registerSocketHandler} from "./src/sockets/index.js";
import { subscribe } from './src/configs/pubsub.js';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { boardQueue } from './src/configs/queue.js';
import './src/workers/persistWorker.js';

const PORT = process.env.port || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullMQAdapter(boardQueue)],
    serverAdapter
});

app.use('/admin/queues',serverAdapter.getRouter());
app.use(express.static(path.join(__dirname,'public')));

// Serve board page for any room URL
app.get('/board/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

registerSocketHandler(io);

subscribe((data)=>{
    console.log("Recieved from Redis,broadcasting to local client");
    io.to(data.roomId).emit('draw', data);
});

httpServer.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`)
})