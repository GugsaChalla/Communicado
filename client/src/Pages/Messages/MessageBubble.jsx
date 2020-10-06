import React, {Component} from 'react';
import {loadProfilePic, getUserData} from '../../store/actions/profileActions';
import {getReadReceipts} from '../../store/actions/messagesActions';
import ImageModal from './ImageModal';
import loading from '../../images/loading.jpg';
import moment from 'moment';
import './css/MessageBubble.css';

class MessageBubble extends Component{
    constructor(){
        super();

        this.state={
            senderImgURL: null,
            readReceipts: [],
            name: "Loading User..."
        }

        this.loadReadReceipts = this.loadReadReceipts.bind(this);
        this.getMemberName = this.getMemberName.bind(this);
    }

    async componentDidMount(){
        const {senderId} = this.props;

        const senderImgURL = await loadProfilePic(senderId);
        await this.loadReadReceipts();
        await this.getMemberName();
   
        this.setState({senderImgURL});
    }

    async componentDidUpdate(prevProps){
        const {readBy} = this.props;

        if(prevProps.readBy.length !== readBy.length){
            await this.loadReadReceipts();
        }
    }

    async loadReadReceipts(){
        const {readBy, senderId, handleScroll} = this.props;
        
        const readReceipts = await getReadReceipts(readBy, senderId, loadProfilePic);

        this.setState({readReceipts});
        handleScroll();
    }

    async getMemberName(){
        const{senderId} = this.props;
        
        const user = await getUserData(senderId);
        const name = user.firstName+ " " + user.lastName;
        
        this.setState({name});
    }

    render(){
        const {uid, msgId, senderId, chatId, content, timeSent, image} = this.props;
        const {senderImgURL, readReceipts, name} = this.state;

        const msgPosition = (uid === senderId)? 
            'msg-r': 
            'msg-l';

        return(
            <div className ='row no-gutters'>
                <div className='msg-container'>
                
                    {msgPosition === 'msg-l'? 
                        (<img 
                            src = {senderImgURL? senderImgURL: loading} 
                            alt ='profile pic'
                            data-toggle='tooltip' 
                            data-placement='top'
                            title= {moment(timeSent).calendar()}
                        />): 
                        null
                    }
                    
                    <div className ={`msg ${msgPosition} my-1`}>
                        <p className='mb-4'>
                            <strong className='user-name'>{name}</strong>
                        </p>
                        
                        <div>
                            {image?
                                (<div className='text-primary msg-photo' data-toggle ='modal' data-target ={`#${msgId}-image`}>
                                    Photo
                                </div>):
                                null
                            }

                            {content}
                        </div>

                        <div className = 'read-receipts'>
                            {readReceipts.map((imgURL, i) => 
                                <img
                                    key = {i}
                                    src = {imgURL}
                                    alt = 'profile pic'
                                />
                            )}
                        </div>
                    </div>
                  
                    {msgPosition === 'msg-r'? 
                         (<img 
                            src = {senderImgURL? senderImgURL: loading} 
                            alt ='profile pic'
                            data-toggle='tooltip' 
                            data-placement='bottom'
                            title= {moment(timeSent).calendar()}
                        />): 
                        null
                    }
                </div>

                {image? 
                    (<div className='modal fade' id={`${msgId}-image`} data-backdrop='static'>
                        <ImageModal 
                            msgId={msgId} 
                            chatId={chatId} 
                            timeSent={timeSent}
                        />
                    </div>):
                    null
                }
            </div>
        )
    }
}

export default MessageBubble;