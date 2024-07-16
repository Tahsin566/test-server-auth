
import express from 'express';
import cors from 'cors'
import { User } from '../models/User.js';
import { connect } from '../database/db.js';
import dotenv from 'dotenv'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express();

app.use(cors({
    origin:true,
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())


let arr = ['Tahsin', 'Tuhin', 'Badar', 'Dip', 'Apu', 'Najibur']




app.get('/', (req, res) => {

    res.send('Hello Express!');
    

});

app.post('/register', async (req, res) => {

    try {

        const { name, email, password } = req.body

        if (!(name && email && password)) {

            return res.status(400).json({ compulsory: false })

        }
        const person = await User.findOne({ email })

        if (person) {
            return res.status(401).json({ exists: true })
        }

        const hashpass = await bcryptjs.hash(password, 10)

        const user = await User.create({
            name: name,
            email: email,
            password: hashpass
        })

        const token = jwt.sign(

            { id: user._id, email: email },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "168h"
            }
        )

        user.token = token
        user.password = undefined

        res.status(201).json(user)


    }
    catch (err) {

        console.log(err)

    }

})

app.post('/login', async (req, res) => {

    const { email, password } = req.body

    if (!(email && password)) {
        return res.status(400).json({ compulsory: false })
    }

    const user = await User.findOne({ email })

    if (user && (await bcryptjs.compare(password, user.password))) {
        const token = jwt.sign(
            { id: user._id }, process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "168h"
            }
        );
        user.token = token,
            user.password = undefined

        const options = {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite:'none',
            secure:true
        }

        return res.cookie("token", token, options).json({

            success: true,
            token,
            user
            
        })
    }

    res.json({ success: false })

})


app.get('/dashboard', (req, res) => {

    const { token } = req.cookies
    
    if(!token){
        return res.status(400).json({found:false})
    }

    try{

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        res.json({found:true})
    }
    catch(err){

        res.json({expired:true})
    }




})

app.get('/logout',(req,res)=>{

    res.clearCookie("token",{sameSite:'none',secure:true})
    res.json({logout:true})
})


app.listen(3000, () => {
    console.log('Listening on port 3000');
});