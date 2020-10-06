import React, {Component} from 'react';
import {connect} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {colorNotif, checkIfNotifsUnread} from './store/actions/notificationsActions';
import {getUnseenChats} from './store/actions/messagesActions';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import Home from './Pages/Home/Home';
import Settings from './Pages/Settings/Settings';
import Friends from './Pages/Friends/Friends.jsx';
import Notifications from './Pages/Notifications/Notifications.jsx';
import Navbar from './Partials/Navbar';
import Messages from './Pages/Messages/Messages';
import DeadPage from './Partials/DeadPage';
import socket from 'socket.io-client';
import {handleSocketEvents} from './socket/socketEvents';
import {ToastContainer} from 'react-toastify';
import './App.css';

let io;

class App extends Component{
   constructor(props){
      super();
      
      //io only instantiated once and we dont want override this cnonnection
      io = socket('http://localhost:5000');
      
      //importing all these socket.on events from server (socketEvents.js)
      handleSocketEvents(io, props.dispatch);
   }

   async componentDidMount(){
      const {uid, dispatch} = this.props;

      if(uid){
         io.emit("JOIN_SERVER", {uid: this.props.uid});
         await this.checkForNavbarUpdates(uid, dispatch);
      }
   }

   async componentDidUpdate(){
      const {uid, dispatch} = this.props;

      if(uid){
         io.emit("JOIN_SERVER", {uid: this.props.uid});
         await this.checkForNavbarUpdates(uid, dispatch);
      }
   }

   async checkForNavbarUpdates(uid, dispatch){
      const unreadNotifs = await checkIfNotifsUnread(uid);

      if(unreadNotifs){
         dispatch(colorNotif());
      }

      dispatch(getUnseenChats(uid));
   }

   render(){
      const {uid} = this.props;
      
      return(
         <div>
            { /*If ID required for route, show Navbar*/}
            <BrowserRouter>   
               {uid? <Navbar/>: null}

               <div>
                  <Switch>
                  {/* Router that switches paths based on route */}
                     <Route exact path='/' render = {()=> uid? <Home uid ={uid}/>: <Login uid ={uid}/>}/>
                     <Route path='/chat/:id' render={() => <Messages uid={uid}/>}/>
                     <Route path='/signup' render ={() => <Signup uid ={uid}/>}/>
                     <Route path='/settings' component = {Settings}/>
                     <Route path='/friends' component = {Friends}/>
                     <Route path='/notifications' component={Notifications}/>
                     <Route path='/' component={DeadPage}/>
                  </Switch>
               </div>
               
               <ToastContainer/>
            </BrowserRouter>
         </div>
      )
   }
}
// Convert state to props using reducer
const mapStateToProps = (state) =>{
    return {
        uid: state.auth.uid,
    }
}

const mapDispatchToProps = (dispatch) => ({dispatch});

export {io};
export default connect(mapStateToProps, mapDispatchToProps)(App);