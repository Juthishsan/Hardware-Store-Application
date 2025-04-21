import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import AddProducts from './forms/AddProducts';
import { db, storage } from '../firebase';
import { child, get, ref, remove, update } from 'firebase/database';
import { deleteObject, ref as reference, getDownloadURL, uploadBytes } from 'firebase/storage';
import Swal from 'sweetalert2';

const Products = () => {
  const [addproduct, setaddproduct] = useState(false);
  const [editproduct, seteditproduct] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [editdata, seteditdata] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const uniqueProductTypes = [...new Set(tableData.map(product => product.type))];


  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
  

  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
    if (editdata && editdata.imageURL) {
      setPreviewImage(editdata.imageURL);
    }
  }, [editdata]);


  useEffect(() => {
    // Check if notification needs to be sent when tableData changes
    if (tableData.length > 0 && !notificationSent) {
      checkAndSendNotification();
    }
  }, [tableData, notificationSent]);


  const fetchProducts = () => {
    const dataRef = ref(db, '/products');
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
  };


  const checkAndSendNotification = () => {
    const outOfStockProducts = tableData.filter((product) => product.stock == 0);
    if (outOfStockProducts.length > 0) {
      sendOutOfStockNotification(outOfStockProducts);
      setNotificationSent(true); // Set notification sent flag to true
    }
  };


  const sendOutOfStockNotification = async (outOfStockProducts) => {

    if (notificationSent) {
      console.log("Notification already sent.");
      return;
    }
    const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/AC1e1a19c88f9fe54b01f012134028a347/Messages.json';
    const credentials = 'AC1e1a19c88f9fe54b01f012134028a347:be042dede79a856601429ff67fb35127';
    const to = 'whatsapp:+919965929856'; // Replace with admin's WhatsApp number
    const from = 'whatsapp:+14155238886';
    let body = `
    Attention Admin,
    
    The following products are out of stock:
  `;
    outOfStockProducts.forEach((product, index) => {
      body += `\n${index + 1}. ${product.name}`;
    });
    body += `\n
    Please take necessary action.

    Regards,
    Your App
  `;
    const base64Credentials = btoa(credentials);

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Credentials}`,
      },
      body: `To=${encodeURIComponent(to)}&From=${encodeURIComponent(from)}&Body=${encodeURIComponent(body)}`,
    };

    try {
      const response = await fetch(twilioUrl, requestOptions);
      const data = await response.json();

      if (response.ok) {
        console.log("Message sent to admin. SID:", data.sid);
      } else {
        console.error("Twilio API Error:", data.message);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message to admin:", error);
    }
  };

  const getproducts = () => {
    fetchProducts();
  };


  const handleEdit = (row) => {
    seteditproduct(true);
    seteditdata(row);
  };

  const handleDelete = (key, imageURL) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this product!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
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
        });

        const productImageRef = reference(storage, imageURL);

        deleteObject(productImageRef)
          .then(() => {
            deleteProduct(key);
          })
          .catch((error) => {
            Swal.fire('Deleted!', 'The product has been deleted.', 'error');
          });
      }
    });
  };

  const deleteProduct = (key) => {
    const updatedData = filteredData.filter((item) => item.key !== key);
    setFilteredData(updatedData);
    const productRef = ref(db, `products/${key}`);
    remove(productRef);
    Swal.fire('Deleted!', 'The product has been deleted.', 'success');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();

    const { key, newImage, ...updatedDetails } = editdata;

    try {
      if (newImage) {
        const filename = generateRandomString(15);
        const imageRef = reference(storage, `productimages/${filename}`);
        await uploadBytes(imageRef, newImage);
        const downloadURL = await getDownloadURL(imageRef);
        updatedDetails.imageURL = downloadURL;
      }

      // Check if the stock value is less than 0
      if (updatedDetails.stock < 0) {
        // Show a warning message
        Swal.fire('Warning', 'Stock value cannot be less than 0', 'warning');
      } else {
        // Proceed with updating the product details if stock is not less than 0
        const productRef = ref(db, `products/${editdata.key}`);
        update(productRef, updatedDetails)
          .then(() => {
            Swal.fire('Updated', 'The product has been updated', 'success');
            seteditdata(null);
            seteditproduct(!editproduct);
            fetchProducts();
          })
          .catch((error) => {
            console.error('Error updating product:', error);
            Swal.fire('Error', 'An error occurred while updating the product', 'error');
          });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Product Image Upload Unsuccessful',
        text: error.message,
        showConfirmButton: true,
        confirmButtonColor: 'black',
      });
    }
  };



  const handleStockUpdate = (key, newStock) => {
    // Convert newStock to a number
    const stockValue = parseInt(newStock);

    // Check if the stock value is less than 0
    if (stockValue < 0) {
      // Show a warning message
      Swal.fire('Warning', 'Stock value cannot be less than 0', 'warning');
    } else {
      // Proceed with updating the stock value if it's not less than 0
      const productRef = ref(db, `products/${key}`);
      update(productRef, { stock: stockValue })
        .then(() => {
          Swal.fire('Stock Updated', 'The stock has been updated successfully', 'success');
          fetchProducts();
        })
        .catch((error) => {
          console.error('Error updating stock:', error);
          Swal.fire('Error', 'An error occurred while updating the stock', 'error');
        });
    }
  };



  const columns = [
    // {
    //   name: 'Rank',
    //   selector: 'rank',
    //   sortable: true,
    // },
    {
      name: 'Image',
      cell: (row) => <img src={row.imageURL} alt="Product" className="img-fluid" height={100} width={100} loading="lazy" />,
    },
    {
      name: 'Type',
      selector: 'type',
    },
    {
      name: 'Name',
      selector: 'name',
    },
    {
      name: 'Price',
      selector: (row) => `₹ ${row.price}`,
      sortable: true,
    },
    {
      name: 'Stock',
      selector: 'stock',
      cell: (row) => (
        <input
          type="number"
          value={row.stock}
          onChange={(e) => handleStockUpdate(row.key, e.target.value)}
        />
      ),
    },
    {
      name: 'Action',
      cell: (row) => (
        <div className="d-flex flex-row">
          <i className="bi bi-pencil-square pe-3" onClick={() => handleEdit(row)}></i>
          <i className="bi bi-trash-fill px-3" onClick={() => handleDelete(row.key, row.imageURL)}></i>
          <i className="bi bi-eye-fill px-3" onClick={() => openModal(row)}></i>
        </div>
      ),
    },
  ];

  const paginationOptions = {
    rowsPerPageText: 'Rows per page:',
    rangeSeparatorText: 'of',
  };

  const handleSearch = (searchQuery, selectedType) => {
    let filteredItems = tableData;

    if (searchQuery) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType) {
      filteredItems = filteredItems.filter((item) =>
        item.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredData(filteredItems);
  };

  const openModal = (rowData) => {
    setSelectedRowData(rowData);
    setModalOpen(true);
  };

  
  return (
    <div>

      <div className='sticky-top'>
        <div className='d-flex flex-row justify-content-between'>
          <div className='fw-bold'>
            Products
          </div>
          <div>
            <button className='' onClick={() => setaddproduct(!addproduct)}>Add Products</button>
          </div>
        </div>

        <div className="container mt-4 mb-2">
          <div className='row'>
            <div className='col-md-6'>
              <div className='input-group'>
                <span className='input-group-text'><i className='bi bi-search'></i></span>
                <input
                  type="text"
                  placeholder="Search product name..."
                  className='form-control'
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    handleSearch(e.target.value, selectedType);
                  }}
                />
              </div>
            </div>

            <div className='col-md-6 m-lg-0 my-3'>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  handleSearch(searchText, e.target.value);
                }}
                className='form-select'
              >
                <option value="">All Types</option>
                {uniqueProductTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

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


      {addproduct && (
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
                      Add Product
                    </h5>
                    <h5 className='animate__animated animate__fadeInUp ' onClick={() => setaddproduct(!addproduct)}>
                      <i className="bi bi-x-circle-fill"></i>
                    </h5>
                  </div>
                  <div >
                  <AddProducts setaddproduct={setaddproduct} getproducts={getproducts} productTypes={uniqueProductTypes} />

                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {editproduct && (
        <div>
          <div
            className="modal d-block border-0"
            role="dialog"
            style={{
              display: 'block',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="modal-dialog modal-lg border-0 modal-dialog-centered ">
              <div className="modal-content text-bg-green border-0 rounded-4">
                <div className="modal-body" >
                  <div className='d-flex flex-row justify-content-between pb-3'>

                    <h5 className='animate__animated animate__fadeInDown text-center fw-bold'>
                      Edit Product
                    </h5>
                    <h5 className='animate__animated animate__fadeInUp ' onClick={() => seteditproduct(!editproduct)}>
                      <i className="bi bi-x-circle-fill"></i>
                    </h5>
                  </div>
                  <div>
                    <form>
                      <div className='row mt-4'>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="image" className="form-label fw-bold">
                            Product Image
                          </label>
                          <input
                            accept="image/*"
                            type="file"
                            onChange={(e) => {
                              seteditdata({ ...editdata, newImage: e.target.files[0] });
                              if (e.target.files && e.target.files[0]) {
                                let reader = new FileReader();
                                reader.onload = function (event) {
                                  setPreviewImage(event.target.result);
                                };
                                reader.readAsDataURL(e.target.files[0]);
                              }
                            }}
                            className="input-field"
                            style={{ paddingTop: "12px" }}
                            id="image"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          {previewImage && (
                            <img src={previewImage} alt="Preview" className="img-thumbnail mt-2" style={{ maxWidth: "200px", maxHeight: "200px" }} />
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="name" className="form-label fw-bold">Product Name</label>
                          <input
                            type="text"
                            className="input-field"
                            id="name"
                            value={editdata.name}
                            onChange={(e) => seteditdata({ ...editdata, name: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="type" className="form-label fw-bold">Product Type</label>
                          <input
                            className="input-field"
                            id="type"
                            value={editdata.type}
                            onChange={(e) => seteditdata({ ...editdata, type: e.target.value })}
                          >
                          </input>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="price" className="form-label fw-bold">Product Price</label>
                          <input
                            type="number"
                            className="input-field"
                            id="price"
                            value={editdata.price}
                            onChange={(e) => seteditdata({ ...editdata, price: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="stock" className="form-label fw-bold">Product Stock</label>
                          <input
                            type="number"
                            className="input-field"
                            id="stock"
                            value={editdata.stock}
                            onChange={(e) => seteditdata({ ...editdata, stock: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="rank" className="form-label fw-bold">Product Rank</label>
                          <input
                            type="number"
                            className="input-field"
                            id="rank"
                            value={editdata.rank}
                            onChange={(e) => seteditdata({ ...editdata, rank: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="rank" className="form-label fw-bold">Product Description</label>
                          <textarea
                            type="number"
                            className="input-field"
                            id="info"
                            rows="30"
                            cols="10"
                            value={editdata.info}
                            onChange={(e) => seteditdata({ ...editdata, info: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className='text-center '>
                        <button className="submit my-3" onClick={handleEditSave}>Save</button>
                      </div>

                    </form>
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
                <div className="modal-body" >
                  <div className='d-flex flex-row justify-content-between pb-3'>

                    <h5 className='animate__animated animate__fadeInDown text-center fw-bold'>
                      Product Info
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
                          <label className='fw-bold'>Product Name</label>
                          <p> {selectedRowData.name}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Product Price</label>
                          <p>₹ {selectedRowData.price}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Product Type</label>
                          <p> {selectedRowData.type}</p>
                        </div>
                        <div className='col-md-6'>
                          <label className='fw-bold'>Product Description</label>
                          <p> {selectedRowData.info}</p>
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

export default Products
