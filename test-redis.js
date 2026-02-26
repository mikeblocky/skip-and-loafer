/* global process */
import { Redis } from '@upstash/redis'; import dotenv from 'dotenv'; dotenv.config(); (async () => {
    try {
        console.log('Testing with:');
        console.log('URL:', process.env.VITE_UPSTASH_REDIS_REST_URL);
        // Don't log full token, just first/last chars
        const token = process.env.VITE_UPSTASH_REDIS_REST_TOKEN || '';
        const client = new Redis({
            url: process.env.VITE_UPSTASH_REDIS_REST_URL,
            token: token,
        });
        await client.set('sync:TEST-A123', '{"data":"foo"}');
        const res = await client.get('sync:TEST-A123');
        console.log('RESULT:', res);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
