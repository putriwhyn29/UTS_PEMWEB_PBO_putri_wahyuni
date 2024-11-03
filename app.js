const express = require('express');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./router/auth');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret', 
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    if (!req.session.user && req.path !== '/auth/login' && req.path !== '/auth/register') {
        return res.redirect('/auth/login'); 
    }
    next();
});

app.use('/auth', authRoutes); 

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/auth/profile'); 
    } else {
        return res.redirect('/auth/login'); 
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
