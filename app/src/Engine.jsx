import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { get, onValue, ref } from 'firebase/database';



import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Account from './pages/Account'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Cart from './pages/Cart'
import Products from './pages/Products'
import ForgotPassword from './pages/auth/ForgotPassword'





const Engine = () => {


    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to the top of the page
    })


    const [loggedindetails, setloggedindetails] = useState(null);
    const [loggedinuid, setloggedinuid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                setloggedinuid(uid)

                // Reference to the user's data within the Realtime Database
                const userRef = ref(db, 'users/' + uid);

                // Check if the user data exists in the Realtime Database
                get(userRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            setloggedinuid(uid);
                            const userData = snapshot.val();
                            console.log()
                            setloggedindetails(userData);
                            setcomponent("Home");
                           
                        } else {
                            setloggedindetails(null);
                            setcomponent("Home");
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching Realtime Database data:', error);
                    });
            } else {
                setloggedindetails(null);
                setcomponent("Home");
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);




    const [component, setcomponent] = useState("Home")

    const render = () => {
        switch (component) {
            case "Home":
                return <Home fitcomponent={fitcomponent} />;
            case "About":
                return <About />;
            case "Contact":
                return <Contact />;
            case "Products":
                return <Products productref={currentproduct}  setcurrentproduct={setcurrentproduct} />;
            case "Account":
                return <Account />;
            case "Login":
                return <Login componentrender={componentrender} />;
            case "Register":
                return <Register componentrender={componentrender} />;
            case "Cart":
                return <Cart componentrender={componentrender} userData={loggedindetails}/>;
            case "ForgotPassword":
                return <ForgotPassword componentrender={componentrender} />;
        }

    };


    const [currentproduct, setcurrentproduct] = useState("Wires")

    const fitcomponent = (value1, value2) => {
        setcomponent(value1)
        setcurrentproduct(value2)

    }

    const componentrender = (componentName) => {
        setcomponent(componentName);
    }
    return (
        <div className='d-flex flex-column vh-100'>

            <Navbar componentrender={componentrender} component={component} userData={loggedindetails} />
            <div style={{ paddingTop: "100px" }}>
                {render()}
            </div>
            <Footer />
        </div>
    )
}

export default Engine