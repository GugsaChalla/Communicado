const router = require('express').Router();

const { 
    getChat,
    createChat,
    getUserChats,
    getMemberNames,
    getChatMessages,
    createMessage,
    getChatMemberIds,
    checkForUnseenChats,
    seeChats,
    readChat,
    checkIfChatExists,
    getMessageImage,
    handleComposerQuery
 } = require('../controllers/chat');

router.get('/:chatId', getChat);
router.post('/create', createChat);
router.get('/user/:uid', getUserChats);
router.post('/members', getMemberNames);
router.get('/messages/:chatId', getChatMessages);
router.post('/message', createMessage);
router.post('/memberids', getChatMemberIds);
router.get('/unseen/:uid', checkForUnseenChats);
router.put('/seechats/:uid', seeChats);
router.post('/readchat', readChat);
router.post('/exists', checkIfChatExists);
router.post('/image', getMessageImage);
router.post('/composer', handleComposerQuery);

module.exports = router;