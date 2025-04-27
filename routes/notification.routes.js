const express = require('express');
const makeAuthenticatedRequest  = require('../helpers/AuthReq');
const notificationRoutes = express.Router();


notificationRoutes.get('/', async(req, res) => {

    try {
        const response = await makeAuthenticatedRequest(req.session.token, 'GET', '/notificacoes');
        const notifications = response;

        res.render('notifications', { 
            title: 'Mapazzz - Notificações', 
            layout: './layouts/dashboard',
            user: {
            email: req.session.userEmail 
        },
        notifications:notifications,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
        
    }); 
    } catch (error) {
         res.render('notifications', { 
            title: 'Instituições', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            notifications: [],
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    }
});

notificationRoutes.post('/', async (req, res) => {
    try {
        const userId = "1" ;
        const { title,message } = req.body;

     const restut1 = await makeAuthenticatedRequest(req.session.token, 'GET', '/notificacoes/fcm');
     const tokens = restut1[0].token;
 
     const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
       for (const token of tokens) {
        try {
            console.log(token);
            const Data = { title,message, token,userId }
            const restut = await makeAuthenticatedRequest(req.session.token, 'POST', '/notificacoes/send', Data);
          console.log(`Enviado com sucesso: ${restut}`);
        } catch (error) {
          console.error(`Erro ao enviar o token ${token}:`, error.message);
        }
        await delay(1000);
      }
      const registerData = { title,message,userId }
      const restut = await makeAuthenticatedRequest(req.session.token, 'POST', '/notificacoes', registerData);

        req.flash('success', 'Notificações enviadas com sucesso!');
        res.redirect('/notificacoes');
    } catch (error) {
        console.error('Error creating institution:', error);
        req.flash('error', 'Erro ao cadastrar instituição. Por favor, verifique o formulário.');
        res.redirect('/notificacoes');
    }
});
module.exports = notificationRoutes;
