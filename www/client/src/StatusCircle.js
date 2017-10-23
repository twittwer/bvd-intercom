import React, { Component } from 'react';
import './StatusCircle.css';

class StatusCircle extends Component {

    render () {
        let status;
        switch ( this.props.status ) {
            case '0':
            case 'error':
                status = 'error';
                break;
            case '2':
            case 'ok':
                status = 'ok';
                break;
            default:
                status = 'warn';
        }

        return (
            <div className={"StatusCircle " + status}></div>
        );
    }
}

export default StatusCircle;
