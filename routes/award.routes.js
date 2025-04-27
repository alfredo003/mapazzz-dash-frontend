const  {Router}  = require("express");
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const storage = multer.memoryStorage();
const makeAuthenticatedRequest = require('../helpers/AuthReq');

const upload = multer({ storage: storage });
const awardRouter = Router();
 
awardRouter.get('/', async (req, res) => {
    
    try {
        const result = await makeAuthenticatedRequest(req.session.token, 'GET', '/recompensas');
    
         const awards = result.awards;

        res.render('award', { 
            title: 'Mapazzz - Premiações', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            },
            awards: awards
        });
    } catch (error) {
       
        res.render('award', { 
            title: 'Mapazzz - Premiações', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            awards: [],
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    }
})

awardRouter.post('/', upload.single('file'), async (req, res) => {
    try {

        const { title,points } = req.body;
        
        if (!req.file) {
            req.flash('error', 'Por favor, envie uma imagem.');
            return res.redirect('/premiacoes');
        }

        const formData = new FormData();
        formData.append('image', req.file.buffer, req.file.originalname);

        const imageResponse = await axios.post('https://burger-image-api.vercel.app/upload', formData, {
            headers: formData.getHeaders(),
        });

        const photoUrl = imageResponse.data.imageUrl;
        
        const awardData = {  imageUrl: photoUrl, points, title };
        
        await makeAuthenticatedRequest(req.session.token, 'POST', '/recompensas', awardData);
        
        const notf_message = `Novo Prêmio adicionado`;
        const userId = req.session.userId || "1"; 
        const restut1 = await makeAuthenticatedRequest(req.session.token, 'GET', '/notificacoes/fcm');
        const tokens = restut1[0].token;
    
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          for (const token of tokens) {
           try {
               console.log(token);
               const Data = { notf_message,title, token,userId }
               const restut = await makeAuthenticatedRequest(req.session.token, 'POST', '/notificacoes/send', Data);
             console.log(`Enviado com sucesso: ${restut}`);
           } catch (error) {
             console.error(`Erro ao enviar o token ${token}:`, error.message);
           }
           await delay(1000);
         }
        req.flash('success', 'premiacoes cadastrada com sucesso!');
        res.redirect('/premiacoes');
    } catch (error) {
        console.error('Error creating premiacoes:', error);
        req.flash('error', 'Erro ao cadastrar premiacoes. Por favor, verifique o formulário.');
        res.redirect('/premiacoes');
    }
});

awardRouter.post('/search', async (req, res) => {
    try {

        const  {claimcode} = req.body;
        
        const user = await makeAuthenticatedRequest(req.session.token, 'GET', `/recompensas/search/${claimcode}`);
 
       res.redirect(`/reivindicar/?user=${user.uid}&claimcode=${claimcode}`);
       
    } catch (error) {
        req.flash('error', 'Este codigo não esta disponivel');
        res.redirect('/premiacoes');
    }
});

awardRouter.post('/update', upload.single('file'), async (req, res) => {
    try {
        const { awardId, title, points } = req.body;

        if (!awardId) {
            req.flash('error', 'ID do premiacoes não fornecido');
            return res.redirect('/premiacoes');
        }

        let updateData = {
            title,
            points,
            imageUrl: req.body.currentImageUrl
        };

        if (req.file) {
            const formData = new FormData();
            formData.append('image', req.file.buffer, req.file.originalname);

            const imageResponse = await axios.post('https://burger-image-api.vercel.app/upload', formData, {
                headers: formData.getHeaders(),
            });

            updateData.imageUrl = imageResponse.data.imageUrl;
        }

        await makeAuthenticatedRequest(req.session.token, 'PUT', `/recompensas/${awardId}`, updateData);
    
        req.flash('success', 'Prêmio atualizado com sucesso!');
        res.redirect('/premiacoes');
    } catch (error) {
        console.error('Error updating Prêmio:', error);
        req.flash('error', 'Erro ao atualizar o Prêmio. Por favor, tente novamente.');
        res.redirect('/premiacoes');
    }
});

awardRouter.post('/delete', async (req, res) => {
    try {
        const awardId  = req.body.awardId;
       await makeAuthenticatedRequest(req.session.token, 'DELETE', `/recompensas/${awardId}`);
       req.flash('success', 'Prêmio excluído com sucesso!');
      res.redirect('/premiacoes');
    } catch (error) {
        console.error('Error deleting Prêmio:', error);
        req.flash('error', 'Erro ao excluir o Prêmio. Por favor, tente novamente.');
        res.redirect('/premiacoes');
    }
});


module.exports = awardRouter;