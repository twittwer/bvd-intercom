const router = require( 'express' ).Router();

let dataCtrl;

/* --- Router --- */
const postHandler = ( req, res ) => {
    dataCtrl.saveDataPromised( req.body )
        .then( newData => res.status( 201 ).send( newData ) )
        .catch( error => res.status( error.status ).send( error.error ) );
};

/* --- Debug Router --- */
const deleteHandler = ( req, res ) => {
    dataCtrl.flushDbPromised()
        .then(() => res.status( 204 ).send() )
        .catch( error => res.status( error.status ).send( error.error ) );
};

/* --- Endpoint Definition --- */
router.post( '/', postHandler );
router.delete( '/', deleteHandler ); // just for debugging

/* --- Debug --- */
// const generateDummyData = () => {
//     dataCtrl.saveData( {
//         channel: 'counter',
//         msg: '0'
//     } );
//     dataCtrl.saveData( {
//         channel: 'temperature',
//         msg: '20°C'
//     } );
//     dataCtrl.saveData( {
//         channel: 'humidity',
//         msg: '70%'
//     } );
//     dataCtrl.saveData( {
//         channel: 'wind',
//         msg: '10 km/h'
//     } );
//     dataCtrl.saveData( {
//         channel: 'visibility',
//         msg: '16.1 km'
//     } );
//     dataCtrl.saveData( {
//         channel: 'uv-index',
//         msg: '4/10'
//     } );
//     dataCtrl.saveData( {
//         channel: 'happiness',
//         msg: '7/10'
//     } );
//     dataCtrl.saveData( {
//         channel: 'news',
//         msg: 'unsettling information'
//     } );
// };

module.exports = ( redisClient ) => {
    dataCtrl = require( '../shared/data-controller' )( redisClient );
    // generateDummyData();
    return router;
};
