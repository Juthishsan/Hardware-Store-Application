import React, { useState } from 'react'
import { auth, db } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth';

import Swal from 'sweetalert2';
import { ref, serverTimestamp, set } from 'firebase/database';




const Register = ({ componentrender, setaddadmin, getproducts }) => {


  const initialFormData = {
    name: '',
    phone: '',
    email: '',
    password: '',
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.table(formData)

  };

  const handleSubmit = async (e) => {
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
        showConfirmButton: true, confirmButtonColor: 'black',
      })
      setaddadmin()
      getproducts()
      setFormData(initialFormData);

    } catch (error) {
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        Swal.fire({
          icon: 'error',
          title: 'Account Already Exists',
          showConfirmButton: true, confirmButtonColor: 'black',
          timer: 1500
        })
      } else if (errorCode === "auth/invalid-email") {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          showConfirmButton: true, confirmButtonColor: 'black',
          timer: 3000
        })
      } else if (errorCode === "auth/operation-not-allowed") {
        Swal.fire({
          icon: 'error',
          title: 'Operation Not Allowed',
          showConfirmButton: true, confirmButtonColor: 'black',
          timer: 1500
        })
      } else if (errorCode === "auth/weak-password") {
        Swal.fire({
          icon: 'warning',
          title: 'Your Password is too Weak',
          showConfirmButton: true, confirmButtonColor: 'black',
          timer: 1500
        })
      }
    }
  };

  return (
    <div className='d-flex flex-column justify-content-center' style={{ height: "80vh" }}>
      <div className='d-flex flex-row justify-content-center'>
        <form
          onSubmit={handleSubmit}
        >
          <section className="register-container" id="register">
            <h4 className='text-center'>Register</h4>

            <p className="error-message" id="registerError" />

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


            <div className="input-box">
              <input
                type="text"
                id="registerEmail"
                className="input-field"
                placeholder="Email"
                name="email"
                onChange={handleChange}
                value={formData.email}
                required
              />

              <i className="fa fa-envelope" aria-hidden="true" />
            </div>
            <div className="input-box">
              <input
                type="password"

                name="password"
                className="input-field"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
                required
              />
              <i className="fa fa-lock" aria-hidden="true" />
            </div>



            <div className="input-box text-center">
              <button type="submit"
                name="submit" className='submit'>
                Add
              </button>
            </div>

          </section>
        </form>
      </div>


    </div>
  )
}

export default Register
