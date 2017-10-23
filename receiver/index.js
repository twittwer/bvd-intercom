/*#################*/
/* RECEIVER (4001) */
/*#################*/

const express = require( 'express' ),
    bodyParser = require( 'body-parser' );

const app = express();

const redis = require( '../shared/redis' ),
    pubSubTransporterRedis = require( 'pub-sub-transporter-redis' ),
    pubSub = require( 'pub-sub' );

const apiRouter = require( './api' )( redis.createRedisClient() );

/* --- Application Config --- */
app.use( bodyParser.json() );

const redisPubSubTransporter = pubSubTransporterRedis.initialize( {
    clientFactory: redis.createRedisClient
} );

pubSub.initialize( {
    transporter: redisPubSubTransporter,
    channelPrefix: 'pubSub:'
} );

/* --- Routing --- */
app.get( '/alive', ( req, res ) => {
    console.log( `<receiver> node ${process.env.HOSTNAME} is alive` );
    res.status( 200 ).json( {
        service: 'receiver',
        node: process.env.HOSTNAME,
        status: 'OK'
    } );
} );
app.use( '/api', apiRouter );

/* --- Application Start --- */
const port = process.env.PORT || 4001;
app.listen( port, function () {
    console.log( `<receiver> service is running (port: ${port}, id: ${process.env.HOSTNAME})` );
} );
