import React, { useState } from 'react'
import { auth, db } from '../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { get, onValue, ref } from 'firebase/database';
import ReactDOM from 'react-dom';


const Login = ({ componentrender }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      html: `
        <div class="p-5">
          <div class="spinner-border text-dark fw-bold" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `,
      showConfirmButton: false,
      background: 'transparent',
    });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const uid = user.uid;
      const userRef = ref(db, 'users/' + uid);

      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        Swal.fire({
          icon: 'success',
          title: 'Logged in Successfully',
          showConfirmButton: true,
          timer: 3000
        });
        componentrender("Home");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Email or Password is Wrong',
          showConfirmButton: true,
          timer: 3000
        });
        auth.signOut();
        componentrender("Login");
      }
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === 'auth/wrong-password') {
        Swal.fire({
          icon: 'error',
          title: 'Email or Password is Wrong',
          showConfirmButton: true,
          timer: 3000
        });
        componentrender("Login")
      } else if (errorCode === 'auth/invalid-login-credentials') {
        Swal.fire({
          icon: 'error',
          title: 'Email or Password is Wrong',
          showConfirmButton: true,
          timer: 3000
        });
        componentrender("Login")
      }
      else {
        auth.signOut();
        Swal.fire({
          icon: 'error',
          title: 'Email or Password is Wrong',
          showConfirmButton: true,
          timer: 3000
        });
        componentrender("Login")

      }
    }
  };

  return (
    <div className='d-flex flex-column justify-content-center vh-75 pb-lg-4'>
      <div className='d-flex flex-row justify-content-center'>
        <form
          onSubmit={handleSubmit}
        >
          <section className="login-container" id="login">
            <header className="py-0">Login</header>
            <hr className="mx-auto" />
            <div className="input-box pt-3">
              <input
                type="text"
                id="loginUsername"
                className="input-field"
                placeholder="Username or Email"
                onChange={handleChange}
                value={formData.email}
                name='email'
                required
              />
              <i className="fa fa-user" aria-hidden="true" />
              <p className="error-message" id="loginError" />
            </div>
            <div className="input-box">
              <input
                type="password"
                id="loginPassword"
                className="input-field"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
                name='password'
                required
              />
              <i className="fa fa-lock" aria-hidden="true" />
              <p className="error-message" id="passError" />
            </div>

            <div className="text-center pb-2">
              <p className="fw-bold">
                <a onClick={() => componentrender("ForgotPassword")}>Forgot password?</a>
              </p>
            </div>
            <div className="input-box">
              <button type="submit" className="submit">
                Sign In
              </button>
            </div>
            <div className="top">
              <span>
                Don't have an account?
                <a className='fw-bold' onClick={() => componentrender("Register")}>
                  Register
                </a>
              </span>
            </div>
          </section>
        </form>


      </div>


    </div>
  )
}

export default Login