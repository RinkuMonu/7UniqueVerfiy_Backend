
const blogModel = require("../models/blogModel");

class blogController {
    // Blog create part
    createBlog(data, file) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    let newBlog;
                    if (file) {
                        newBlog = new blogModel(
                            {
                                ...data,
                                mainImage: file.path,
                            }
                        )
                        newBlog.save().then(
                            async () => {
                                resolve({
                                    msg: "Blog added",
                                    status: 1
                                })
                            }
                        ).catch(
                            (error) => {
                                console.log(error);
                                reject({
                                    msg: "Blog not added due to file image",
                                    status: 0
                                })
                            }
                        )
                    } else {
                        newBlog = new blogModel(
                            {
                                ...data
                            }
                        )
                        newBlog.save().then(
                            async () => {
                                resolve({
                                    msg: "Blog added",
                                    status: 1
                                })
                            }
                        ).catch(
                            (error) => {
                                console.log(error);
                                reject({
                                    msg: "Blog not added",
                                    status: 0
                                })
                            }
                        )
                    }

                } catch (error) {
                    console.log(error);
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

    // Blog read part
    blogRead(query) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    let allBlog;
                    if (query.id) {
                        allBlog = await blogModel.findById(query.id)
                    }
                    else {
                        allBlog = await blogModel.find()
                    }

                    if (!allBlog) {
                        reject({
                            msg: 'result not found',
                            status: 0
                        })
                    } else {
                        resolve({
                            msg: 'Blog found',
                            status: 1,
                            allBlog
                        })
                    }
                } catch (error) {
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

    // Blog Delete part
    blogDelete(id) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const deleteBlog = await blogModel.findById(id);

                    if (deleteBlog) {
                        blogModel.deleteOne({ _id: id }).then(
                            () => {
                                resolve({
                                    msg: 'Blog deleted',
                                    status: 1
                                })
                            }
                        ).catch(
                            () => {
                                reject({
                                    msg: 'Blog not deleted',
                                    status: 0
                                })
                            }
                        )
                    } else {
                        reject({
                            msg: 'Blog not found',
                            status: 0
                        })
                    }

                } catch (error) {
                    console.log(error);
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

    // Blog Edit part
    BlogEdit(data, file, id) {
        return new Promise(
            async (resolve, reject) => {

                try {
                    if (file) {
                        await blogModel.updateOne({ _id: id },
                            {
                                $set: {
                                    ...data,
                                    mainImage: file.path,
                                }
                            }
                        ).then(
                            () => {
                                resolve({
                                    msg: 'Blog updated',
                                    status: 1
                                })
                            }
                        ).catch(
                            () => {
                                reject(
                                    {
                                        msg: 'Blog not update due to file image',
                                        status: 0
                                    }
                                )
                            }
                        )
                    } else {
                        await blogModel.updateOne(
                            {
                                _id: id
                            },
                            {
                                $set: {
                                    ...data
                                }
                            }
                        ).then(
                            () => {
                                resolve({
                                    msg: 'Blog updated',
                                    status: 1
                                })
                            }
                        ).catch(
                            () => {
                                reject({
                                    msg: 'Blog not updated',
                                    status: 0
                                })
                            }
                        )
                    }
                } catch (error) {
                    console.log(error);
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

    // otherImg pert edit
    otherImgEdit(url, id) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    if (id) {
                        const findBlog = await blogModel.findById(id);
                        if (findBlog) {
                            await blogModel.updateOne(
                                {
                                    _id: id
                                },
                                {
                                    $set: {
                                        maltipleImage: findBlog.maltipleImage.filter((oldUrl) => {
                                            return (oldUrl != url)
                                        })
                                    }
                                }
                            ).then(
                                () => {
                                    resolve({
                                        msg: "Image deleted",
                                        status: 1
                                    })
                                }
                            ).catch(
                                () => {
                                    reject(
                                        {
                                            msg: "Image not deleted",
                                            status: 0,
                                        }
                                    )
                                })
                        }
                    }
                } catch {
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

    // statusChange part
    statusChange(query) {
        return new Promise(
            async (resolve, reject) => {
                try {
                    if (query.id) {
                        const agent = await blogModel.findById(query.id)
                        await blogModel.updateOne(
                            {
                                _id: query.id
                            }, {
                            $set: {
                                status: !agent.status
                            }
                        }
                        ).then(
                            () => {
                                resolve({
                                    msg: 'status change',
                                    status: 1
                                })
                            }
                        ).catch(
                            () => {
                                reject({
                                    msg: 'status not change',
                                    status: 0
                                })
                            }
                        )
                    }
                } catch (error) {
                    reject({
                        msg: 'Internal server error',
                        status: 0
                    })
                }
            }
        )
    }

    // comment part
    // commentCreate(data) {
    //     return new Promise(
    //         async (resolve, reject) => {

    //             try {
    //                 if (data.id) {

    //                     await blogModel.updateOne(
    //                         {
    //                             _id: data.id
    //                         }, {
    //                         $push: {
    //                             comment: {
    //                                 user: data.userId,
    //                                 text: data.text,
    //                             }
    //                         }
    //                     }
    //                     ).then(
    //                         () => {
    //                             resolve({
    //                                 msg: 'Comment Added',
    //                                 status: 1
    //                             })
    //                         }
    //                     ).catch(
    //                         () => {
    //                             reject({
    //                                 msg: 'Comment not Added',
    //                                 status: 0
    //                             })
    //                         }
    //                     )
    //                 }
    //             } catch (error) {
    //                 console.log(error);

    //                 reject({
    //                     msg: 'Internal server error',
    //                     status: 0
    //                 })
    //             }
    //         }
    //     )
    // }

}
module.exports = blogController;