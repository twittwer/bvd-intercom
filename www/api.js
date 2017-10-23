const router = require( 'express' ).Router();

let dataCtrl;

/* --- Router --- */
const getStatsHandler = ( req, res ) => {
    dataCtrl.getStatsPromised( req.params.channel )
        .then( stats => res.status( 200 ).send( stats ) )
        .catch( error => res.status( error.status ).send( error.error ) );
};

const getDataHandler = ( req, res ) => {
    dataCtrl.getDataPromised( req.params.channel )
        .then( data => res.status( 200 ).send( data ) )
        .catch( error => res.status( error.status ).send( error.error ) );
};

/* --- Debug Router --- */
const getKeysHandler = ( req, res ) => {
    dataCtrl.getKeysPromised( req.params.searchKey )
        .then( keyList => res.status( 200 ).send( keyList ) )
        .catch( error => res.status( error.status ).send( error.error ) );
};

const getChannelsHandler = ( req, res ) => {
    dataCtrl.getChannelsPromised( req.params.searchKey )
        .then( channelList => res.status( 200 ).send( channelList ) )
        .catch( error => res.status( error.status ).send( error.error ) );
};

/* --- Endpoint Definition --- */
router.get( '/stats/:channel', getStatsHandler );
router.get( '/data/:channel', getDataHandler );
router.get( '/keys/:searchKey', getKeysHandler ); // just for debugging
router.get( '/channels/:searchKey', getChannelsHandler ); // just for debugging

module.exports = ( redisClient ) => {
    dataCtrl = require( '../shared/data-controller' )( redisClient );
    return router;
};
