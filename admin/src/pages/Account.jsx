import React, { useState, useEffect } from 'react';
import { EmailAuthProvider, deleteUser, onAuthStateChanged, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { ref, onValue, set, remove } from 'firebase/database';
import { auth, db } from '../firebase';
import Swal from 'sweetalert2';

const Account = () => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteAccount = () => {
    const user = auth.currentUser;
    if (user) {
      // Show a reauthentication prompt
      Swal.fire({
        title: 'Reauthentication Required',
        text: 'To delete your account, please reauthenticate by entering your current password.',
        input: 'password', // Input field for the user's current password
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: 'black',
        cancelButtonText: 'Cancel',
        cancelButtonColor: 'red',
        inputValidator: (value) => {
          if (!value) {
            return 'Password is required';
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            html: `
                          <div className="p-5" >
                            <div className="spinner-border text-dark" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        `,
            showConfirmButton: false,
            background: 'transparent',
          });
          const credential = EmailAuthProvider.credential(user.email, result.value);
          reauthenticateWithCredential(user, credential)
            .then(() => {

              deleteUser(user)
                .then(async () => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Account Deletion Successfull',
                    showConfirmButton: true,
                    confirmButtonColor: 'black',
                    timer: 1000
                  })
                  const uid = user.uid;
                  const userRef = ref(db, 'admins/' + uid);

                  await remove(userRef);
                  window.location.reload();
                })
                .catch((error) => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error Deleting Account',
                    showConfirmButton: true,
                    confirmButtonColor: 'black',
                    timer: 1000
                  })
                });
            })
            .catch((reauthError) => {
              Swal.fire({
                icon: 'error',
                title: 'Reauthentication failed:',
                showConfirmButton: true,
                confirmButtonColor: 'black',
                timer: 1000
              })
              console.error('Reauthentication failed:', reauthError);
            });
        }
      });
    }
  };


  const handleResetPassword = () => {
    const user = auth.currentUser;
    if (user) {
      // Show a password reset prompt
      Swal.fire({
        title: 'Reset Password',
        text: 'To reset your password, please enter your email address.',
        input: 'email', // Input field for the user's email
        inputAttributes: {
          autocapitalize: 'none',
          autocorrect: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'Reset Password',
        confirmButtonColor: 'black',
        cancelButtonText: 'Cancel',
        cancelButtonColor: 'red',
        inputValidator: (value) => {
          if (!value) {
            return 'Email address is required';
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            html: `
                          <div className="p-5" >
                            <div className="spinner-border text-dark" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        `,
            showConfirmButton: false,
            background: 'transparent',
          });
          const emailAddress = result.value;
          sendPasswordResetEmail(auth, emailAddress)
            .then(() => {
              Swal.fire({
                icon: 'success',
                title: 'Password Reset Email Sent',
                text: `An email with instructions to reset your password has been sent to ${emailAddress}.`,
                timer: 1000,
              });
            })
            .catch((error) => {
              console.error('Error sending password reset email:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while sending the password reset email. Please try again.',
              });
            });
        }
      });
    }
  };


  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const userinforef = ref(db, 'admins/' + uid + '/profile');
        onValue(userinforef, (snapshot) => {
          const data = snapshot.val();
          setUserDetails(data || { name: '', phone: '' });
        });
      } else {
        setUserDetails({ name: '', phone: '' });
      }
    });
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };


  const handleSaveClick = () => {
    Swal.fire({
      html: `
              <div className="p-5" >
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            `,
      showConfirmButton: false,
      background: 'transparent',
    });
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid;
      const userinforef = ref(db, 'admins/' + uid + '/profile');
      set(userinforef, userDetails); // Update the data in the database
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated Successfully',
        showConfirmButton: true,
        confirmButtonColor: 'black',
        timer: 1000
      })
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);

  };

  return (<div className=' px-2 pb-lg-5 pb-3'>
    <div className=''>


      <h1 className='text-center text-coral d-lg-none d-block ps-3 pb-3'>Profile</h1>
      <div className='container border rounded-3 p-2'>


        {isEditing ? (
          <div>

            <div className='d-flex flex-row justify-content-between mb-3'>
              <h5 className='animate__animated text-coral animate__fadeIn ps-3 aria-controls="navbar"'><span className='d-lg-block d-none fw-bold'>Profile</span></h5>
              <div className='d-flex me-4'>
                <div className='me-2'>
                  <button onClick={handleSaveClick} className=' submit w-100'>Save</button>
                </div>

                <div>
                  <button onClick={handleCancelClick} className=' submit w-100'>Cancel</button>
                </div>

              </div>
            </div>
            <div>
            </div>
            <div className='row px-3'>
              <div className='col-md-6'>
                <label className='fw-bold animate__animated animate__fadeIn  aria-expanded="false" data-bs-target="#navbar" aria-controls="navbar"'> Name:</label>
                <input
                  type="text"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                  className='animate__animated animate__fadeIn form-control'
                />
                <br />
              </div>


              <div className='col-md-6'>
                <label className='fw-bold animate__fadeIn  aria-expanded="false" data-bs-target="#navbar" aria-controls="navbar"'>Phone:</label>
                <input
                  type="text"
                  value={userDetails.phone}
                  onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                  className='animate__animated animate__fadeIn form-control'
                />
                <br />
              </div>
            </div>


          </div>
        ) : (
          <div>
            <div className='d-flex flex-row justify-content-between mb-3 px-3'>
              <h5 className='animate__animated text-coral animate__fadeIn'><span className='d-lg-block d-none fw-bold'>Profile</span></h5>
              <div>
                <button onClick={handleEditClick} className='animate__animated animate__fadeIn submit aria-expanded="false" data-bs-target="#navbar" aria-controls="navbar" w-100'>Edit</button>
              </div>
            </div>

            <div className='row px-3'>
              <div className='col-md-6'>
                <p className='animate__animated animate__fadeIn'><span className=' fw-bold  aria-expanded="false" data-bs-target="#navbar" aria-controls="navbar"'>Name:
                </span>  &nbsp; <br />{userDetails.name}</p>
              </div>
              <div className='col-md-6'>
                <p className='animate__animated animate__fadeIn'><span className=' fw-bold  aria-expanded="false" data-bs-target="#navbar" aria-controls="navbar"'>Phone:
                </span> <br /> {userDetails.phone}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className='d-flex flex-lg-row flex-column justify-content-between px-3'>
          <div className='py-2'>
            <button onClick={handleDeleteAccount} className='animate__animated animate__fadeIn w-100'>Delete Account</button>
          </div>
          <div className='py-2'>
            <button onClick={handleResetPassword} className='animate__animated animate__fadeIn w-100'>Change Password</button>
          </div>
        </div>
      </div>

    </div>



  </div>

  );
};

export default Account;
