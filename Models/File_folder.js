const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['file', 'folder']  
    },
    path: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: false
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    children: [{
      type: Schema.Types.ObjectId,
      ref: 'File' 
    }],
  });
  
  const File = mongoose.model('File', fileSchema);
  module.exports = File;
  