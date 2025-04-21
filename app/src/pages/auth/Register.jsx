import React, { useState } from 'react'
import { auth, db } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';
import { ref, serverTimestamp, set } from 'firebase/database';

const Register = ({ componentrender }) => {

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.table(formData)

  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstname || !formData.lastname || !formData.phone || !formData.email || !formData.password || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      Swal.fire({
        icon: 'error',
        title: 'Please fill in all the fields',
        showConfirmButton: true,
      });
      return;
    }

    const phoneRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;
    const nameRegex = /^[A-Za-z\s]+$/; 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phoneRegex.test(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid phone number',
        text: 'Please enter a valid 10-digit phone number',
        showConfirmButton: true,
      });
      return;
    }

    if (!pincodeRegex.test(formData.pincode)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid pincode',
        text: 'Please enter a valid 6-digit pincode',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(formData.firstname) || !nameRegex.test(formData.lastname)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid name',
        text: 'Please enter a valid name (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(formData.city) || !nameRegex.test(formData.state)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid city or state',
        text: 'Please enter a valid city or state name (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(formData.address)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Address',
        text: 'Please enter a valid address (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid email',
        text: 'Please enter a valid email address',
        showConfirmButton: true,
      });
      return;
    }

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
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        accountcreatedat: serverTimestamp(),
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      }


      await set(ref(db, 'users/' + user.uid), {
        profile
      });

      Swal.fire({
        icon: 'success',
        title: 'Successfully Registered',
        showConfirmButton: true, confirmButtonColor: 'black',
      })

      setTimeout(() => {
        Swal.close();
      }, 3000);

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
    <div className='d-flex flex-column justify-content-center vh-75 pb-lg-4'>
      <div className='d-flex flex-row justify-content-center '>
        <form
          onSubmit={handleSubmit}
        >
          <section className="register-container" id="register">
            <header className="py-0">Register</header>
            <hr className="mx-auto" />
            {/* <p className="error-message" id="registerError" /> */}
            <div className="two-forms">
              <div className="input-box">
                <input
                  type="text"
                  id="registerFirstName"
                  className="input-field"
                  placeholder="Firstname"
                  name="firstname"
                  onChange={handleChange}
                  value={formData.firstname}
                  // pattern="[A-Za-z]+"
                  title="Only alphabetical characters are allowed"
                  
                />
                <i className="fa fa-user" aria-hidden="true" />
              </div>
              <div className="input-box">
                <input
                  type="text"
                  id="registerLastName"
                  className="input-field"
                  placeholder="Lastname"
                  name="lastname"
                  onChange={handleChange}
                  value={formData.lastname}
                  // pattern="[A-Za-z\s]+"
                  title="Only alphabetical characters are allowed"
                  
                />
                <i className="fa fa-user" aria-hidden="true" />
              </div>
            </div>

            <div className="two-forms">
              <div className="input-box">
                <input
                  type="text"
                  id="registerEmail"
                  className="input-field"
                  placeholder="Email"
                  name="email"
                  onChange={handleChange}
                  value={formData.email}
                  
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
                  
                />
                <i className="fa fa-lock" aria-hidden="true" />
              </div>
            </div>

            <div className="two-forms">
              <div className="input-box">
                <input
                  type="tel"
                  name="phone"
                  className="input-field"
                  placeholder="Mobile No"
                  value={formData.phone}
                  onChange={handleChange}
                  // pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                  
                />
                <i className="fa fa-phone" aria-hidden="true" />
              </div>

              <div className="input-box">
                <input
                  type="number"
                  id="pincode"
                  className="input-field"
                  placeholder="Pincode"
                  name="pincode"
                  onChange={handleChange}
                  value={formData.pincode}
                  
                />
                <i className="fa fa-location" aria-hidden="true" />
              </div>
            </div>
            <div className="two-forms">
              <div className="input-box">
                <input
                  type="text"
                  id="city"
                  className="input-field"
                  placeholder="City"
                  name="city"
                  onChange={handleChange}
                  value={formData.city}
                  
                />
                <i className="fa fa-location" aria-hidden="true" />
              </div>
              <div className="input-box">
                <input
                  type="text"
                  id="state"
                  className="input-field"
                  placeholder="State"
                  name="state"
                  onChange={handleChange}
                  value={formData.state}
                  
                />
                <i className="fa fa-location" aria-hidden="true" />
              </div>
            </div>

            <div className="input-box" >
              <input
                type="text"
                id="address"
                className="input-field"
                placeholder="Address"
                name="address"
                onChange={handleChange}
                value={formData.address}
                
              />
              <i className="fa fa-location" aria-hidden="true" />
            </div>

            <div className="input-box">
              <button type="submit"
                name="submit" className='submit'>
                Register
              </button>

            </div>

            <div className="top">
              <span>
                Have an account?{" "}
                <a onClick={() => componentrender("Login")} className='fw-bold'>
                  Login
                </a>
              </span>
            </div>

          </section>
        </form>



      </div>


    </div>
  )
}

export default Register