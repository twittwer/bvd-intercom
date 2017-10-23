import React, { Component } from 'react';
import * as JlSubClient from 'jl-sub-client';
import ChannelBox from './ChannelBox';
import StatusCircle from './StatusCircle';
import './ChannelCluster.css';

class ChannelCluster extends Component {

    constructor( props ) {
        super( props );

        this.state = {
            online: false,
            availableChannels: [],
            subscribedChannels: [],
            channelData: {}
        };

        this.jlSubServer = null;

        /* --- Configuration --- */
        this.log = true;
        this.logData = true;
        this.autoReconnect = false;
        this.maxResponseBufferSizeInMB = 0.005; // 0.005 is a good limit to observe the reconnect handling
        /* --------------------- */
    }

    componentDidMount () {
        this.fetchChannelNames();
    }

    /* --------------------- */
    /* --- Data Handling --- */
    /* --------------------- */

    initChannelData ( channels, cb ) {
        this.logData && console.log( '<frontend> init data for channels:', channels );
        const channelData = {};
        channels.forEach( channel => channelData[ channel ] = [] );
        this.setState( { channelData }, () => cb && cb() );
    }

    addChannelData ( channel, data, cb ) {
        this.logData && console.log( `<frontend> add data to channel ${channel}:`, data );

        if ( !Array.isArray( this.state.channelData[ channel ] ) || typeof data !== 'object' ) {
            return;
        }
        this.setState( prevState => {
            const channelData = { ...prevState.channelData };
            channelData[ channel ].push( data );
            return { channelData };
        }, () => cb && cb() );
    }

    /* ----------------------------- */
    /* --- Subscription Handling --- */
    /* ----------------------------- */

    appendChannelSubscription ( channel, cb ) {
        if ( this.state.subscribedChannels.indexOf( channel ) > -1 ) {
            return;
        }
        this.setState( prevState => {
            const subscribedChannels = prevState.subscribedChannels;
            subscribedChannels.push( channel );
            return { subscribedChannels };
        }, () => {
            this.connect( cb );
        } );
    }

    removeChannelSubscription ( channel, cb ) {
        const channelIndex = this.state.subscribedChannels.indexOf( channel );
        if ( channelIndex < 0 ) {
            return;
        }
        this.setState( prevState => {
            const subscribedChannels = prevState.subscribedChannels;
            subscribedChannels.splice( channelIndex, 1 );
            return { subscribedChannels };
        }, () => {
            this.connect( cb );
        } );
    }

    /* --------------------------- */
    /* --- Connection Handling --- */
    /* --------------------------- */

    fetchChannelNames () {
        fetch( '/api/channels/*' )
            .then( res => res.json() )
            .then( res => this.setState( { availableChannels: res } ) )
            .catch( error => this.log && console.warn( '<frontend> error while fetching from rest api:', error ) );

    }

    connect ( cb ) {
        this.switchConnectionMode( false );
        if ( this.jlSubServer ) {
            this.jlSubServer.disconnect();
            this.jlSubServer = null;
        }

        const channels = this.state.subscribedChannels;
        this.initChannelData( channels, () => {
            this.log && console.log( '<frontend> subscribing for:', channels );

            const requestConfig = {
                path: '/stream/subscribe',
                channels: channels
            };
            const moduleConfig = {
                reconnectTrigger: {
                    responseBufferSizeInMB: this.maxResponseBufferSizeInMB
                }
            };

            JlSubClient.connect( requestConfig, moduleConfig )
                .then( server => {
                    this.log && console.log( '<frontend> stream establishment succeeded' );

                    this.jlSubServer = server;

                    server.on( 'reconnect', () => console.log( '<stream> reconnect' ) );
                    server.on( 'reconnected', () => console.log( '<stream> reconnected' ) );
                    server.on( 'heartbeat', () => console.log( '<stream> heartbeat' ) );

                    server.on( 'data', ( channel, data ) => this.addChannelData( channel, data ) );
                    server.on( 'disconnect', ( error ) => this.handleDisconnect( error ) );

                    if ( !this.state.online ) {
                        this.switchConnectionMode( true );
                    }
                } )
                .catch( error => this.log && console.log( '<frontend> stream establishment failed:', error ) );

            cb && cb();
        } );
    }

    handleDisconnect ( error ) {
        if ( error ) {
            console.log( '<frontend> stream aborted:', error );
        } else {
            console.log( '<frontend> stream ended' );
        }
        this.switchConnectionMode( false );
        if ( this.autoReconnect ) {
            this.log && console.log( '<frontend> reconnect stream...' );
            this.connect();
        }
    }

    disconnect () {
        this.jlSubServer.disconnect();
        this.switchConnectionMode( false );
    }

    /* -------------- */
    /* --- Helper --- */
    /* -------------- */

    switchConnectionMode ( online ) {
        if ( typeof online !== 'boolean' || this.state.online === online ) {
            return;
        }
        this.setState( { online }, () => this.log && console.log( '<frontend> switched to ' + ( online ? 'online' : 'offline' ) + ' mode' ) );
    }

    toggleChannel ( channel ) {
        if ( this.state.subscribedChannels.indexOf( channel ) > -1 ) {
            this.removeChannelSubscription( channel );
        } else {
            this.appendChannelSubscription( channel );
        }
    }

    /* ----------------- */
    /* --- Rendering --- */
    /* ----------------- */

    renderChannelList () {
        return this.state.availableChannels.map( ( channel ) =>
            ( <span
                onClick={() => this.toggleChannel( channel )}
                className={( this.state.subscribedChannels.indexOf( channel ) > -1 ? 'selected' : '' )}
            >{channel}</span > )
        );
    }

    renderChannelBoxes () {
        return this.state.subscribedChannels.map( channel =>
            <ChannelBox key={channel} channelName={channel} channelData={this.state.channelData[ channel ]} />
        );
    }

    render () {
        return (
            <div className="ChannelCluster">
                <div className="ChannelCluster-title">
                    {this.state.subscribedChannels.length} Channel{( this.state.subscribedChannels.length !== 1 ) && 's'}
                    <StatusCircle status={this.state.online ? 'ok' : 'error'} />
                </div>
                <div className="ChannelCluster-actions">
                    <button onClick={() => this.fetchChannelNames()}>Refetch Channels</button>
                    <button onClick={() => this.connect()}>Reconnect Stream</button>
                    <button onClick={() => this.disconnect()}>Disconnect Stream</button>
                </div>
                <div className={"ChannelCluster-list " + ( this.state.online ? 'online' : 'offline' )}>
                    {this.state.availableChannels.length ? (
                        this.renderChannelList()
                    ) : (
                            <span>No Channels Found</span>
                        )}
                </div>
                <div className="ChannelCluster-boxes">
                    {this.state.subscribedChannels.length ? (
                        this.renderChannelBoxes()
                    ) : (
                            <div>No Subscribed Channels</div>
                        )}
                </div>
            </div>
        );
    }
}

export default ChannelCluster;
