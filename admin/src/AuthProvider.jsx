import React, { useEffect, useState } from 'react'


import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { get, onValue, ref } from 'firebase/database';
import Login from './pages/auth/Login';
import Engine from './Engine';
import ForgotPassword from './pages/auth/ForgotPassword';
import Swal from 'sweetalert2';


const AuthProvider = () => {
    const [loggedindetails, setloggedindetails] = useState(null);
    const [loggedinuid, setloggedinuid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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
                timer: 3000
            });
            if (user) {

                const uid = user.uid;
                const userRef = ref(db, 'admins/' + uid);


                get(userRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            setloggedinuid(uid);
                            const userData = snapshot.val();

                            setloggedindetails(userData);
                            setcomponent("Engine");

                        } else {
                            setloggedindetails(null);
                            setcomponent("Login");
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching Realtime Database data:', error);
                    });
            } else {
                setloggedindetails(null);
                setcomponent("Login");
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);




    const [component, setcomponent] = useState("Login")

    const render = () => {
        switch (component) {
            case "Login":
                return <Login componentrender={componentrender} />;
            case "Engine":
                return <Engine />;
            case "ForgotPassword":
                return <ForgotPassword componentrender={componentrender} />;

        }

    };


    const [currentproduct, setcurrentproduct] = useState("Interior")

    const fitcomponent = (value1, value2) => {
        setcomponent(value1)
        setcurrentproduct(value2)
    }




    const componentrender = (componentName) => {
        setcomponent(componentName);
    }


    return (
        <div className=''>

            <div></div>
            <div>
                {render()}
            </div>
            <div>

            </div>
        </div>
    )
}

export default AuthProvider