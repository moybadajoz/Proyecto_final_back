const router = require('express').Router()
const Jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const note = require('../models/note')

router.post('/', async(req, res) => {
    const { title, content, color } = req.body
    const {token} = req.headers

    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }

    if( !title && !content ){
        return res.json({
            error: "Empty data"
        })
    }

    let newNote = new note({
        id_user: tokenDecode.id
    })

    if(title){
        newNote['title'] = title
    }
    if(content){
        newNote['content'] = content
    }
    if(color){
        newNote['color'] = color
    }

    try {
        const save = await newNote.save()
        if(save) {
            return res.json({
                error: null,
                msg: "Success"
            })
        } else {
            return res.json({
                error: "Failed to safe"
            })
        }
    } catch(error){
        return res.json({
            error: error
        })
    }

})

router.get('/', async(req, res) => {
    const {token} = req.headers
    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }
    
    const notes = await note.find({id_user: tokenDecode.id})
    return res.json({
        data: notes
    })
})

router.get('/:id', async(req, res) => {
    const {id} = req.params
    const {token} = req.headers
    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }
    
    const notes = await note.findOne({_id: id, id_user: tokenDecode.id})
    return res.json({
        data: notes
    })
})

router.put('/:id', async(req, res) => {
    const {id} = req.params
    const {token} = req.headers
    const {title, content, color} = req.body 
    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }

    if(!title && !content){
        return res.json({
            error: "The note can't be empty"
        })
    }
    
    const notes = await note.findOne({_id: id, id_user: tokenDecode.id})
    if(!notes){
        return res.json({
            error: "You can't do that"
        })
    }
    if(title)
        notes.title = title
    if(content)
        notes.content = content
    if(color)
        notes.color = color

    try {
        const save = await notes.save()
        if (save) {
            return res.json({
                error: null,
                msg: "Success"
            })
        } else{
            return res.json({
                error: "Failed to save"
            })
        }
    } catch (error){
        return res.json({
            error: error
        })
    }
    
})

router.delete('/:id', async(req, res) => {
    const {id} = req.params
    const {token} = req.headers
    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }

    try {
        const Data = await note.findOneAndDelete({_id: id, id_user: tokenDecode.id})
        if(Data){
            return res.json({
                error: null,
                msg: "Success",
                data: Data
            })
        }else{
            return res.json({
                error: "Could not delete",
            })
        }
    }catch(error){
        return res.status(400).json({
            error: error
        })
    }
})

router.post('/all', async(req, res) => {
    const notes = await note.find()
    return res.json({
        data: notes
    })
})
module.exports = router