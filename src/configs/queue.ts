import { Queue } from "bullmq";

const connection = {
    host : process.env.REDIS_HOST || 'localhost',
    port : Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
}

export const boardQueue = new Queue('board',{connection});

export {connection};