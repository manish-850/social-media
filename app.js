const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const UserModel = require('./models/user');
const postModel = require('./models/post');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { decode } = require('punycode');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, 'shhhhh', function (err, decoded) {
            if (!err) {
                const { email, userid } = decoded;
                res.redirect(`/profile/${userid}`)
            }
        });
    }
    else res.render('index');
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

                const token = jwt.sign({email,userid:user._id}, 'shhhhh');
                res.cookie("token", token)
                res.redirect(`/profile/${user._id}`);
            });
        });
    }
    else {
        res.send("Something went wrong");
    }
});

app.get('/login',(req, res) => {

    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, 'shhhhh', function (err, decoded) {
            if (!err) {
                const {email,userid} = decoded;
                res.redirect(`/profile/${userid}`)
            }
        });
    }

    else res.render('login');
})

app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    const user = await UserModel.findOne({email});
    if(!user) return res.send("Something went wrong");
    else{
        bcrypt.compare(password, user.password, function (err, result) {
            if(result){
                const token = jwt.sign({ email, userid: user._id }, 'shhhhh');
                res.cookie("token", token)
                res.redirect(`/profile/${user._id}`);
            }
            else{
                res.send("Something went wrong")
            }
        });
    }
})

app.get('/profile', isLoggedIn, async (req, res) => {
    res.redirect(`/profile/${req.user.userid}`)
})

app.get('/profile/:id', isLoggedIn, async (req, res) => {
    const user = await UserModel.findOne({ _id: req.params.id })
    const posts = await postModel
        .find()
        .populate("user"); 
    const users = await UserModel.find({
        _id: { $ne: req.user.userid }
    });    
    res.render("profile", { user, posts,users });
})
app.post('/profile/:id/post', isLoggedIn, async (req, res) => {
    const post = await postModel.create({
        body: req.body.postBody,
        user: req.user.userid
    })
    const user = await UserModel.findOne({ _id: req.params.id })
    user.post.push(post._id);
    await user.save(); 
    res.redirect(`/profile/${user._id}`)   
})
app.get("/logout", isLoggedIn,(req,res)=>{
    res.clearCookie("token");
    res.redirect("/login");
})

app.get("/like/:postId", isLoggedIn, async (req,res)=>{
    const post = await postModel.findById(req.params.postId);
    if (!post.likes.includes(req.user.userid)) {
        post.likes.push(req.user.userid);
    }
    await post.save()
    res.redirect(`/profile/${req.user.userid}`)
})


function isLoggedIn(req,res,next){
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");

    jwt.verify(token, 'shhhhh', (err, decoded) => {
        if (err) return res.redirect("/login");

        if (!decoded.userid) {
            res.clearCookie("token");
            return res.redirect("/login");
        }

        req.user = decoded;
        next();
    });
}



app.listen(3000)