import path from 'node:path';
import express from 'express';
import { fileURLToPath } from 'url';
import {httpServer,io,app} from "./src/configs/socketServer.js";
import {registerSocketHandler} from "./src/sockets/index.js";

const PORT = process.env.port || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname,'public')));

registerSocketHandler(io);

httpServer.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`)
})