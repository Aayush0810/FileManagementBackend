const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  files: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }]
});

const User = mongoose.model('User', userSchema);
module.exports = User;

