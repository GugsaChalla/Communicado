import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import * as msgActions from '../../store/actions/messagesActions';
import {loadProfilePic, getUserData} from '../../store/actions/profileActions';
import loading from '../../images/loading.jpg';
import './css/MessageCard.css';

class MessageCard extends Component {
    constructor(){
        super();
        
        this.state = {
            isRead: true,
            memberNames: 'Loading Users...',
            chatPics: [],
            content: ''
        }

        this.handleClick = this.handleClick.bind(this);
        this.formatContent = this.formatContent.bind(this);
    }


    handleClick(){
        const {chatId,uid,dispatch,clearTextbox} = this.props;
        const {loadChats} = msgActions;
        this.props.history.push(`/chat/${chatId}`);
        dispatch(loadChats(uid));
        clearTextbox();
    }

    async componentDidMount(){
        const {chatId, uid, lastMsg, isActive, dispatch} = this.props;
        const {readChat, getChatPics, getMemberNames} = msgActions;

        const isRead = dispatch(readChat(chatId, uid, lastMsg, isActive));
        const chatPics = await getChatPics(chatId, uid, loadProfilePic);
        const memberNames = await getMemberNames(chatId, uid);
        const content = await this.formatContent();
    
        this.setState({
            memberNames,
            chatPics,
            isRead,
            content
        });   
    }

    async componentDidUpdate(prevProps){
        const {chatId, uid, lastMsg, isActive, dispatch} = this.props;
        const {readChat} =msgActions;

        if(prevProps.isActive !== isActive){
            const isRead = await dispatch(readChat(chatId, uid, lastMsg, isActive));
            
            this.setState({
                isRead
            });
        }
    }

    async formatContent(){
        const {content, senderId} = this.props.lastMsg;

        if(content.length > 20){
            return content.substring(0, 18) + '...';
        }

        else if(content.length === 0){
            const user = await getUserData(senderId);
            const {firstName} = user;
            
            return `${firstName} sent a photo`;
        }

        return content;
    }

    render() {
        const {memberNames, chatPics, isRead, content} = this.state;
        const {isActive} = this.props;

        const cardClassName = (isActive)? 'active': '';

        return (
            <div onClick={this.handleClick} className={`MessageCard ${cardClassName} card flex-row flex-wrap`}>
                <div className = "card-header border-0">
                    {chatPics.map((pic, i) =>
                        <img
                            key = {i}
                            src = {pic? pic: loading}
                            alt = 'proflie pic'
                            style={{marginLeft: `-${i * 15}px`}}
                        />
                    )}
                </div>

                <div className="card-block px-2">
                    <h3 className="card-title">
                        {memberNames}
                    </h3>

                    {isActive || isRead?
                        (<p className="card-text text-muted">
                            {content}
                        </p>):
                        (<p className="card-text">
                            <strong>{content}</strong>
                        </p>)
                    }
                </div>
            </div>
        )
    }
}

export default withRouter(MessageCard);