import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { get, onValue, ref, serverTimestamp, set } from 'firebase/database';
import Register from './Register';

const LoginOrRegister = ({ componentrender }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    isRegistering: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleForm = () => {
    setFormData({ ...formData, isRegistering: !formData.isRegistering });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      html: `
        <div class="p-5">
          <div class="spinner-border text-dark" role="status">
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
      const userRef = ref(db, 'admins/' + uid);

      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        Swal.fire({
          icon: 'success',
          title: 'Logged in Successfully',
          showConfirmButton: true,
          timer: 3000
        });
        componentrender("Engine")
      } else {
        auth.signOut();
        Swal.fire({
          icon: 'error',
          title: 'Email or Password is Wrong',
          showConfirmButton: true,
          timer: 3000
        });
        componentrender("Login")
      }
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-login-credentials') {
        Swal.fire({
          icon: 'error',
          title: 'Email or Password is Wrong',
          showConfirmButton: true,
          timer: 3000
        });
      } else {
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      html: `
        <div class="p-5" >
          <div class="spinner-border text-dark" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `,
      showConfirmButton: false,
      background: 'transparent',
    });

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const profile = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        accountcreatedat: serverTimestamp(),
      }

      set(ref(db, 'admins/' + user.uid), {
        profile
      });

      Swal.fire({
        icon: 'success',
        title: 'Successfully Registered',
        showConfirmButton: true,
        confirmButtonColor: 'black',
      });
    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        Swal.fire({
          icon: 'error',
          title: 'Account Already Exists',
          showConfirmButton: true,
          confirmButtonColor: 'black',
          timer: 1500
        });
      } else if (errorCode === "auth/invalid-email") {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          showConfirmButton: true,
          confirmButtonColor: 'black',
          timer: 3000
        });
      } else if (errorCode === "auth/operation-not-allowed") {
        Swal.fire({
          icon: 'error',
          title: 'Operation Not Allowed',
          showConfirmButton: true,
          confirmButtonColor: 'black',
          timer: 1500
        });
      } else if (errorCode === "auth/weak-password") {
        Swal.fire({
          icon: 'warning',
          title: 'Your Password is too Weak',
          showConfirmButton: true,
          confirmButtonColor: 'black',
          timer: 1500
        });
      }
    }
  };

  return (
    <div className='d-flex flex-column justify-content-center vh-100'>
      <div className='text-center fw-bold'>
      </div>
      {/* <div className="text-center">
        <button onClick={handleToggleForm}>
          {formData.isRegistering ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </div> */}
      <div className='d-flex flex-row justify-content-center my-3'>
        <form onSubmit={formData.isRegistering ? handleRegisterSubmit : handleLoginSubmit}>
          <section className="login-container" id="login">
            <header className="py-0 ">{formData.isRegistering ? 'Register' : 'Admin Login'}</header>
            <hr className="mx-auto" />
            {formData.isRegistering ? (
              <div>
                <div className="input-box">
                  <input
                    type="text"
                    id="registerFirstName"
                    className="input-field"
                    placeholder="Name"
                    name="name"
                    onChange={handleChange}
                    value={formData.name}
                    required
                  />
                  <i className="fa fa-user" aria-hidden="true" />
                </div>
                <div className="input-box">
                  <input
                    type="text"
                    name="phone"
                    className="input-field"
                    placeholder="Mobile No"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  <i className="fa fa-phone" aria-hidden="true" />
                </div>
              </div>
            ) : null}
            <div className="input-box pt-4">
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
            <div className="text-center">
              <p className="fw-bold">
                <a onClick={() => componentrender("ForgotPassword")}>Forgot password?</a>
              </p>
            </div>
            <div className="input-box px-5 text-center">
              <button type="submit" className="submit">
                {formData.isRegistering ? 'Register' : 'Sign In'}
              </button>
            </div>
          </section>
        </form>
      </div>

    </div>
  );
};

export default LoginOrRegister;
