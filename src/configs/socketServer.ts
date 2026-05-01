import { Server } from 'socket.io';
import express from "express";
import http from "http"

export const app = express();

export const httpServer = http.createServer(app);

export const io = new Server(httpServer,{
    cors: {origin:'*'}
})

