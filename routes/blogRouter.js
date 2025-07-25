const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const blogController = require('../controllers/blogController');
const blogRouter = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Blogs'
    },
})
const uploadImg = multer({ storage: storage });

// blog create part
blogRouter.post('/create', uploadImg.single("mainImage"),
    async (req, res) => {

        const result = await new blogController().createBlog(req.body, req.file).then(
            (success) => {
                res.send(success);
            }
        ).catch(
            (error) => {
                res.send(error);
            }
        )
    })

// blog read part
blogRouter.get('/read', (req, res) => {
    const result = new blogController().blogRead(req.query).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
})

// delete blog part 
blogRouter.delete('/delete/:id', (req, res) => {
    const result = new blogController().blogDelete(req.params.id).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
})

// edit blog part
blogRouter.put('/edit-blog/:id', uploadImg.single('mainImage'), async (req, res) => {
    const result = new blogController().BlogEdit(req.body, req.file, req.params.id).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
})

// otherImg pert edit
blogRouter.patch('/edit-blog/:id', async (req, res) => {
    const result = new blogController().otherImgEdit(req.body.url, req.params.id).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
})

// statusChange part
blogRouter.put('/status-change', async (req, res) => {
    const result = new blogController().statusChange(req.query).then(
        (success) => {
            res.send(success);
        }
    ).catch(
        (error) => {
            res.send(error);
        }
    )
})

// comment part
// blogRouter.post('/comment', async (req, res) => {
//     const result = new blogController().commentCreate(req.body).then(
//         (success) => {
//             res.send(success);
//         }
//     ).catch(
//         (error) => {
//             res.send(error);
//         }
//     )
// })

module.exports = blogRouter;