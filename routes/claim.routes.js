const  express = require("express");
const makeAuthenticatedRequest = require('../helpers/AuthReq');

const claimRouter = express.Router();


claimRouter.post('/', async (req, res) => {

    const {claimcode,user} = req.body;

    try {
        const data = {uid:user,claimcode:claimcode}
        const resultReward = await makeAuthenticatedRequest(req.session.token, 'PATCH', `/usuarios/claim`,data);

        if(resultReward)
        {
            req.flash('success', 'Premio Reivindicado Com sucesso.');
           return res.redirect('/premiacoes');
        }

        req.flash('error', 'Erro ao reivindicar o premio.');
        res.redirect('/premiacoes');

    } catch (error) {
        console.error('Error creating Utilizador:', error);
        req.flash('error', 'Erro ao cadastrar Utilizador. Por favor, verifique o formulário.');
        res.redirect('/register');
    }
   
});


claimRouter.get('/', async (req, res) => {

    const {claimcode,user} = req.query;

    try {
        const result = await makeAuthenticatedRequest(req.session.token, 'GET', `/usuarios/${user}`);
        const users = result.userData[0].data;
        
        const usersData = users.rewards;

       const reaward=  usersData.find((data) => data.claimCode === claimcode)

      const resultReward = await makeAuthenticatedRequest(req.session.token, 'GET', `/recompensas/${reaward.rewardId}`);

        res.render('reaward', { 
            title: 'Mapazzz - Perfil', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            },
            user: users,
            claimcode: claimcode,
            reward:resultReward.awards
        });
    } catch (error) {
        console.error('Error creating Utilizador:', error);
        req.flash('error', 'Erro ao cadastrar Utilizador. Por favor, verifique o formulário.');
        res.redirect('/reivindicar');
    }
   
});


module.exports = claimRouter;