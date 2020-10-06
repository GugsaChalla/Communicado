import React, { Component } from 'react';
import OnlineFriend from './OnlineFriend';

class OnlineFriendList extends Component {
    render() {
        const {uid, active, dispatch} = this.props;

        const onlineFriends = active.map(user =>
            <OnlineFriend 
                key={user._id} 
                uid = {uid}
                user={user}
                dispatch = {dispatch}
            />
        );

        return (
            <div className="OnlineFriendList col-lg-12 col-xl-3 mb-4 mb-sm-4 mb-md-4 mb-lg-4 mb-xl-0">
                <div className="card text-center d-flex justify-content-center homeCard w-100 h-100">
                    
                    {/* Card Header */}
                    <div className="card-header rounded-0 cardTitle">
                        <h1 className="display-4">
                            Online Friends
                        </h1>
                    </div>

                    {/* Card Body - List of online friends from props */}
                    <div className="card-body p-0">
                        {onlineFriends}
                    </div>
                </div>
            </div>
        )
    }
}

export default OnlineFriendList; 