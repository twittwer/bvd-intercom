const { promisify } = require( 'util' );

const pubSub = require( 'pub-sub' );

let redis;

/* --- Controller --- */
const saveData = ( data, cb ) => {
    console.log( '<data-ctrl> save new data:', data );

    if ( !data || !data.channel || !data.msg ) {
        cb && cb( {
            status: 400,
            error: 'Invalid Payload: Properties missing (channel, msg)'
        } );
        return;
    }
    data.channel = data.channel.replace( ':', '-' );

    redis.keys( data.channel + ':*', ( err, channelKeys ) => {
        if ( err ) {
            cb && cb( { status: 500, error: err } );
            return;
        }
        data.id = data.channel + ':' + channelKeys.length;
        redis.set( data.id, JSON.stringify( data.msg ), ( err, reply ) => {
            if ( err || reply !== 'OK' ) {
                cb && cb( { status: 500, error: err } );
                return;
            }
        } );
        cb && cb( null, data );

        pubSub.publish( `channel-data:${data.channel}`, data );
        pubSub.publish( `channel-latest`, data );
    } );
};

const getStats = ( channel, cb ) => {
    channel = channel || '*';
    channel = channel.replace( ':', '-' );
    console.log( `<data-ctrl> get stats of "${channel}" channel` );

    redis.keys( channel + ':*', ( err, channelKeys ) => {
        if ( err ) {
            cb && cb( { status: 500, error: err } );
            return;
        }
        if ( !channelKeys.length ) {
            cb && cb( { status: 404 } );
            return;
        }
        const latestId = channelKeys[ 0 ].substring( 0, channelKeys[ 0 ].indexOf( ':' ) + 1 ) + ( channelKeys.length - 1 );
        redis.get( latestId, ( err, value ) => {
            if ( err ) {
                cb && cb( { status: 500, error: err } );
                return;
            }
            cb && cb( value ? null : { status: 404 }, {
                id: latestId,
                channel: latestId.substring( 0, latestId.indexOf( ':' ) ),
                msg: value
            } );
        } );
    } );
};

const getData = ( channel, cb ) => {
    if ( !channel || channel === '' ) {
        cb && cb( {
            status: 400,
            error: 'Invalid Request: Missing/Empty channel name'
        } );
        return;
    }
    channel = channel.replace( ':', '-' );
    console.log( `<data-ctrl> get data of "${channel}" channel` );

    redis.keys( channel + ':*', ( err, channelKeys ) => {
        if ( err ) {
            cb && cb( { status: 500, error: err } );
            return;
        }
        if ( !channelKeys.length ) {
            cb && cb( null, [] );
            return;
        }
        redis.mget( channelKeys, ( err, channelValues ) => {
            if ( err ) {
                cb && cb( { status: 500, error: err } );
                return;
            }
            const channelData = channelKeys.map( ( key, index ) => {
                return {
                    id: channelKeys[ index ],
                    channel: channelKeys[ index ].substring( 0, channelKeys[ index ].indexOf( ':' ) ),
                    msg: channelValues[ index ]
                };
            } );
            cb && cb( null, channelData );
        } );
    } );
};

/* --- Debug Controller --- */
const getKeys = ( searchKey, cb ) => {
    searchKey = searchKey || '*';
    console.log( '<data-ctrl> get keys based on "' + searchKey + '"' );

    redis.keys( searchKey, ( err, keyList ) => {
        if ( err ) {
            cb && cb( { status: 500, error: err } );
            return;
        }
        cb && cb( null, keyList );
    } );
};

const getChannels = ( searchKey, cb ) => {
    searchKey = searchKey || '*';
    console.log( `<data-ctrl> get channel names based on "${searchKey}"` );

    redis.keys( searchKey + ':*', ( err, keyList ) => {
        if ( err ) {
            cb && cb( { status: 500, error: err } );
            return;
        }
        const channelSet = new Set();
        keyList.map( key => channelSet.add( key.substring( 0, key.indexOf( ':' ) ) ) );
        cb && cb( null, [ ...channelSet ] );
    } );
};

const flushDb = ( cb ) => {
    console.log( '<data-ctrl> flush redis db' );

    redis.flushdb( ( err, reply ) => {
        if ( err || reply !== 'OK' ) {
            cb && cb( { status: 500, error: err } );
            return;
        }
        cb && cb();
    } );
};

module.exports = ( redisClient ) => {
    redis = redisClient;
    return {
        saveData,
        saveDataPromised: promisify( saveData ),
        getStats,
        getStatsPromised: promisify( getStats ),
        getData,
        getDataPromised: promisify( getData ),
        getKeys,
        getKeysPromised: promisify( getKeys ),
        getChannels,
        getChannelsPromised: promisify( getChannels ),
        flushDb,
        flushDbPromised: promisify( flushDb )
    };
};
