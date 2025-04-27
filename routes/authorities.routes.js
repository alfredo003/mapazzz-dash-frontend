const express = require('express');
const authoritiesRoutes = express.Router();
const makeAuthenticatedRequest  = require('../helpers/AuthReq');
const { getInstitutionIcon, formatInstitutionType } = require('../helpers/viewHelpers');
const { auth } = require('../config/firebase-config');
const { createUserWithEmailAndPassword, sendEmailVerification } = require('firebase/auth');


authoritiesRoutes.get('/', async (req, res) => {
    try { 
        const response = await makeAuthenticatedRequest(req.session.token, 'GET', '/autoridades');
        const institutions = response.authorities;
        
        res.render('authorities', { 
            title: 'MapaZZZ - Instituições', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            institutions: institutions,
            getInstitutionIcon,
            formatInstitutionType,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error fetching institutions:', error);
     
        res.render('authorities', { 
            title: 'Instituições', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            institutions: [],
            getInstitutionIcon,
            formatInstitutionType,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    }
 }); 
 
authoritiesRoutes.post('/', async (req, res) => {
     try {
         const { name,email, type, address, contact } = req.body;

        const password = '123456';
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const actionCodeSettings = {
            url: 'https://burger-order-screen.vercel.app/',
            handleCodeInApp: false
          };

         await sendEmailVerification(user, actionCodeSettings);

         const authorityData = { name, email, type, address, contact,uid:user.uid };
         await makeAuthenticatedRequest(req.session.token, 'POST', '/autoridades', authorityData);

       

         req.flash('success', 'Instituição cadastrada com sucesso!');
         res.redirect('/instituicoes');
     } catch (error) {
         console.error('Error creating institution:', error);
         req.flash('error', 'Erro ao cadastrar instituição. Por favor, verifique o formulário.');
         res.redirect('/instituicoes');
     }
 });

authoritiesRoutes.post('/delete', async (req, res) => {
    try {
        const authorityId  = req.body.authorityId;
       await makeAuthenticatedRequest(req.session.token, 'DELETE', `/autoridades/${authorityId}`);
       req.flash('success', 'Instituição excluída com sucesso!');
      res.redirect('/instituicoes');
    } catch (error) {
        console.error('Error deleting Instituição:', error);
        req.flash('error', 'Erro ao excluir a Instituição. Por favor, tente novamente.');
        res.redirect('/instituicoes');
    }
});

 module.exports = authoritiesRoutes;
