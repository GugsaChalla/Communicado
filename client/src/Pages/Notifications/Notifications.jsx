import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {uncolorNotif, removeNotification} from '../../store/actions/notificationsActions';
import './css/Notifications.css'
import NotificationCard from './NotificationCard';

class Notifications extends Component{
    constructor(){
        super();
        this.deleteNotif = this.deleteNotif.bind(this);
    }

    componentDidMount(){
        this.props.dispatch(uncolorNotif(this.props.uid));
    }

    componentDidUpdate(prevProps){
        const {newNotif} = this.props;

        if(prevProps.newNotif !== newNotif && newNotif!==false){   
            window.location.reload();
        }
    }

    // Delete a notification using actions from store
    deleteNotif(id){
        const { notifs, dispatch } = this.props;
        dispatch(removeNotification(id, notifs));
    }

    render(){
        // read notifications for current user
        const {uid, notifs} = this.props;

        if(!uid){
            return <Redirect to ='/'/>
        }

        // Create list of notifications
        const list = notifs.map(notif =>
            <NotificationCard 
                key={notif._id} 
                notif = {notif} 
                uid={uid} 
                deleteNotif={this.deleteNotif}
            />
        );

        return(
            <div className="notifs">
                <header>
                    <h1>Notifications</h1>
                </header>

                <h4>Latest</h4>

                {list.length === 0 ? 
                    (<h3 className='text-center my-4'> 
                        You have no notifications 
                    </h3>): 
                    list 
                }
            </div>
        )
    }
}

// Props from redux store. UserID and notifications
const mapStateToProps = (state) =>{
    return{
        uid: state.auth.uid,
        notifs: state.notifs.notifs,
        newNotif: state.notifs.newNotif
    }
}

// Methods for notifications to use after mounting
const mapDispatchToProps = (dispatch) => ({dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);