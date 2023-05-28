const router = require('express').Router()
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const user = require('../models/user')
const { response } = require('express')

router.post('/', async(req, res) => {
    const {email, password} = req.body

    if(!email || !password){
        return res.status(400).json({
            error: "Some data is missing",
            data: null
        })
    }
    const emailExists = await user.findOne({email: email})

    if(!emailExists){
        return res.status(401).json({
            error: "Email not find",
            data: null
        })
    }
    bcrypt.compare(password, emailExists.password, (err, response) => {
        if(err)
            console.log(err)
        if(response) {
            const token = Jwt.sign({id: emailExists._id}, process.env.TOKEN_SECRET)
            
            return res.json({
                error: null,
                msg: "Sucess",
                token: token
            })
        } else {
            return res.status(401).json({ msg: "Invalid credencial" })
        }
    })
})

module.exports = router