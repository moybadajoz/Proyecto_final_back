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

module.exports = router