import React, {Component} from 'react';
import {loadProfilePic} from '../../store/actions/profileActions';
import loading from '../../images/loading.jpg';
import './css/UserComposedTo.css';

class UserComposedTo extends Component{
    constructor(){
        super();
        this.state = {
            imgURL: null
        }
    }

    async componentDidMount(){
        const {_id} = this.props.user;

        const imgURL =await loadProfilePic(_id);

        this.setState({imgURL});
    }

    render(){
        const {firstName, lastName} = this.props.user;
        const {addRecipient, user} = this.props;
        const {imgURL} = this.state;

        return(
            <div className='user-composed-to' onClick={() => {addRecipient(user)}}>
                <img src={imgURL? imgURL: loading} alt ='profile pic'/>
                
                <p>
                    {firstName} {lastName}
                </p>
            </div>
        )
    }
}

export default UserComposedTo;