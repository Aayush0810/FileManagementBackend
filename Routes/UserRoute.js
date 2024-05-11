const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../Models/User");
const { authMiddleware } = require("../Middleware");

// const File_folder = require("./Models/File_folder");

const router = express.Router();



router.post('/signup', async (req, res) => {
    // const { email, password } = req.body;
    // try {
    //   const salt = await bcrypt.genSalt(10);
    //   const hashedPassword = await bcrypt.hash(password, salt);
  
    //   const newUser = new User({ email, password: hashedPassword });
    //   await newUser.save();
    //   res.status(201).send('User created');
    // } catch (err) {
    //   res.status(500).json({ error: err.message });
    // }
    const { email, password } = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      res.status(201).json({ message: 'User created', token }); 
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  
  router.post('/signin', async (req, res) => {
    // const { email, password } = req.body;
    // try {
    //   const user = await User.findOne({ email });
    //   if (!user) return res.status(404).send('User not found');
      
    //   const isMatch = await bcrypt.compare(password, user.password);
    //   if (!isMatch) return res.status(400).send('Invalid credentials');
      
    //   const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    //   res.json({ token });
    // } catch (err) {
    //   res.status(500).json({ error: err.message });
    // }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send('User not found');
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).send('Invalid credentials');
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ token });  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.get('/users', async (req, res) => {
    try {
      const users = await User.find(); 
      res.status(200).send(users); 
    } catch (err) {
      const status = err.statusCode || 500;
      res.status(status).json({ error: err.message });
    }
  });

  module.exports = router