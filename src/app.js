require('dotenv').config()
const express = require('express')
const app = express()
const path =require('path')
const hbs = require('hbs')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')

// const securePassword = async (password) => {
//     const hashPassword = await bcrypt.hash(password,10);
//     // console.log(hashPassword);
//     return hashPassword
//     // const passwordHash = await bcrypt.compare('darshans',hashPassword);
//     // console.log(passwordHash);
// }


// $2a$10$k9X/TZzqIZY41/49HTkF0O61KzxeYzhnJzQvUnXChywtg6PemOwM2
const PORT = process.env.PORT || 3000;
require('./db/conn')
const Register = require('./models/registers')

const static_path = path.join(__dirname,"../public")
const template_path = path.join(__dirname,"../templates/views")
const partials_path = path.join(__dirname,"../templates/partials")
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))
app.set("view engine", "hbs")
app.set('views',template_path)
app.use(express.static(static_path))
hbs.registerPartials(partials_path)

app.get('/',(req,res)=>{
    res.render("index");    
})
app.get('/secret',auth,(req,res)=>{
    console.log(`${req.cookies.jwt} cokkie sajkdhagd `);
    res.render("secret");    
})
app.get('/login',(req,res)=>{
    res.render("login");    
})
app.get('/logout',auth,async(req,res)=>{
    try{
        console.log(req.user);
        req.user.tokens = req.user.tokens.filter((currentElement)=>{
            console.log("REQ_CURRENTEMLEMNT"+currentElement.token)
            console.log("REQ_TOKEN"+req.token)
            return currentElement.token != req.token
        })
        res.clearCookie('jwt')
        console.log('logout ');
        await req.user.save(); 
        res.render('login')
    }catch(error){
        res.status(500).send(error);
    }
})
app.get('/register',(req,res)=>{
    res.render("register");    
})

app.post('/register',async(req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(cpassword === password){
            const registerEployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone_number : req.body.phone_number,
                age : req.body.age,
                password : password,
                confirmpassword : cpassword,
            })
            const token = await registerEployee.generateToken();
            res.cookie('jwt',token,{
                expires:new Date(Date.now()+500000),
                httpOnly:true,
            })
            const register = await registerEployee.save();
            res.status(200).render('index')

        }else{
            res.send("password are not matching")
        }
    }catch(error){
        res.status(400).send(error);
    }
})

app.post('/login',async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const username = await Register.findOne({email:email});
        if(username){
            console.log(password,username.password);
            const isMatch = await bcrypt.compare(password,username.password)
            const token = await username.generateToken();
            res.cookie('jwt',token,{
                expires:new Date(Date.now()+3000),
                httpOnly:true,
                // secure:true
            })
            if(isMatch){   
                res.status(200).render('index')
            }else{
                res.send("invalid password and username")
            }
        }else{
            res.send("invalid  username")
        }
       
    }catch(e){
        res.status(400).send('error');
    }
})

// const jwt = require('jsonwebtoken')
// const createToken = async() =>{
//     const token = await jwt.sign({_id:"62067ec8a660b734309c7fd4"},"qgdhgjfsdgsfdjfskjhkjhsfdhhfdkshkhjhsdfkhkjhsdfkhkjdshfkhsdfhksdhkhggdfj",{
//         expiresIn:"2 seconds"
//     })
//     const userVer = await jwt.verify(token,"qgdhgjfsdgsfdjfskjhkjhsfdhhfdkshkhjhsdfkhkjhsdfkhkjdshfkhsdfhksdhkhggdfj",)
// }

// createToken();

app.listen(PORT,()=>{
    console.log(`serever runnig port on ${PORT}`)
})  