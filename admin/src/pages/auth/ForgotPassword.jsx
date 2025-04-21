import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react'
import { auth } from '../../firebase';
import Swal from 'sweetalert2';

const ForgotPassword = ({ componentrender }) => {
    const [formData, setFormData] = useState({
        email: '',
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const sendpasswordresetmail = (e) => {
        e.preventDefault()
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

        sendPasswordResetEmail(auth, formData.email)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Reset Mail Sent Successfully! Check your mail box',
                    showConfirmButton: true, confirmButtonColor: 'black',
                })

            })

            .catch((error) => {
                const errorCode = error.code;
                Swal.fire({
                    icon: "warning",
                    title: errorCode,
                    showConfirmButton: true, confirmButtonColor: 'black', confirmButtonColor: 'black',
                    timer: 3000
                })
            });
    }


    return (
        <div className='d-flex flex-column justify-content-center vh-100 px-4'>

            <div className='d-flex flex-row justify-content-center'>
                <div className='w-100 max-width-password '>
                    <div className='d-flex flex-row justify-content-between py-2 animate__animated animate__zoomIn'>
                        <label className='mb-2 ps-1 fw-bold animate__animated text-coral animate__zoomIn  '>Forgot Password ?</label>
                        <h5 className='animate__animated animate__zoomIn' onClick={() => componentrender("Login")}><i className="bi bi-x-lg"></i></h5>
                    </div>
                    <form onSubmit={sendpasswordresetmail}>
                        <div className='animate__animated animate__zoomIn'>
                            <div className="input-box">
                                <input
                                    name='email' className="input-field" value={formData.email} onChange={handleChange} placeholder='Enter your Email' type='email' required
                                />
                                <i className="fa fa-user" aria-hidden="true" />

                            </div>
                        </div>
                        <button className='submit w-100 animate__animated animate__zoomIn ' type='submit'>Send Password Reset Link</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword