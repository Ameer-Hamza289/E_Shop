import './App.css';
import{BrowserRouter, Routes, Route} from 'react-router-dom'
import LoginPage from './pages/Login'
import SignUpPage from './pages/SignUp';
import HomePage from './pages/Home';
import { ToastContainer } from 'react-toast';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/sign-up' element={<SignUpPage/>} />
      </Routes>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
   
  );
}

export default App;
