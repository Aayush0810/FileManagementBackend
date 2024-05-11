const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const File = require("../Models/File_folder");
const User = require("../Models/User");
const { authMiddleware } = require("../Middleware");
const fs = require("fs");
const app = express();
app.use(express.json());
const uploadMiddleWare = require("../uploadMiddleware/upload");
const router = express.Router();

router.post("/uploadFolder", authMiddleware, async (req, res) => {
  const { name, parentPath } = req.body;
  if (!name) return res.status(400).send("Folder name required");
  try {
    const folder_path = `${parentPath}/${name}`;
    const newFolder = new File({
      name: name,
      type: "folder",
      path: folder_path,
      owner: req.user._id,
    });
    await newFolder.save();
    res
      .status(201)
      .json({ message: "Folder uploaded successfully", newFolder: newFolder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/folderRename", async (req, res) => {
  const { newName, id } = req.body;
  try {
    const newFolder = await File.findByIdAndUpdate(
      id,
      { $set: { name: newName, path: `/${newName}` } },
      { new: true }
    );
    if (newFolder) {
      res
        .status(200)
        .json({ message: "Folder updated successfully", folder: newFolder });
    } else {
      res.status(404).json({ message: "Folder not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userFolders = await File.find({
      owner: req.user._id,
      type: "folder",
    }).sort({ dateCreated: -1 });

    res.status(200).json({ userFolders: userFolders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/folder/:id", authMiddleware, async (req, res) => {
  try {
    const userFolder = await File.find({
      owner: req.user._id,
      type: "folder",
    });

    res.status(200).json({ userFolders: userFolder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/uploadFile",
  authMiddleware,
  uploadMiddleWare,
  async (req, res) => {
    if (!req.files) {
      return res.status(400).send("No file uploaded");
    }
    const filename = req.files[0].originalname;
    const extension = filename.split(".").pop();

    const { folderName } = req.body;
    try {
      const newFile = new File({
        name: req.files[0].originalname,
        type: "file",
        path: req.files[0].location,
        owner: req.user._id,
        fileType: extension,
      });
      await newFile.save();

      await File.findOneAndUpdate(
        { path: `/${folderName}`, type: "folder", owner: req.user._id },
        { $push: { children: newFile._id } }
      );
      await User.findByIdAndUpdate(req.user._id, {
        $push: { files: newFile._id },
      });

      res
        .status(201)
        .json({ message: "File uploaded successfully", file: newFile });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/folder/:folderId/files", authMiddleware, async (req, res) => {
  const folderId = req.params.folderId;

  try {
    const folder = await File.findById(folderId).populate("children");

    if (!folder) {
      return res.status(404).send({ message: "Folder not found" });
    }
    if (folder.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "Access denied" });
    }
    res.status(200).json({ files: folder.children });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/file/:fileId", authMiddleware, async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "Access denied" });
    }
    res.status(200).json({ file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findByIdAndDelete(id);
    if (!file) return res.status(404).send("File not found.");
    res.send("File deleted.");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put("/renameFile", async (req, res) => {
  const { newName, id } = req.body;
  if (!newName) {
    return res.status(400).send("New name is required.");
  }
  try {
    const newFileName = await File.findByIdAndUpdate(
      id,
      { $set: { name: newName } },
      { new: true }
    );
    if (newFileName) {
      res.status(200).json({
        message: "File Name updated successfully",
        newFileName: newFileName,
      });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/moveFile/:fileId", authMiddleware, async (req, res) => {
  const { fileId } = req.params;
  const { newFolderId } = req.body;

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "Access denied" });
    }

    const currentFolder = await File.findOne({
      children: fileId,
      owner: req.user._id,
      type: "folder",
    });
    if (currentFolder) {
      await File.findByIdAndUpdate(currentFolder._id, {
        $pull: { children: fileId },
      });
    }

    const newFolder = await File.findOne({
      _id: newFolderId,
      owner: req.user._id,
      type: "folder",
    });
    if (!newFolder) {
      return res
        .status(404)
        .send({ message: "Target folder not found or access denied" });
    }

    await File.findByIdAndUpdate(newFolderId, { $push: { children: fileId } });

    res.status(200).json({ message: "File moved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// rate limiter, buffer file stringing
