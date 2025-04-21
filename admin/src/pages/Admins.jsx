import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import AddProducts from './forms/AddProducts';
import { db, storage } from '../firebase';
import { child, get, ref, remove, update } from 'firebase/database';
import { deleteObject, ref as reference } from 'firebase/storage';
import Swal from 'sweetalert2';
import Register from './auth/Register';

const Admins = () => {

    const [tableData, setTableData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [addadmin, setaddadmin] = useState(false)


    const openModal = (rowData) => {
        setSelectedRowData(rowData);
        setModalOpen(true);
    };

    useEffect(() => {

        const dataRef = ref(db, '/admins');
        get(dataRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const dataObject = snapshot.val();
                    const dataKeys = Object.keys(dataObject);
                    const dataEntries = dataKeys.map((key) => ({
                        key,
                        ...dataObject[key],
                    }));
                    dataEntries.sort((a, b) => a.rank - b.rank);
                    setTableData(dataEntries);
                    setFilteredData(dataEntries); // Initially, set filteredData to all data
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);



    const getproducts = () => {

        Swal.fire({
            html: `
        <div className="" >
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      `,
            showConfirmButton: false,
            background: 'transparent',
            timer: 1000
        });
        const dataRef = ref(db, '/admins');
        get(dataRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const dataObject = snapshot.val();
                    const dataKeys = Object.keys(dataObject);
                    const dataEntries = dataKeys.map((key) => ({
                        key,
                        ...dataObject[key],
                    }));
                    dataEntries.sort((a, b) => a.rank - b.rank);
                    setTableData(dataEntries);
                    setFilteredData(dataEntries); // Initially, set filteredData to all data
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }


    const columns = [
        {
            name: 'Details',
            cell: (row) => (
                <i className='bi bi-eye-fill' onClick={() => openModal(row)}></i>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
        {
            name: 'UID',
            selector: 'key',
        },
        {
            name: ' Name',
            selector: 'profile.name',
        },

        {
            name: 'Phone',
            selector: 'profile.phone',
            sortable: true,
        },
        {
            name: 'Email',
            selector: 'profile.email',
            sortable: true,
        },

    ];

    const paginationOptions = {
        rowsPerPageText: 'Rows per page:',
        rangeSeparatorText: 'of',
    };


    const handleSearch = (searchQuery) => {
        let filteredItems = tableData;

        if (searchQuery) {
            filteredItems = filteredItems.filter((item) =>
                item.profile.firstname.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredData(filteredItems);
    };




    return (
        <div>

            <div className='sticky-top'>
                <div className='d-flex flex-row justify-content-between'>
                    <div className='fw-bold'>
                        Admins
                    </div>
                    <div>
                        <button className='' onClick={() => setaddadmin(!addadmin)}>Add Admin</button>
                    </div>
                </div>
                <div className="container mt-4 mb-2">
                    <div className='row'>
                        <div className='col-md-6'>
                            <div className='input-group'>
                                <span className='input-group-text'><i className='bi bi-search'></i></span>
                                <input
                                    type="text"
                                    placeholder="Search admin name..."
                                    className='form-control'
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <div className='container mt-4 mb-2'>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='table-responsive' style={{ overflowX: 'auto', height: "70vh" }}>
                            <DataTable
                                className="table table-bordered table-striped "
                                columns={columns}
                                data={filteredData}
                                pagination
                                paginationComponentOptions={paginationOptions}
                                highlightOnHover
                                pointerOnHover
                                striped
                                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {
                isModalOpen && selectedRowData && (
                    <div>
                        <div
                            className="modal d-block border-0"
                            role="dialog"
                            style={{
                                display: 'block',
                                background: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(3px)',
                            }}
                        >
                            <div className="modal-dialog modal-lg border-0 modal-dialog-centered ">
                                <div className="modal-content text-bg-green border-0 rounded-4">
                                    <div className="modal-body" >
                                        <div className='d-flex flex-row justify-content-between pb-3'>

                                            <h5 className='animate__animated animate__fadeInDown text-center fw-bold'>
                                                Admin Info
                                            </h5>
                                            <h5 className='animate__animated animate__fadeInUp ' onClick={() => setModalOpen(false)}>
                                                <i className="bi bi-x-circle-fill"></i>
                                            </h5>
                                        </div>
                                        <div>
                                            <div className='container border p-3 rounded-3'>
                                                <div className='row'>
                                                    <div className='col-md-6'>
                                                        <label className='fw-bold'>UID</label>
                                                        <p> {selectedRowData.key}</p>
                                                    </div>

                                                    <div className='col-md-6'>
                                                        <label className='fw-bold'> Name</label>
                                                        <p> {selectedRowData.profile.name}</p>
                                                    </div>
                                                    <div className='col-md-6'>
                                                        <label className='fw-bold'>Phone</label>
                                                        <p> {selectedRowData.profile.phone}</p>
                                                    </div>
                                                    <div className='col-md-6'>
                                                        <label className='fw-bold'>Email</label>
                                                        <p> {selectedRowData.profile.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                addadmin && (
                    <div>
                        <div
                            className="modal d-block border-0"
                            role="dialog"
                            style={{
                                display: 'block',
                                background: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(3px)',
                            }}
                        >
                            <div className="modal-dialog modal-lg border-0 modal-dialog-centered ">
                                <div className="modal-content text-bg-green border-0 rounded-4">
                                    <div className="modal-body" >
                                        <div className='d-flex flex-row justify-content-between pb-3'>

                                            <h4 className="animate__animated animate__fadeInDown fw-bold">
                                                Add Admin
                                            </h4>

                                            <h5 className="animate__animated animate__fadeInUp " onClick={() => setaddadmin(!addadmin)}>
                                                <i className="bi bi-x-circle-fill"></i>
                                            </h5>
                                        </div>
                                        <div>

                                            <Register getproducts={getproducts} setaddadmin={setaddadmin} />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default Admins