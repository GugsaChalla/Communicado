import React, { Component } from 'react'
import {withRouter, Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {signUp} from '../../store/actions/authActions';
import './Signup.css'


class Signup extends Component {
    constructor(props) {
        super(props);
        // Set initial state and bind all helper functions
        this.state = { firstName: "", lastName: "", email: "", password: "", confirmPassword: ""};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.toLogin = this.toLogin.bind(this);
    }
    
    // Change the state name to the value that the user is typing
    handleChange(evt) {
        this.setState({ [evt.target.name] : evt.target.value });
    }
    // Send user to login if link clicked
    toLogin() {
        this.props.history.push('/');
    }
    // Submit form and send to signUp mapped from client redux store
    handleSubmit(evt) {
        evt.preventDefault();
        this.props.signUp(this.state);
    }

    render() {
        // If UID, send user to home page
        if(this.props.uid){
            return <Redirect exact to='/'/>
        }
        return(
            <div className="Signup">
                <form className="Signup-form" onSubmit={this.handleSubmit}>
                    <h1 className="Signup-title">Communicado</h1>
                    <h3>Create a free account today!</h3>
                    <input 
                        type="text" 
                        name="firstName" 
                        value={this.state.firstName} 
                        onChange={this.handleChange}
                        minLength='2'
                        maxLength='30'
                        placeholder="First Name"
                        className="Signup-input"
                    />

                    <input 
                        type="text" 
                        name="lastName" 
                        value={this.state.lastName} 
                        onChange={this.handleChange}
                        minLength='2'
                        maxLength='30'
                        placeholder="Last Name"
                        className="Signup-input"
                    />

                    <br/>

                    <input 
                        type="email" 
                        name="email" 
                        value={this.state.email} 
                        onChange={this.handleChange}
                        minLength='6'
                        maxLength='50'
                        placeholder="Email"
                        className="Signup-input Signup-input-long"
                    />

                    <br/>

                    <input 
                        type="password" 
                        name="password" 
                        value={this.state.password} 
                        onChange={this.handleChange}
                        minLength='6'
                        maxLength='50'
                        placeholder="Password"
                        className="Signup-input"
                    />

                    <input 
                        type="password" 
                        name="confirmPassword" 
                        value={this.state.confirmPassword} 
                        onChange={this.handleChange}
                        minLength='6'
                        maxLength='50'
                        placeholder="Confirm Password"
                        className="Signup-input"
                    />

                    <br/>
                    
                    <button className="Signup-submit-btn">Create Account</button>
                    <p onClick={this.toLogin} className="Signup-p">Already have an account? Sign in here</p>
                </form>
            </div>
        ) 
    }
}
// Map signup from store into props for Signup
const mapDispatchToProps = (dispatch) =>{
    return{
        signUp: (credentials) => {dispatch(signUp(credentials));}
    }
}

export default withRouter(connect(null, mapDispatchToProps)(Signup));