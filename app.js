require('dotenv').config();
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session');
const flash = require('connect-flash')
const { authenticateUser } = require('./middleware/auth')
const path = require('path');
const router = require('./routes/index');
const makeAuthenticatedRequest = require('./helpers/AuthReq');
const MongoStore = require('connect-mongo');
const app = express()
const port = 2001
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 


app.use(session({
    secret: process.env.SESSION_SECRET || 'default',
    resave: false,
    saveUninitialized: true,
    rolling: true, // Tenta manter viva a sessão
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        touchAfter: 24 * 3600 
    }),
    cookie: {
        secure: true, // só envia cookie via HTTPS
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 dia
    }
}));
app.set('trust proxy', 1);
app.use(express.json())
app.use(flash())

app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts)
app.set('layout', path.join(__dirname, 'views', 'layouts', 'full-width'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use((err, req, res, next) => {
    if (err.message === 'Unable to find the session to touch') {
      console.warn('Aviso: Sessão não encontrada para atualizar (não é crítico).');
      return next(); // Ignora e continua normalmente
    }
    next(err); // Outros erros realmente importantes passam
  });

app.get('/redifinir', authenticateUser, (req, res) => {

    res.render('redif_password', { 
        title: 'Mapazzz - Olá! Bem-Vindo', 
        layout: './layouts/full-width',
        user: {
            email: req.session.userEmail
        },
        error: req.flash('error')
    });
});

app.post('/redifinir', authenticateUser, async (req, res) => {
    const {newPassword,confirmpassword} = req.body;
    if(newPassword !== confirmpassword)
    {
        req.flash('error', "Verifica as Passes!");
        res.redirect('/redifinir');
    }

    try{
        const uid = req.session.userId;
        const data = {newPassword,uid}
        const userData = await makeAuthenticatedRequest(req.session.token,
            'POST', 
            '/usuarios/newpass',
        data
        );
        //req.session.pass = newPassword;
        req.flash('error', "Entra com a nova senha");
        return res.redirect('/login');
    }catch(error)
    {
        req.flash('error', "Erro ao Redifinir a senha!");
        return res.redirect('/redifinir');
    }
    
   
});

app.get('/home', authenticateUser, async (req, res) => {
    try {
        const response = await makeAuthenticatedRequest(req.session.token, 'GET', '/estatisticas');
        const statics = response.statistics;
        
        const result = await makeAuthenticatedRequest(req.session.token, 'GET', '/reportagens');
        const reports = result.reports;

        const pass = req.session.pass;
      
        if(pass === '123456')
        {
            return res.redirect('/redifinir');
        }


        res.render('home', { 
            title: 'Mapazzz - Painel de Controle', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            statics: statics,
            reports: reports
        });
    } catch (error) {
     
        res.render('home', { 
            title: 'Mapazzz - Painel de Controle', 
            layout: './layouts/dashboard',
            user: {
                email: req.session.userEmail
            },
            statics: [],
            reports: []
        });
    }
  
})

app.get('/perfil',authenticateUser, (req, res) => {

    res.render('profile', { 
        title: 'Mapazzz - Perfil', 
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

app.get('/mynotify',authenticateUser, (req, res) => {

    res.render('my_notify', { 
        title: 'Mapazzz - Perfil', 
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



app.use('/', router);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})