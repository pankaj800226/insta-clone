const express = require('express');
const multer = require('multer')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Path = require('path')
const imageModel = require('./module/Post')
const dotenv = require('dotenv')
dotenv.config();

const app = express()
const PORT = process.env.PORT|| 8080;
//medialware
app.use(express.json())
app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())

// database connected
try {
  mongoose.connect(process.env.MONGO_DB_URL)
  console.log('mongodb connected successfully');
} catch (error) {
  console.log(`mongoose connect error: ${error}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/Images')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + Path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// create upload image

app.post('/upload', upload.single('file'), async (req, res) => {
  console.log(req.file);
  console.log(req.body.tital);
  await imageModel.create({
    image: req.file.filename,
    tital: req.body.tital,
  })
    .then((result) => res.json(result))
    .catch((err) => res.json(err))
})

//Get image from display
app.post('/getImage', async (req, res) => {
  await imageModel.find()
    .then((result) => res.json(result))
    .catch((err) => res.json(err))
})



// route find user
app.post('/getroute/:id', async (req, res) => {
  const { id } = req.params
  await imageModel.findById({ _id: id })
    .then((result) => res.json(result))
    .catch((err) => res.json(err))
})


// Add comment to an user post
app.post('/addcomment/:id', async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body
  try {
    const userPost = await imageModel.findById(id);
    if (!userPost) {
      return res.status(404).json({ error: 'comment not found' })
    } else {
      userPost.comments.push(comment)
      await userPost.save()
    }

    res.json(userPost)
  } catch (error) {
    console.log("error adding comment", error);
    res.status(500).json({ error: 'error' })
  }

})

// like post
app.post('/like/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userPost = await imageModel.findById(id);
    if (!userPost) {
      return res.status(404).json({ error: 'Like not found' });
    }

    userPost.likes++;
    await userPost.save();
    res.json({ message: 'Image liked', likes: userPost.likes });
  } catch (error) {
    console.log("Error liking image:", error);
    res.status(500).json({ error: 'Error liking image' });
  }
});

// unlike post
app.post('/unlike/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userPost = await imageModel.findById(id);
    if (!userPost) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (userPost.likes > 0) {
      userPost.likes--;
      await userPost.save();
    }
    res.json({ message: 'Image liked', likes: userPost.likes });
  } catch (error) {
    console.log("Error liking image:", error);
    res.status(500).json({ error: 'Error liking image' });
  }
});



// -----------------------------------Post edit------------------------------------- 
app.put('/editPost/:id', async (req, res) => {
  const { id } = req.params
  await imageModel.findByIdAndUpdate({ _id: id }, {
    tital: req.body.tital,
  }).then((result) => res.json(result))
    .catch((err) => res.json(err))
})



//  -----------------------------delete----------------------------------------------
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params
  console.log(req.body);
  await imageModel.findByIdAndDelete({ _id: id })
    .then((result) => res.json(result))
    .catch((err) => res.json(err))

})



// -----------------------------------Server------------------------------------- 
app.listen(process.env.PORT, () => {
  console.log('Server running on port ' + PORT)
})