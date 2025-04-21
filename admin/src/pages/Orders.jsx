import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { db, storage } from '../firebase';
import { child, get, ref, remove, update } from 'firebase/database';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const Orders = () => {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isOrderedItemsModalOpen, setOrderedItemsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());


  const openModal = (rowData) => {
    setSelectedRowData(rowData);
    setModalOpen(true);
  };

  const generateExcelReport = (startDate, endDate) => {
    // Convert start and end dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure end date is set to end of the day to include all records on that day
    end.setHours(23, 59, 59, 999);

    // Filter tableData based on the selected time period
    const filteredOrders = tableData.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= start && orderDate <= end;
    });

    // Prepare data for the Excel report
    const excelData = filteredOrders.map(order => ({
      'Order Date': order.orderDate,
      'UID': order.uid,
      'Order Status': order.orderstatus,
      'Payment Method': order.paymentMethod,
      'Price': order.total,
      'Grand Total': order.grandTotal
      // Add more fields as needed
    }));

    // Convert data to Excel format
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Save Excel file
    XLSX.writeFile(workbook, 'orders_report.xlsx');
  };


  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {

    const dataRef = ref(db, '/orders');
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
          setFilteredData(dataEntries);
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
      timer: 3000
    });
    const dataRef = ref(db, '/orders');
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


  const updateOrderStatus = (orderKey, newStatus) => {
    const orderRef = ref(db, `orders/${orderKey}`);

    // Update the order status in the Realtime Database
    update(orderRef, { orderstatus: newStatus })
      .then(() => {
        // Update the state with the latest orders
        getproducts();

        // Show a success message (you can customize this part)
        Swal.fire({
          icon: 'success',
          title: 'Order status updated successfully!',
          showConfirmButton: true,
          timer: 3000,
        });
      })
      .catch((error) => {
        // Show an error message (you can customize this part)
        Swal.fire({
          icon: 'error',
          title: 'Error updating order status',
          showConfirmButton: true,
          timer: 3000,
        });

        console.error('Error updating order status:', error);
      });
  };



  // Usage in your component
  // Replace 'Processing', 'Delivered', 'Shipped', 'Cancelled' with the actual statuses you have in your data
  const handleStatusChange = (orderKey, newStatus) => {
    Swal.fire({
      title: `Are you sure you want to set the order status to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007BFF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update status!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the updateOrderStatus function with the selected status
        updateOrderStatus(orderKey, newStatus);
      }
    });
  };

  const columns = [
    {
      name: 'Order Date',
      selector: 'orderDate',
    },
    {
      name: 'UID',
      selector: 'uid',
    },
    {
      name: 'Order Status',
      selector: 'orderstatus',
      cell: (row) => (
        <div className='d-flex flex-row py-2'>
          <div className='dropdown dropend'>
            <button
              className='btn btn-secondary dropdown-toggle'
              type='button'
              id='statusDropdown'
              data-bs-toggle='dropdown'
              aria-expanded='false'
            >
              {row.orderstatus}
            </button>
            <ul className='dropdown-menu' aria-labelledby='statusDropdown'>
              <li className='d-flex'>
                <button
                  className='dropdown-item'
                  onClick={() => handleStatusChange(row.key, 'Processing')}
                >
                  Processing
                </button>
              </li>
              <li className='d-flex'>
                <button
                  className='dropdown-item'
                  onClick={() => handleStatusChange(row.key, 'Delivered')}
                >
                  Delivered
                </button>
              </li>
              <li className='d-flex'>
                <button
                  className='dropdown-item'
                  onClick={() => handleStatusChange(row.key, 'Shipped')}
                >
                  Shipped
                </button>
              </li>
              <li className='d-flex'>
                <button
                  className='dropdown-item'
                  onClick={() => handleStatusChange(row.key, 'Cancelled')}
                >
                  Cancelled
                </button>
              </li>
            </ul>

          </div>
        </div>
      ),
    },
    {
      name: 'Payment Method',
      selector: 'paymentMethod',
    },

    // {
    //   name: 'Quantity',
    //   selector: 'items',
    //   sortable: true,
    //   cell: (row) => (
    //     <div>
    //       {row.items && row.items.length}
    //     </div>
    //   ),
    // },

    // {
    //   // Empty column for spacing
    //   name: '',
    //   selector: '',
    //   cell: () => <div style={{ width: '10px' }}></div>,
    // },

    {
      name: 'Price',
      selector: (row) => `₹ ${row.total}`,
      sortable: true,
    },
    {
      name: 'Grand Total', // New column for displaying price after GST
      selector: (row) => `₹ ${row.grandTotal}`,
      sortable: true,
    },
    {
      name: 'Ordered Items',
      cell: (row) => (
        <div className='d-flex flex-row'>
          <i className='bi bi-cart-fill px-4' onClick={() => openOrderedItemsModal(row)}></i>
        </div>
      ),
    },
    {
      name: 'Order Info',
      cell: (row) => (
        <div className='d-flex flex-row'>
          <i className='bi bi-eye-fill px-3' onClick={() => openModal(row)}></i>
        </div>
      ),
    },
  ];

  const paginationOptions = {
    rowsPerPageText: 'Rows per page:',
    rangeSeparatorText: 'of',
  };

  const calculatePriceAfterGST = (price) => {
    // Perform GST calculation here, assuming GST rate is 18%
    const GST_RATE = 0.18;
    const priceAfterGST = price * (1 + GST_RATE);
    return priceAfterGST.toFixed(2); // Round to 2 decimal places
  };

  const handleSearch = (searchQuery, selectedType) => {
    let filteredItems = tableData;

    if (searchQuery) {
      filteredItems = filteredItems.filter((item) =>
        item.orderDate.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType) {
      filteredItems = filteredItems.filter((item) =>
        item.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredData(filteredItems);
  };

  const openOrderedItemsModal = (rowData) => {
    setSelectedRowData(rowData);
    setOrderedItemsModalOpen(true);
  };


  const [userDetails, setUserDetails] = useState(null);

  // Function to fetch and set user details
  const fetchUserDetails = async (uid) => {
    const userRef = ref(db, `users/${uid}/profile`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        // Set user details in state
        setUserDetails(userData);
      } else {
        setUserDetails(null); // Set to null if user details not found
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetails(null); // Set to null in case of an error
    }
  };

  // useEffect to fetch user details when modal is opened
  useEffect(() => {
    if (isModalOpen && selectedRowData && selectedRowData.uid) {
      fetchUserDetails(selectedRowData.uid);
    }
  }, [isModalOpen, selectedRowData]);



  return (
    <div>

      <div className='sticky-top'>
        <div className='d-flex flex-row justify-content-between'>
          <div className='fw-bold'>
            Orders
          </div>
          {/* <button className="btn btn-secondary" onClick={generateExcelReport}>Download Report</button> */}
          <div>
            <label style={{ marginRight: '10px', paddingRight: '5px' }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                marginRight: '10px',
                border: '1px solid #ccc',
                padding: '8px',
                borderRadius: '4px',
                outline: 'none'
              }}
            />

            <label style={{ marginRight: '10px', paddingRight: '5px' }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                marginRight: '10px',
                border: '1px solid #ccc',
                padding: '8px',
                borderRadius: '4px',
                outline: 'none'
              }}
            />

            <button onClick={() => generateExcelReport(startDate, endDate)} style={{ padding: '8px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Download Report</button>
          </div>



        </div>
        <div className="container mt-4 mb-2">
          <div className='row'>
            <div className='col-md-6'>
              <div className='input-group'>
                <span className='input-group-text'><i className='bi bi-search'></i></span>
                <input
                  type="text"
                  placeholder="Search order date..."
                  className='form-control'
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    handleSearch(e.target.value, selectedType);
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
            <div style={{ overflowX: 'auto', height: "70vh" }}>
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

      {/* Modal for displaying ordered items */}
      {isOrderedItemsModalOpen && selectedRowData && (
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
                <div className="modal-body">
                  <div className='d-flex flex-row justify-content-between pb-3'>
                    <h5 className='animate__animated animate__fadeInDown text-center fw-bold'>
                      Ordered Items
                    </h5>
                    <h5 className='animate__animated animate__fadeInUp ' onClick={() => setOrderedItemsModalOpen(false)}>
                      <i className="bi bi-x-circle-fill"></i>
                    </h5>
                  </div>
                  <div className='table-responsive'>
                    <table className='table table-bordered'>
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Product Name</th>
                          <th>Quantity</th>
                          {/* Add more headers as needed */}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRowData.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.productID}</td>
                            <td>{item.productName}</td>
                            <td>{item.quantity}</td>
                            {/* Add more cells as needed */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {isModalOpen && selectedRowData && (
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
                <div className="modal-body">
                  <div className='d-flex flex-row justify-content-between pb-3'>
                    <h5 className='animate__animated animate__fadeInDown text-center fw-bold'>
                      Order Info
                    </h5>
                    <h5 className='animate__animated animate__fadeInUp ' onClick={() => setModalOpen(false)}>
                      <i className="bi bi-x-circle-fill"></i>
                    </h5>
                  </div>
                  <div>
                    <div className='container border px-3 rounded-3'>
                      <div className='row'>
                        <div className='col-md-12 d-flex flex-row justify-content-center pb-3'>
                          <img className='img-fluid' src={selectedRowData.imageURL} width={200} loading='lazy' />
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Product ID</label>
                          <p> {selectedRowData.key}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>User ID</label>
                          <p> {selectedRowData.uid}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Order ID</label>
                          <p> {selectedRowData.key}</p>
                        </div>

                        <div className='col-md-6'>
                          <label className='fw-bold'>Product Price</label>
                          <p> {selectedRowData.total}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Grand Total</label>
                          <p> ₹ {selectedRowData.grandTotal}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Payment Method</label>
                          <p> {selectedRowData.paymentMethod}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Order Status</label>
                          <p> {selectedRowData.orderstatus}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Order Date</label>
                          <p> {selectedRowData.orderDate}</p>
                        </div>

                        <hr></hr>

                        <div className='container  px-3 '>
                          <div className='row '>
                            <div className='col-md-6'>
                              <label className='fw-bold'>First Name</label>
                              <p> {selectedRowData.address.firstName}</p>
                            </div>
                            <div className='col-md-6'>
                              <label className='fw-bold'>Last Name</label>
                              <p> {selectedRowData.address.lastName}</p>
                            </div>
                            <div className='col-md-6'>
                              <label className='fw-bold'>Address</label>
                              <p> {selectedRowData.address.address}</p>
                            </div>

                            <div className='col-md-6'>
                              <label className='fw-bold'>City</label>
                              <p> {selectedRowData.address.city}</p>
                            </div>
                            <div className='col-md-6'>
                              <label className='fw-bold'>State</label>
                              <p> {selectedRowData.address.state}</p>
                            </div>
                            <div className='col-md-6'>
                              <label className='fw-bold'>Pincode</label>
                              <p> {selectedRowData.address.pincode}</p>
                            </div>
                            <div className='col-md-6'>
                              <label className='fw-bold'>Phone</label>
                              <p> {selectedRowData.address.phone}</p>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}


export default Orders
