import React, { Component } from 'react';
import {loadProfilePic} from '../../store/actions/profileActions';
import {getFriendStatus} from '../../store/actions/friendsActions';
import loading from '../../images/loading.jpg';
import {io} from '../../App';
import './SearchProfileCard.css';

class SearchProfileCard extends Component {
    constructor(){
        super();

        this.state ={
            imgURL: null,
            status: 'Add Friend'
        };

        this.handleClick = this.handleClick.bind(this);
    }

    async componentDidMount(){
        const {_id} = this.props.user;
        const {uid} = this.props;

        const imgURL = await loadProfilePic(_id);
        const status = await getFriendStatus(_id, uid);

        this.setState({
            status,
            imgURL
        });
    }

    handleClick(){
        // Destructure
        const {status} = this.state;
        const {_id, firstName, lastName} = this.props.user;
        const {uid} = this.props;

        // Add Friend button
        if(status === 'Add Friend'){
            io.emit("CHANGE_FRIEND_STATUS", {
                status, 
                uid, 
                friendId: _id
            });
            
            this.setState({status: 'Pending'});
        }

        // Pending Button
        else if(status === 'Pending'){
            io.emit("CHANGE_FRIEND_STATUS", {
                status, 
                uid, 
                friendId: _id
            });
            
            this.setState({status: 'Add Friend'});
        }

        // Already friends. If clicked, will delete friend from friend list if user confirms
        else {
            if(!window.confirm(`Are you sure you want to unfriend ${firstName} ${lastName}?`)){
                return;
            }

            io.emit("CHANGE_FRIEND_STATUS", {
                status, 
                uid, 
                friendId: _id
            });
            
            this.setState({status: 'Add Friend'});
        }
    }

    render() {
        const {imgURL, status} = this.state;
        const {firstName, lastName, _id} = this.props.user;
        const {uid} = this.props;

        return(
            <div>
                <div className = "searchProfileCard">
                    <div className="row sideBar-body">
                    
                        <div className="col-sm-3 sideBar-avatar">
                            <div>
                                <img 
                                    src={imgURL? imgURL:loading} 
                                    className="avatar-icon"
                                    alt = 'Profile Pic'
                                />
                            </div>
                        </div>

                        <div className = "col-sm-9 sideBar-main">
                                <div className="col-sm-8 sideBar-name">
                                    <span className="name-meta">
                                        {firstName} {lastName}
                                    </span>
                                </div>
                                
                                <div class="col-sm-3 float-right sideBar-time">
                                    {uid !== _id ?
                                        (<div onClick = {this.handleClick}>
                                            {status === 'Add Friend'? 
                                                <i className="fas fa-user-plus mb-2"/>: status === 'Pending'? 
                                                <i className ='fas fa-user-clock mb-2'/> :
                                                <i className ='fa fa-check mb-2'/>}
                                        </div>): 
                                        null
                                    }     
                                </div>  
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchProfileCard