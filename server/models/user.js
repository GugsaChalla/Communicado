const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const schema = mongoose.Schema;

const {NotifSchema} = require('./notif');

// User Schema that shows the data that a user will have
const UserSchema = new schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    dateCreated: Date, 
    profilePic: String,
    friends: [String],
    notifs: [NotifSchema],
    chats: [String]
});

UserSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.pre('updateOne', async function(next){
    const newData = this.getUpdate();

    if(newData.password){
        const salt = await bcrypt.genSalt();
        newData.password = await bcrypt.hash(newData.password, salt);
    } 
   
    next();
});


UserSchema.statics.login = async function(email, password){
    const user = await this.findOne({email});

    if(user){
        const auth = await bcrypt.compare(password, user.password);

        const success = {uid: user._id, msg: "Success"};
        const failure = {msg: "Incorrect password"};

        return auth? success: failure;
    }

    else{
        return {msg: "Email not registered with Communicado"};
    }
}

const User = mongoose.model('user', UserSchema);
exports.User = User;