const redis = require( 'redis' );

const createRedisClient = () => {
    const redisClient = redis.createClient( {
        host: process.env.REDIS_HOST
    } );

    redisClient.on( 'ready', () => console.log( '<redis> new client ready' ) );
    redisClient.on( 'error', ( err ) => console.log( '<redis> error occurred:', err ) );

    return redisClient;
};

module.exports = {
    createRedisClient: createRedisClient
};
