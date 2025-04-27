const  {Router}  = require("express");
const  makeAuthenticatedRequest  = require('./../helpers/AuthReq');

const reportsRouter = Router();

reportsRouter.get('/', async (req, res) => {
    const resultActive = await makeAuthenticatedRequest(req.session.token, 'GET', '/reportagens/status/active');
    const resultFixed = await makeAuthenticatedRequest(req.session.token, 'GET', '/reportagens/status/fixed');
 
    res.render('reports', { 
        title: 'Mapazzz - Reportagens', 
        layout: './layouts/dashboard',
        user: {
            email: req.session.userEmail
        },
        resultsActive: resultActive.reports,
        resultsFixed: resultFixed.reports    
    });
})

module.exports = reportsRouter;