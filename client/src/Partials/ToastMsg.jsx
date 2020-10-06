import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {getUserData, loadProfilePic} from '../store/actions/profileActions';
import loading from '../images/loading.jpg';
import './css/ToastMsg.css';

// Toast Msg for new notification
class ToastMsg extends Component{
    constructor(){
        super();

        // Init state
        this.state = {
            firstName: 'Loading...',
            lastName: 'User...', 
            imgURL: null
        }

        this.toNotifs = this.toNotifs.bind(this);
    }

    // Load toast data with axios
    async componentDidMount(){
        const {toastId} = this.props;

        const user = await getUserData(toastId);
        const imgURL = await loadProfilePic(toastId);
        
        this.setState({
            firstName: user.firstName,
            lastName: user.lastName,
            imgURL
        });
    }

    // Send user to notifications once clicked
    toNotifs(e){
        e.preventDefault();

        // Check if already on notifications
        const {pathname} = this.props.location;
        
        if(pathname !== '/notifications'){
            this.props.history.push('/notifications');
        }
        
        // If already on, reload page
        else{
            window.location.reload();
        }
    }

    render(){
        // Destructure
        const {firstName, lastName, imgURL} = this.state;
        const {msg} = this.props;

        return(
            <div onClick = {this.toNotifs} className ='toast-notif row'>
                <img 
                    src = {imgURL? imgURL: loading} 
                    className ='col-5' 
                    alt ='profile pic'
                />
            
                <div className ='col-7 mt-2'>
                    <strong>{firstName} {lastName}</strong>
                    <span> {msg}</span>
                </div>
            </div>
        )
    }
}

export default withRouter(ToastMsg);