import React, { Component } from 'react';
import {withRouter, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {io} from '../App';
import './css/Navbar.css'

// Navbar shown on all pages other than Signup and Login
class Navbar extends Component {
    constructor(){
        super();
        this.signOut = this.signOut.bind(this);
    }
    
    // Function to signout user, making sure they cannot go back and still be logged in
    signOut(e) {
        e.preventDefault();
        io.emit('DISCONNECT', {uid: this.props.uid});
        window.localStorage.clear();
        window.location.href='/';
    }

    // Return navbar using bootstrap4 and React-Router links
    render() {
        // Destructure and determine nav notification colour
        const {newNotif, unseenChats} = this.props;
        
        const notifColor = (newNotif) ? 
            'nav-link text-danger' : 
            'nav-link';

        const msgColor = (unseenChats) ? 
            'nav-link text-danger pr-lg-5' : 
            'nav-link pr-lg-5';

        return(
            <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed">
                <div className="container-fluid">
                    <Link to ='/' className = "navbar-brand">
                        Communicado
                    </Link>
                        
                    <button className = "navbar-toggler" type = "button" data-toggle = "collapse" data-target = "#navbarResponsive">
                        <span className = "navbar-toggler-icon"/>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarResponsive">
                        <ul className="navbar-nav ml-auto">
                            <li>
                                <Link to='/' className = "nav-link pr-lg-5">
                                    Home
                                </Link>
                            </li>
                                
                            <li>
                                <Link to='/chat/home' className = {msgColor}>
                                    Messages
                                </Link>
                            </li>

                            <li>
                                <Link to='/friends' className = "nav-link pr-lg-5">
                                    Friends
                                </Link>
                            </li>

                            <li>
                                <Link to='/notifications' className = {notifColor}>
                                    <span className={`nav-link d-inline-block d-md-none ${notifColor}`}>
                                        Notifications
                                    </span>

                                    <i className ="fas fa-bell"/>
                                </Link>
                            </li>
                            <li>
                                <Link to='/settings' className = "nav-link">
                                    <span className="nav-link d-inline-block d-md-none">
                                        Settings
                                    </span>

                                    <i className = "fas fa-user-cog"/>
                                </Link>
                            </li>

                            <li>
                                <Link to='/' onClick={this.signOut} className = 'nav-link'>
                                    <span className="nav-link d-inline-block d-md-none">
                                        Logout
                                    </span>
                                    
                                    <i className = "fas fa-sign-out-alt"/>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}

const mapStateToProps = (state) =>{
    return{
        uid: state.auth.uid,
        unseenChats: state.messages.unseenChats,
        newNotif: state.notifs.newNotif
    }
}

export default withRouter(connect(mapStateToProps)(Navbar));