const  {Router}  = require("express");
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const storage = multer.memoryStorage();
const makeAuthenticatedRequest = require('../helpers/AuthReq');
const { getInstitutionIcon, formatInstitutionType } = require('../helpers/viewHelpers')

const upload = multer({ storage: storage });
const blogsRouter = Router();

blogsRouter.get('/', async(req, res) => {
    try {
        const response = await makeAuthenticatedRequest(req.session.token, 'GET', '/blog');
        
        const blogs = response.blogs;

    res.render('blog', { 
        title: 'MapaZZZ - Blogs', 
        layout: './layouts/dashboard',
        user: {
            email: req.session.userEmail
        },
        blogs: blogs,
        getInstitutionIcon,
        formatInstitutionType,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
    });

    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.render('blog', { 
            title: 'MapaZZZ - Blogs', 
            layout: './layouts/dashboard',
            blogs: [],
            getInstitutionIcon,
            formatInstitutionType,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    }
}); 

blogsRouter.post('/', upload.single('file'),async (req, res) => {
    try {
        const { title, content } = req.body;

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

        const blogData = { title, content, imageUrl: photoUrl };
        await makeAuthenticatedRequest(req.session.token, 'POST', '/blog', blogData);

        const notf_message = `Novo blog adicionado`;
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
        
        req.flash('success', 'Conteudo adicionado com sucesso!');
        res.redirect('/blog');
    } catch (error) {
        console.error('Error creating blog:', error);
        req.flash('error', 'Erro ao adicionar conteudo. Por favor, verifique o formulário.');
        res.redirect('/blog');
    }
})

blogsRouter.post('/update', upload.single('file'), async (req, res) => {
    try {
        const { blogId, title, content } = req.body;

        if (!blogId) {
            req.flash('error', 'ID do blog não fornecido');
            return res.redirect('/blog');
        }

        let updateData = {
            title,
            content,
            imageUrl: req.body.currentImageUrl // Keep existing image if no new one uploaded
        };

        if (req.file) {
            const formData = new FormData();
            formData.append('image', req.file.buffer, req.file.originalname);

            const imageResponse = await axios.post('https://burger-image-api.vercel.app/upload', formData, {
                headers: formData.getHeaders(),
            });

            updateData.imageUrl = imageResponse.data.imageUrl;
        }

        await makeAuthenticatedRequest(req.session.token, 'PUT', `/blog/${blogId}`, updateData);
    
        req.flash('success', 'Blog atualizado com sucesso!');
        res.redirect('/blog');
    } catch (error) {
        console.error('Error updating blog:', error);
        req.flash('error', 'Erro ao atualizar o blog. Por favor, tente novamente.');
        res.redirect('/blog');
    }
});

blogsRouter.post('/delete', async (req, res) => {
    try {
        const blogId  = req.body.blogId;
       await makeAuthenticatedRequest(req.session.token, 'DELETE', `/blog/${blogId}`);
       req.flash('success', 'Blog excluído com sucesso!');
      res.redirect('/blog');
    } catch (error) {
        console.error('Error deleting blog:', error);
        req.flash('error', 'Erro ao excluir o blog. Por favor, tente novamente.');
        res.redirect('/blog');
    }
});


module.exports = blogsRouter;