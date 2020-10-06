import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {loadProfilePic, changeProfilePic} from '../../store/actions/profileActions';
import moment from 'moment';
import loading from '../../images/loading.jpg';
import './css/ProfileCard.css'

// Component that shows a Users profile card on the home page
class ProfileCard extends Component {
    constructor() {
        super();

        this.state = {
            imgURL: null
        }

        this.changeProfilePic = this.changeProfilePic.bind(this);
    }

    async componentDidMount(){
        const {uid} = this.props;

        const imgURL = await loadProfilePic(uid);

        this.setState({imgURL});
    }

    // Changes the picture of a user with the input file provided using redux function from props
    changeProfilePic(evt) {
        evt.preventDefault();

        const {uid, dispatch} = this.props;
        
        dispatch(changeProfilePic(uid, evt.target.files[0]));
    }

    render() {
        const {firstName, lastName, dateCreated, numFriends} = this.props;
        const {imgURL} = this.state;

        return (
            <div className="ProfileCard col-lg-12 col-xl-4 mb-4 mb-sm-4 mb-md-4 mb-lg-4 mb-xl-0">
                <div className="card text-center d-flex justify-content-center homeCard w-100 h-100">

                    {/* Card Header */}
                    <div className="card-header rounded-0 cardTitle">
                        <h1 className="display-4">My Profile</h1>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                        <div className="row">
                            {/* User Img */}
                            <div className="col-12 my-4">
                                <img 
                                    src={imgURL? imgURL: loading} 
                                    alt="user-profile" 
                                    className="userIMG img-fluid mb-3" 
                                />
                            </div>

                            {/* User Name */}
                            <div className="col-12 mb-4">
                                <h2>{firstName} {lastName}</h2>
                            </div>

                            {/* Number of friends */}
                            <div className="col-12 mb-4">
                                <h4 className="text-muted"> {numFriends} friends</h4>
                            </div>

                            {/* Date Joined */}
                            <div className="col-12 mb-3">
                                <h4 className="text-muted">
                                    Joined {moment(dateCreated).calendar()}
                                </h4>
                            </div> 
                        </div>

                        <br />
                        {/* Button Row */}
                        <div className="row btns d-flex justify-content-center align-items-center">
                            
                            {/* Settings btn */}
                            <div className="col-md-6 col-sm-12 mb-3">
                                <Link to='/settings'>
                                    <button className="btn whiteButton btn-lg w-100 h-100">
                                        <label htmlFor="goToSettings" className="settingsLabel">
                                            Settings
                                        </label>
                                    </button> 
                                </Link>     
                            </div>
                            
                            {/* Profile button */}
                            <div className="col-md-6 col-sm-12 mb-3">
                                <button className="btn whiteButton btn-lg w-100 h-100">
                                    <label htmlFor="upload" className="inputLabel">
                                        Edit Picture
                                    </label>

                                    <input 
                                        className="fileInput"
                                        id='upload'
                                        type='file'
                                        name='upload'
                                        accept='jpg jpeg png'
                                        onChange={this.changeProfilePic}
                                        style={{display: 'none'}}
                                    />        
                                </button>
                            </div>
                        </div>
                    </div>                
                </div>
            </div>
        )
    }
}

export default ProfileCard;