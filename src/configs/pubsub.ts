import {Redis} from 'ioredis'

const CHANNEL = 'board:draw';

export const publisher = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
})

export const subscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
})

export function publish(data:object){
    publisher.publish(CHANNEL,JSON.stringify(data));
}

export function subscribe(callback: (data: any) => void) {
  subscriber.subscribe(CHANNEL);
  subscriber.on('message', (_, message) => {
    callback(JSON.parse(message));
  });
}