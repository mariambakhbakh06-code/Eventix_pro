const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Billet_Database')
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.log("Connection error:", err);
});