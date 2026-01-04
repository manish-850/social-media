const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const UserModel = require('./models/user');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/register', async (req, res) => {
    const { name, username, email, password } = req.body;
    const isUser = await UserModel.findOne({ email });
    if (!isUser) {
        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                const user = await UserModel.create({
                    name,
                    username,
                    email,
                    password: hash
                })

                const token = jwt.sign(email, 'shhhhh');
                res.cookie("token", token)
                res.redirect(`/profile/${user._id}`);
            });
        });
    }
    else {
        res.send("Something went wrong");
    }
});

app.get('/login', (req, res) => {
    res.render('login');
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    const user = await UserModel.findOne({email});
    if(!user) res.send("Something went wrong");
    else{
        bcrypt.compare(password, user.password, function (err, result) {
            if(result){
                const token = jwt.sign(email, 'shhhhh');
                res.cookie("token", token)
                res.redirect(`/profile/${user._id}`);
            }
            else{
                res.send("Something went wrong")
            }
        });
    }
})

app.get('/profile/:id', async (req, res) => {
    const user = await UserModel.findOne({ _id: req.params.id })
    res.render("profile", { user })
})

app.get("/logout",(req,res)=>{
    res.cookie("token", "");
    res.send("Successfully loged out");
    res.redirect("/login");
})

app.listen(3000)