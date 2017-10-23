import React, { Component } from 'react';
import './ChannelBox.css';

class ChannelBox extends Component {

    renderData () {
        return this.props.channelData.map( dataItem =>
            <div key={dataItem.id} className="ChannelBox-data-item">
                {
                    ( typeof dataItem.msg === 'string' || typeof dataItem.msg === 'number' ) ? (
                        dataItem.msg
                    ) : (
                            JSON.stringify( dataItem.msg )
                        )
                }
            </div>
        );
    }

    render () {
        return (
            <div className="ChannelBox">
                <div className="ChannelBox-title">
                    {this.props.channelName}
                </div>
                <div className="ChannelBox-data">
                    {( this.props.channelData && this.props.channelData.length ) ? (
                        this.renderData()
                    ) : (
                            <div>Empty Channel</div>
                        )}
                </div>
            </div>
        );
    }
}

export default ChannelBox;
