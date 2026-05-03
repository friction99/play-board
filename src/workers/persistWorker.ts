import { Worker } from "bullmq";
import { connection } from "../configs/queue.js";
import redis from "../configs/redisClient.js";
import type { DrawEvent } from "../types/board.js";

const BOARD_KEY = 'board:strokes';

new Worker('board', async (job) => {
  if (job.name === 'persist') {
    const { stroke, roomId } = job.data;
    // persist to postgres here if needed
    console.log(`Queued stroke for room ${roomId}`);
  }
}, { connection });
console.log('Persist worker started');