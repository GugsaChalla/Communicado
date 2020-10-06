const router = require('express').Router();

const {
    getUserFriends, 
    getFriendStatus,
    changeFriendStatus,
    acceptFriendReq,
    declineFriendReq
} = require('../controllers/friends');

router.get('/:uid', getUserFriends);
router.post('/status', getFriendStatus);
router.post('/change', changeFriendStatus);
router.post('/accept', acceptFriendReq);
router.post('/decline', declineFriendReq);

module.exports = router;