import React from 'react';
import Swal from 'sweetalert2';
import { auth } from '../firebase';
import 
{BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, 
  BsListCheck, BsMenuButtonWideFill, BsFillGearFill, BsPersonCircle,BsCartFill}
 from 'react-icons/bs'

const Navbar = ({ componentrender, component }) => {
    const logout = async () => {
        Swal.fire({
            html: `
        <div className="p-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      `,
            showConfirmButton: false,
            background: 'transparent',
        });

        try {
            await auth.signOut();
            Swal.fire({
                icon: 'success',
                title: 'Logout Successful',
                showConfirmButton: true,
                confirmButtonColor: '#212529',
            });
        } catch (error) {
            // Handle error
        }
    };

    return (
        <div id="sidebar">
            <div className="d-lg-block d-none">
                <div className="vh-100 d-flex flex-column justify-content-between py-4 pe-3 border-end ps-4 position-fixed">
                    <div className="sidebar-list d-flex flex-column gap-4">
                        <img className="pb-3" src="Images/logo2.png" width="150px" alt="Logo" />
                        <h5 className={` ${component === 'Dashboard' ? 'text-coral' : ''} sidebar-list-item`} onClick={() => componentrender('Dashboard')}>
                        <BsGrid1X2Fill className='icon'/>  Dashboard
                        </h5>
                        <h5 className={` ${component === 'Products' ? 'text-coral' : ''} sidebar-list-item`} onClick={() => componentrender('Products')}>
                        <BsFillArchiveFill className='icon'/>  Products
                        </h5>
                        <h5 className={` ${component === 'Orders' ? 'text-coral' : ''} sidebar-list-item`} onClick={() => componentrender('Orders')}>
                        <BsCartFill className='icon'/>   Orders
                        </h5>
                        <h5 className={` ${component === 'Users' ? 'text-coral' : ''} sidebar-list-item`} onClick={() => componentrender('Users')}>
                        <BsPeopleFill className='icon'/> Users
                        </h5>
                        <h5 className={` ${component === 'Profile' ? 'text-coral' : ''} sidebar-list-item`} onClick={() => componentrender('Profile')}>
                        <BsPersonCircle className='icon'/> Profile
                        </h5>
                        <h5 className={` ${component === 'Admins' ? 'text-coral' : ''} sidebar-list-item`} onClick={() => componentrender('Admins')}>
                        <BsPeopleFill className='icon'/>   Admins
                        </h5>
                        
                    </div>
                    <div>
                        <button className="" onClick={() => logout()}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
