import React, {Component} from 'react';
import {withRouter, Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {login} from '../../store/actions/authActions';
import {withAlert} from 'react-alert';
import './css/Login.css';

// Login page of simple credential requirements
class Login extends Component {
    constructor(){
        super();
        
        // Login state
        this.state = {
            email: '',
            password: ''
        }

        this.toSignup=this.toSignup.bind(this);
        this.handleChange=this.handleChange.bind(this);
        this.handleSubmit=this.handleSubmit.bind(this);
    }

    // Link to signup button
    toSignup(){
        this.props.history.push('/signup');
    }

    // Update state for each letter change in the form
    handleChange(e){
        this.setState({[e.target.name]: e.target.value});
    }

    // try to login using the state variables when submitted
    handleSubmit(e){
        e.preventDefault();
        
        const {dispatch, alert} = this.props;

        dispatch(login(this.state, alert));
    }

    render(){
        const {email, password} = this.state;
        const {uid} = this.props;

        // If there is a UID, show home screen 
        if(uid){
            return <Redirect to='/'/>
        }

        return(
            <div className='login text-white'>
                {/* Login navbar of site descriptions */}
                 <nav className='navbar'>
                    <h2 className='navbar-brand ml-3 mt-2'>Communicado</h2>

                    <button className='navbar-toggler' data-toggle='collapse' data-target='#message'>
                        <span className='navbar-toggler-icon'></span>
                    </button>

                    <div className='collapse navbar-collapse text-center' id='message'>
                        <ul className='navbar-nav'>
                            Communicado is a full stack messaging application 
                            created using the MERN stack, Socket.io 
                            and styled using Bootstrap4 
                        </ul>
                    </div>
                </nav>

                {/* Form of credentials */}
                <form className='mb-5' onSubmit={this.handleSubmit}>
                    <h1 className='ml-2 mb-5'>Sign in</h1>
                    
                    {/* Email */}
                    <input type='email' 
                           name ='email'
                           value ={email} 
                           onChange={this.handleChange}
                           minLength='6' 
                           maxLength='50' 
                           placeholder='Your email here' 
                           required
                    />
                    
                    {/* Password */}
                    <input type='password' 
                           name='password'
                           value ={password} 
                           onChange={this.handleChange}
                           minLength='6' 
                           maxLength='50' 
                           placeholder='Your password here' 
                           required
                    />
                    
                    {/* Submit btn */}
                    <button className='btn btn-success btn-lg'>
                        Login
                    </button>

                    {/* Link to signup page */}
                    <p onClick={this.toSignup} className='mt-4 ml-2'>
                        Don't have an account? Sign up here!
                    </p>
                </form>
            </div>
        )
    }
}

// Add login function from redux store to attempt user login based on credentials
const mapDispatchToProps = (dispatch) => ({dispatch});

export default withRouter(connect(null, mapDispatchToProps)(withAlert()(Login)));