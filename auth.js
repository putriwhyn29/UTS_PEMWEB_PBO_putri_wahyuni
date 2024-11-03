const express = require('express');
const routes = express.routes();
const bcrypt = require('bcryptjs');
const db = require('../config/db'); 

routes.get('/register', (req, res) => {
    res.render('register');
});

routes.post('/register', (req, res) => {
    const { username, email, password } = req.body;
 
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat mendaftar.');
        }
        res.redirect('/auth/login');
    });
});

routes.get('/login', (req, res) => {
    res.render('login');
});

routes.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat login.');
        }

        if (result.length > 0) {
            const user = result[0];

            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = user; 
                res.redirect('/auth/profile'); 
            } else {
                res.send('Password salah');
            }
        } else {
            res.send('Pengguna tidak ditemukan');
        }
    });
});

routes.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/auth/login'); 
    }
});

routes.get('/booking', (req, res) => {
    if (req.session.user) {
        res.render('bookingtiket'); 
    } else {
        res.redirect('/auth/login'); 
    }
});

routes.post('/booking', (req, res) => {
    const { departureStation, arrivalStation, departureDate, passengerCount } = req.body;
    
    req.session.bookingInfo = { departureStation, arrivalStation, departureDate, passengerCount };
    res.redirect('/auth/datadiri'); 
});

routes.get('/datadiri', (req, res) => {
    if (req.session.user) {
        res.render('datadiri'); 
    } else {
        res.redirect('/auth/login'); 
    }
});

routes.post('/datadiri', (req, res) => {
    const { fullName, idNumber, phoneNumber } = req.body;

    const bookingInfo = { ...req.session.bookingInfo, fullName, idNumber, phoneNumber };
    
    req.session.tickets = req.session.tickets || [];
    req.session.tickets.push(bookingInfo);
    res.redirect('/auth/tiketku'); 
});

routes.get('/tiketku', (req, res) => {
    if (req.session.user) {
        const tickets = req.session.tickets || [];
        res.render('tiketku', { tickets }); 
    } else {
        res.redirect('/auth/login'); 
    }
});

routes.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/auth/profile'); 
        }
        res.redirect('/auth/login'); 
    });
});

module.exports = routes;