import React, {Component} from 'react';
import './ExpandChat.css';

import avatar from './avatar.jpg';

class ExpandChat extends Component{
    render(){
        return(
            <div className ='expandChat'>
               <header>
                    <div className='profile'>
                        <img src = {avatar} className= 'profilePic'/>
                        <h2>Gugsa</h2>
                    </div>
               </header>
               
               <section className = 'chat-box'>
                   <div className = 'row no-gutters'>
                        <div className='msg-container'>
                            <div className ='msg msg-r'>
                                <div className ='msg-content'>This GuY is CoMEdy</div>
                                
                                <div className = 'read'>
                                    <i className ='fa fa-check mt-1'></i>
                                    <span>4:00 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className = 'row no-gutters'>
                        <div className='msg-container'>
                            <div className ='msg msg-r'>
                                <div className ='msg-content'>This GuY is CoMEdy</div>
                                
                                <div className = 'read'>
                                    <i className ='fa fa-check mt-1'></i>
                                    <span>4:01 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className ='row no-gutters'>
                        <div className='msg-container'>
                            <div className ='msg msg-l'>
                                <div className ='msg-content'>This GuY is CoMEdy</div>
                            </div>
                        </div>
                    </div>
               </section>
            </div>
        )
    }
}

export default ExpandChat;