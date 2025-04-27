const firebaseConfig = {
  apiKey: "AIzaSyAX7PCdIpNTZAYXi6viASwt_4qS9znpQYY",
  authDomain: "mapzzz-62a4f.firebaseapp.com",
  projectId: "mapzzz-62a4f",
  storageBucket: "mapzzz-62a4f.firebasestorage.app",
  messagingSenderId: "734479508053",
  appId: "1:734479508053:web:e6bf134dfdb033a95daadc",
  measurementId: "G-07LZMHE6GL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Adicione isso no início do arquivo para debug
firebase.auth().onAuthStateChanged((user) => {
  console.log('Estado da autenticação mudou:', user ? 'Usuário logado' : 'Usuário não logado');
  console.log('Token atual:', localStorage.getItem('authToken'));
});

// Authentication functions
async function loginUser(email, password) {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();
    
    if (token) {
      localStorage.setItem('authToken', token);
      setTimeout(() => {
      window.location.href = 'index.html';
      }, 100);
    } else {
      throw new Error('Token de autenticação inválido');
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Erro ao fazer login: ' + error.message);
  }
}

// Function to check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('authToken');
  const currentPage = window.location.pathname.split('/').pop();
  
  console.log('Checking auth:', { token, currentPage });
  
  if (currentPage === 'login.html' && token) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
    window.location.href = 'index.html';
      } else {
        localStorage.removeItem('authToken');
      }
    });
    return;
  }
  
  if (currentPage !== 'login.html' && !token) {
    window.location.href = 'login.html';
    return;
  }
}


document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            forgotPassword(event);
        });
    }
});

function forgotPassword(event) {
    // Your forgot password logic here
    alert('Funcionalidade de recuperação de senha em desenvolvimento');
} 