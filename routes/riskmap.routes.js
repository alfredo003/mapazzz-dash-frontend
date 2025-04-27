const express = require('express');
const riskmapRoutes = express.Router();


riskmapRoutes.get('/', async(req, res) => {

    res.render('risk_map', { 
        title: 'Mapazzz - Mapa de Risco', 
        layout: './layouts/dashboard',
        user: {
            email: req.session.userEmail
        }
    });

});

module.exports = riskmapRoutes;
