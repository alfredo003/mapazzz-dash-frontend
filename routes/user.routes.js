const express = require('express');
const makeAuthenticatedRequest  = require('../helpers/AuthReq');
const { auth } = require('../config/firebase-config');
const { createUserWithEmailAndPassword, sendEmailVerification } = require('firebase/auth');
const userRoutes = express.Router();

userRoutes.get('/', async(req, res) => {
    try {
        const response = await makeAuthenticatedRequest(req.session.token, 'GET', '/usuarios');
        const users = response.users;
       

        res.render('users', { 
            title: 'MapaZZZ - Configurações', 
            layout: './layouts/dashboard',
            users: users,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error fetching institutions:', error);
     
        res.render('users', { 
            title: 'MapaZZZ - Configurações', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            users: [],
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    }

}); 
 


userRoutes.get('/register', (req, res) => {

    res.render('register_user', { 
        title: 'Mapazzz - Registrar Utilizador', 
        layout: './layouts/dashboard',
        user: {
            email: req.session.userEmail
        },
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });
});

userRoutes.post('/register', async(req, res) => {

    try {
        const { name, email, phoneNumber,role} = req.body;

        const password = '123456';
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const actionCodeSettings = {
            url: 'https://mapazzz-dash-frontend.onrender.com/login',
            handleCodeInApp: false
          };

         await sendEmailVerification(user, actionCodeSettings);


        const authorityData = { name, email, phoneNumber, password, role, uid: user.uid };
        await makeAuthenticatedRequest(req.session.token, 'POST', '/usuarios', authorityData);
         
        req.flash('success', 'Utilizador cadastrado com sucesso!');
        res.redirect('/users/register');
    } catch (error) {
        console.error('Error creating Utilizador:', error);
        req.flash('error', 'Erro ao cadastrar Utilizador. Por favor, verifique o formulário.');
        res.redirect('/users/register');
    }
});

module.exports = userRoutes;
