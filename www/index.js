/*############*/
/* WWW (4000) */
/*############*/

const express = require( 'express' ),
    bodyParser = require( 'body-parser' );

const app = express();

const redis = require( '../shared/redis' ),
    pubSubTransporterRedis = require( 'pub-sub-transporter-redis' ),
    pubSub = require( 'pub-sub' );

const apiRouter = require( './api' )( redis.createRedisClient() ),
    streamRouter = require( './jl-stream' )();

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
    console.log( `<webserver> node ${process.env.HOSTNAME} is alive` );
    res.status( 200 ).json( {
        service: 'www',
        node: process.env.HOSTNAME,
        status: 'OK'
    } );
} );
app.use( '/api', apiRouter );
app.use( '/stream', streamRouter );
app.use( '/', express.static( __dirname + '/client/build' ) );

app.use(( err, req, res, next ) => {
    console.error( err.name );
    console.trace( err.stack );
    switch ( err.name ) {
        case 'SyntaxError':
            res.status( 400 ).send( err.name );
            break;
        default:
            res.status( 500 ).send( err.name || 'Unexpected Server Error' );
            break;
    }
} );

/* --- Application Start --- */
const port = process.env.PORT || 4000;
app.listen( port, function () {
    console.log( `<webserver> service is running (port: ${port}, id: ${process.env.HOSTNAME})` );
} );

