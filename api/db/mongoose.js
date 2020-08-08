const { Mongoose } = require("mongoose")

/* Handle MongoDB connections */
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', {useNewUrlParser: true}).then( () => {
    console.log("Connected to MongoDB successfully :)");
}).catch((e) => {
    console.log("Error attempting to connect to mongoDB");
    console.log(e);
});

/* Deprecation Warnings removal */

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', true);

module.exports = {
    mongoose
};
