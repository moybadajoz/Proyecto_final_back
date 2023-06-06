const router = require('express').Router()
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const user = require('../models/user')

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d\s:])([^\s]){8,32}$/
const emailRegex = /^\S+@\S+\.\S+$/

const PasswordValidation = Joi.object({
    password: Joi.string().pattern(passwordRegex).required()
})
const NameValidation = Joi.object({
    name: Joi.string().min(1).max(255).required()
})
const EmailValidation = Joi.object({
    email: Joi.string().pattern(emailRegex).required()
})

router.post('/', async(req, res) => {
    const { name, email, password, passConfirm } = req.body

    //verificar que se haya enviado lo necesario
    if( !name || !email || !password || !passConfirm ){
        return res.status(400).json({
            error: "Some data is missing",
            data: null
        })
    }
    //verifica si la contraseña es valida con respecto a un ReGex
    const { error: passError } = PasswordValidation.validate({password})
    if (passError){
        return res.status(400).json({
            error: "Invalid password",
            data: null
        })
    }
    //verifica si las contraseñas son iguales
    if (password !== passConfirm){
        return res.status(400).json({
            error: "Passwords do not match",
            data: null
        })
    }
    //verifica si el nombre es valido (no sea demasiado largo)
    const { error: nameError } = NameValidation.validate({name})
    if ( nameError){
        return res.status(400).json({
            error: "The name is not valid",
            data: null
        })
    }
    //verifica si el email es valido (que tenga la estructura tipica de un email)
    const { error: emailError } = EmailValidation.validate({email})
    if ( emailError ){
        return res.status(400).json({
            error: "The email is not valid",
            data: null
        })
    }
    //Busca si el email existe en la base de datos (~Falta verificar que no existe en la coleccion de empleados)
    const emailExists = await user.findOne({ email: email })
    if (emailExists){
        return res.status(400).json({
            error: "Email already exists",
            data: null
        })
    }
    //encripta la contraseña
    const salt = await bcrypt.genSalt(10)
    const PassHash = await bcrypt.hash(password, salt)
    //almacena la informacion ya validada en el modelo
    const newUser = new user({
        name,
        email,
        password: PassHash
    })

    //guarda la informacion en la base de datos
    try {
        const save = await newUser.save()
        if (save) {
            return res.json({
                error: null,
                msg: "Success"
            })
        } else {
            return res.json({
                error: "Failed to save"
            })
        }
    } catch (error) {
        return res.json({
            error: error
        })
    }
})

router.get('/', async(req, res) => {
    /*const {token} = req.headers
    let token_decode = ''
    try {
        token_decode = Jwt.verify(token, process.env.TOKEN_SECRET)
        if(token_decode.type != 'company')
            return res.json({error: "You cannot see this"})
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }*/

    const Users = await user.find()

    return res.json({
        error: null,
        data: Users
    })
})
    
router.get('/:id', async(req, res) => {
    const {token} = req.headers
    const {id} = req.params
    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }

    if(id !== tokenDecode.id){
        return res.status(400).json({ error: "You can't get this"})
    }

    const User = await user.findOne({_id:id})

    if (User) {
    res.json({
            error: null,
            data: User
        })
    } else {
        res.status(400).json({
            error: "User not found",
            data: null
        })
    }
})

router.put('/:id', async(req, res) => {
    const { name, email, password, passConfirm } = req.body
    const {token} = req.headers
    const {id} = req.params
    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }
    
    if(id !== tokenDecode.id){
        return res.status(400).json({ error: "You can't edit this" })
    }
    //verifica si el usuario exite
    const User = await user.findById(id)
    if (!User ){
        return res.status(400).json({
            error: "User not found",
            data: null
        })
    }

    //verifica que no se envie una de las 2 contraseñas sin la otra
    if ((typeof password !== 'undefined') !== (typeof passConfirm !== 'undefined')) {
        return res.status(400).json({
            error: "Missing data",
            data: null
        })
    }
    //verifica si existe la contraseña y verifica que sea valida
    if (password && passConfirm) {
        const { error: passError } = PasswordValidation.validate({password})
        if( passError ) {
            return res.status(400).json({
                error: "Invalid password",
                data: null
            })
        }
        //verifica que las contraseñas sean iguales
        if (password !== passConfirm){
            return res.status(400).json({
                error: "Passwords do not match",
                data: null
            })
        }
        const salt = await bcrypt.genSalt(10)
        const PassHash = await bcrypt.hash(req.body.password, salt)
        User.password = PassHash
    }
    //verifica si el nombre es valido (no sea demasiado largo)
    if(name){
        const { error: nameError } = NameValidation.validate({name})
        if ( nameError){
            return res.status(400).json({
                error: "The name is not valid",
                data: null
            })
        }
        User.name = name
    }
    //verifica si el email es valido (que tenga la estructura tipica de un email)
    if(email){
        const { error: emailError } = EmailValidation.validate({email})
        if ( emailError ){
            return res.status(400).json({
                error: "The email is not valid",
                data: null
            })
        }
        //Busca si el email existe en la base de datos (~Falta verificar que no existe en la coleccion de empleados)
        const emailExists = await user.findOne({ email: email })
        if (emailExists){
            return res.status(400).json({
                error: "Email already exists",
                data: null
            })
        }
        if (typeof emailExists !== undefined && emailExists){
            if(!new mongoose.Types.ObjectId(id).equals(emailExists._id)){
                return res.status(400).json({
                    error: "Email already exists",
                    data: null
                })
            }
        }
        User.email = email
    }
    

    //guarda la informacion en la base de datos
    try {
        const save = await User.save()
        if (save) {
            return res.json({
                error: null,
                msg: "Success"
            })
        } else {
            return res.json({
                error: "Failed to save"
            })
        }
    } catch (error) {
        return res.json({
            error: error
        })
    }
})

router.delete('/:id', async(req, res) => {
    const {token} = req.headers
    const {id} = req.params
    let tokenDecode = ''
    try {
        tokenDecode = Jwt.verify(token, process.env.TOKEN_SECRET)
    } catch(err) {
        return res.json({error:"Session Expired", data: err})
    }
    
    if(id !== tokenDecode.id){
        return res.status(400).json({ error: "You can't delete that" })
    }
    try{
        const User = await user.findByIdAndDelete(id)
        return res.json({
            error: null,
            msg: "Success"
        })
    } catch (error){
        return res.status(400).json({
            error: error
        })
    }
})



module.exports = router