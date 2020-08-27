import React, { Component } from 'react';
import MessageCard from './MessageCard';
import './MessageList.css'

class MessageList extends Component {
    componentDidMount(){
        const {uid, loadChats} = this.props;
        
        loadChats(uid);
    }

    render() {
        const {uid,chatId} = this.props;
        const chatonDisplay = chatId
        const chats = this.props.chats.map(chat =>
            <MessageCard
                key = {chat._id}
                chatId = {chat._id}
                uid = {uid}
                isActive = {chatonDisplay===chat._id}
            />
        );

        return (
            <div className="MessageList">
                {chats}
            </div>
        )
    }
}
export default MessageList;