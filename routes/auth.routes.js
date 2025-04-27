const { Router } = require('express');
const { signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { auth } = require('../config/firebase-config');
const authRouter = Router();
const  makeAuthenticatedRequest  = require('./../helpers/AuthReq');

authRouter.get('/', (req, res) => {
    res.redirect('/login');
})

authRouter.get('/login', (req, res) => {
    res.render('login', { 
        title: 'MapaZZZ - Login',
        error: req.flash('error')
    })
})

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user =  userCredential.user;
        
        const token = await user.getIdToken();
        const userId = user.uid;


        req.session.userId = userId;
        req.session.token = token;
        req.session.userEmail = email;
        req.session.pass = password;

        const userData = await makeAuthenticatedRequest(req.session.token, 'GET', `/usuarios/${req.session.userId}`);
        const role = userData.userData[0].role;
        
       /* if(!role || role !== 'admin')
        {
            req.flash('error', "Acesso negado!");
            res.redirect('/login');
        }*/

        res.redirect('/home');
    } catch (error) {
        let errorMessage = 'Email ou senha inválidos';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'User not found';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email format';
        }
        
        req.flash('error', errorMessage);
        res.redirect('/login'); 
    }
})

authRouter.get('/logout', async (req, res) => {
    try {
        await signOut(auth);
        req.session.destroy();
        res.redirect('/login');
    } catch (error) {
        res.redirect('/home');
    }
});

authRouter.get('/recuperar', (req, res) => {
    res.render('forget', { 
        title: 'MapaZZZ - Recuperar senha',
        error: req.flash('error')
    })
})

module.exports = authRouter;
