import React, { Component } from 'react';
import {withRouter, Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import * as msgActions from '../../store/actions/messagesActions';
import MessageCard from './MessageCard';
import SearchMsgs from './SearchMsgs';
import ExpandChat from './ExpandChat';
import SendMsg from './SendMsg'
import ComposeMsg from './ComposeMsg';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';
import './css/Messages.css';

class Messages extends Component {
    constructor(){
        super();

        this.state={
            clearQuery:false
        };

        this.handleComposer = this.handleComposer.bind(this);
        this.clearTextbox = this.clearTextbox.bind(this);
        }

    async componentDidMount(){
        const chatId = this.props.match.params.id;

        const {uid, dispatch} = this.props;
        const {loadChats, seeChats} = msgActions;

        this.cancelSource = axios.CancelToken.source();
        
        const chats = await dispatch(loadChats(uid, this.cancelSource));
        dispatch(seeChats(uid));

        if(chatId === 'home' && chats.length !== 0){
            this.props.history.push(`/chat/${chats[0]._id}`);
        }

        else if(chats.length === 0 || chatId === 'new'){
            this.props.history.push('/chat/new');
        }
    }

    componentDidUpdate(prevProps){
        const prevPathName = prevProps.location.pathname;
        const currPathName = this.props.location.pathname;

        const {uid, dispatch, unseenChats} = this.props;
        const {seeChats} = msgActions;

        if(prevPathName !== '/chat/home' && currPathName === '/chat/home'){
            this.props.history.push(prevPathName);
        }

        if(unseenChats){
            dispatch(seeChats(uid));
        }
    }

    handleComposer(){
        const {chats, recipients} = this.props;

        const {id} = this.props.match.params;
        
        if(id !== 'new'){
            this.props.history.push('/chat/new');
        }

        else{
            const exitComposer = () => {this.props.history.goBack();}

            if(chats.length === 0){
                return;
            }

            if(recipients.length !== 0){
                confirmAlert({
                    title: 'Communicado',
                    message: 'Are you sure you want to exit?',
                    buttons: [
                        {label: 'Yes', onClick: exitComposer},
                        {label: 'No', onClick: () => {return;}}
                    ]
                });
            }

            else{
                exitComposer();
            }
        }
    }

    clearTextbox(){
        this.setState({clearQuery:true});
    }

    componentWillUnmount(){
        const {dispatch} = this.props;
        const {clearChats} = msgActions;

        dispatch(clearChats());

        this.cancelSource.cancel();
    }

    render() {
        const {
            uid,
            composerResults,        
            recipients,
            chats,
            typingOnDisplay,
            composerChatId,
            dispatch
        } = this.props;

        if(!uid){
            return <Redirect to ='/'/>
        }

        const chatId = this.props.match.params.id;

        const msgCards =chats.map(chat =>
            <MessageCard
                key = {chat._id}
                chatId = {chat._id}
                uid = {uid}
                isActive = {chatId === chat._id}
                lastMsg = {chat.messages[chat.messages.length - 1]}
                dispatch = {dispatch}
                clearTextbox ={this.clearTextbox}
                clearQuery = {this.state.clearQuery}
            />
        );

        return (
            <div className="Messages">
                <div className="container-fluid">
                    <div className="row no-gutters">
                        <div className="col-4">
                            <header className='compose'> 
                                <h3>Chats</h3>
                                
                                {chatId === 'new'?
                                    (<i className='fa fa-times' onClick={this.handleComposer}/>):
                                    (<i className="fas fa-paper-plane" onClick={this.handleComposer}/>)
                                }               
                            </header>

                            <div className ='MessageList'>
                                <SearchMsgs 
                                uid={uid}
                                clearQuery = {this.state.clearQuery}
                                />
                                {msgCards} 
                            </div>
                        </div>

                        <div className="expandChat-container col-8">
                            {chatId === 'new'? 
                                (<ComposeMsg 
                                    uid={uid}
                                    composerResults = {composerResults}
                                    recipients = {recipients}
                                    composerChatId = {composerChatId}
                                    dispatch = {dispatch}
                                />): 
                                (<ExpandChat 
                                    chatId={chatId} 
                                    isComposerChat={false}
                                />)
                            }
                            
                            <SendMsg 
                                uid = {uid}
                                chatId = {chatId}
                                recipients = {recipients}
                                typingOnDisplay = {typingOnDisplay}
                                composerChatId = {composerChatId}
                                dispatch ={dispatch}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return{
        composerResults: state.messages.composerResults,
        recipients: state.messages.recipients,
        chats: state.messages.chats,
        typingOnDisplay: state.messages.typingOnDisplay,
        unseenChats: state.messages.unseenChats,
        composerChatId: state.messages.composerChatId
    }   
}

const mapDispatchToProps = (dispatch) => ({dispatch});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Messages));