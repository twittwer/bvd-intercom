const router = require( 'express' ).Router();

const pubSub = require( 'pub-sub' ),
    jlSubServer = require( 'jl-sub-server' );

const subscriptionHandler = jlSubServer.create( {
    subscribe: pubSub.subscribe,
    channelPrefix: 'channel-data:'
} );

/* --- Endpoint Definition --- */
router.post( '/subscribe', subscriptionHandler );

module.exports = () => {
    return router;
};
