import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { get, push, ref, set } from 'firebase/database';
import Swal from 'sweetalert2';
import { onAuthStateChanged } from 'firebase/auth';

const Wires = () => {
    const [tableData, setTableData] = useState([]);
    const [stockAvailability, setStockAvailability] = useState({});
    const [loggedinuid, setLoggedinuid] = useState(null);
    const [bigmodal, setBigmodal] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [paytmentmodal, setPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        // Fetching product data from Firebase and setting up stock availability
        const fetchData = async () => {
            try {
                const dataRef = ref(db, '/products');
                const snapshot = await get(dataRef);
                if (snapshot.exists()) {
                    const dataObject = snapshot.val();
                    const dataKeys = Object.keys(dataObject);
                    const dataEntries = dataKeys
                        .map((key) => ({
                            key,
                            ...dataObject[key],
                        }))
                        .filter((entry) => entry.type === "Wires")
                        .sort((a, b) => a.rank - b.rank);

                    setTableData(dataEntries);
                    setFilteredData(dataEntries);
                    setTableData(dataEntries.slice(0, 4));
                    setFilteredData(dataEntries.slice(0, 4));

                    const stockData = {};
                    dataEntries.forEach((entry) => {
                        stockData[entry.key] = entry.stock;
                    });
                    setStockAvailability(stockData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Subscribing to authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                setLoggedinuid(uid);

                const userRef = ref(db, 'users/' + uid);

                get(userRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            setLoggedinuid(uid);
                            const userData = snapshot.val();
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching Realtime Database data:', error);
                    });
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const addtocart = (productID, quantity) => {
        if (loggedinuid) {
            const userCartRef = ref(db, 'users/' + loggedinuid + '/cart');
            get(userCartRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const cartItems = Object.values(snapshot.val());
                        const isProductInCart = cartItems.some(item => item.productID === productID);
                        if (isProductInCart) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Product already in cart',
                                showConfirmButton: true,
                                timer: 3000
                            });
                        } else if (stockAvailability[productID] >= quantity) {
                            push(ref(db, 'users/' + loggedinuid + '/cart'), {
                                productID,
                                quantity,
                            });
                            Swal.fire({
                                icon: 'success',
                                title: 'Successfully Added to the cart',
                                showConfirmButton: true,
                                timer: 3000
                            });
                        } else {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Not enough stock',
                                showConfirmButton: true,
                                timer: 3000
                            });
                        }
                    } else {
                        if (stockAvailability[productID] >= quantity) {
                            push(ref(db, 'users/' + loggedinuid + '/cart'), {
                                productID,
                                quantity,
                            });
                            Swal.fire({
                                icon: 'success',
                                title: 'Successfully Added to the cart',
                                showConfirmButton: true,
                                timer: 3000
                            });
                        } else {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Not enough stock',
                                showConfirmButton: true,
                                timer: 3000
                            });
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user cart data:', error);
                });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Log in to use cart',
                showConfirmButton: true,
                timer: 3000
            });
        }
    }

    const openBigmodal = (productID) => {
        const selectedProduct = tableData.find((product) => product.key === productID);
        setBigmodal(true);
        setModalProduct(selectedProduct);
        setQuantity(1); // Reset quantity to 1 when opening modal
    };

    const incrementQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const buyNow = (product) => {
        setPaymentModal(true);
        setModalProduct(product);
    };

    const closeModal = () => {
        setPaymentModal(false);
    };


    const buytheproduct = async () => {

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const address = document.getElementById('address').value;
        const pincode = document.getElementById('pincode').value;
        const phone = document.getElementById('phone').value;


        if (!firstName || !lastName || !city || !state || !address || !pincode || !phone) {
            // Check if any of the fields are empty
            Swal.fire({
                icon: 'error',
                title: 'Please fill in all the fields',
                showConfirmButton: true,
            });
            return;
        }

        // const stockPromises = filteredData.map(async (product) => {
        //   const productRef = ref(db, `products/${product.productID}`);
        //   const productSnapshot = await get(productRef);
        //   if (productSnapshot.exists()) {
        //     const productData = productSnapshot.val();
        //     if (productData.stock < product.quantity) {
        //       // If quantity exceeds stock, show error message and prevent order placement
        //       Swal.fire({
        //         icon: 'error',
        //         title: `Not enough stock available for ${product.productName}`,
        //         text: `Available stock: ${productData.stock}`,
        //         showConfirmButton: true,
        //       });
        //       return false;
        //     }
        //   }
        //   return true;
        // });

        // const stockResults = await Promise.all(stockPromises);

        // // If any product quantity exceeds stock, return early and do not proceed with order placement
        // if (stockResults.includes(false)) {
        //   return;
        // }


        // Proceed with placing the order
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

        const orderDate = new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        const productDetails = modalProduct;

        let totalWithGST = modalProduct.price * quantity + (modalProduct.price * quantity * 0.18);

        // // Calculate shipping cost
        // const shippingCost = totalCartPrice < 500 ? 50 : 0;
        // totalWithGST += shippingCost;

        const orderDetails = {
            orderDate,
            items: productDetails,
            total: modalProduct.price,
            grandTotal: totalWithGST,
            paymentMethod: selectedPaymentMethod,
            uid: loggedinuid,
            orderstatus: "Processing",
            address: {
                firstName,
                lastName,
                city,
                state,
                address,
                pincode,
                phone,
            }
        };


        const ordersRef = ref(db, 'orders');
        try {
            // Place order and clear cart
            await push(ordersRef, orderDetails);
            //   clearCart(loggedinuid);
            setPaymentModal(false);
            //   fetchfromcart();
            //   updateStock(productDetails);
            //   componentrender("Cart");
            setTimeout(() => {
                window.location.reload();
            }, 3000);

            //   // Send WhatsApp message to the admin
            //   await sendWhatsappMessage(orderDetails);


            //   // Send WhatsApp message to the user
            //   await sendUserOrderConfirmation(orderDetails);

            Swal.fire({
                icon: 'success',
                title: 'Order Placed Successfully',
                showConfirmButton: true,
            });
        } catch (error) {
            console.error('Error placing the order:', error);
        }
    };

    return (
        <div>
            <section id="Featured" className="my-5 pb-5">
                <div className="row mx-auto container-fluid">
                    {tableData.map((entry) => (
                        <div className="product text-center col-lg-3 col-md-6 col-12" key={entry.key}>
                            <div className="product-image-container" onClick={() => openBigmodal(entry.key)}>
                                <img
                                    className="product-image"
                                    src={entry.imageURL}
                                    alt={entry.name}
                                    style={{ height: "200px", width: "auto" }}
                                />
                                {entry.stock == 0 ? (
                                    <p className="product-status out-of-stock">Out of Stock</p>
                                ) : (
                                    entry.stock <= 10 ? (
                                        <p className="product-status hurry-left">Hurry Only {entry.stock} Left</p>
                                    ) : null
                                )}
                            </div>
                            <h5 className="p-name">{entry.name}</h5>
                            <h4 className="p-price">{`₹${entry.price} `} {entry.type === "Pipes" ? "/Meter" : ""}</h4>
                            <br />
                            <button className="buy-btn my-2 me-2" onClick={() => addtocart(entry.key, quantity)}>Add to Cart</button>
                            <button className="buy-btn my-2" onClick={() => buyNow(entry)}>Buy Now</button>
                        </div>
                    ))}



                </div>
            </section>
            {bigmodal && modalProduct && (
                <div>
                    <div className="modal d-block border-0" role="dialog" style={{ display: 'block', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(3px)' }}>
                        <div className="modal-dialog modal-fullscreen border-0 modal-dialog-centered ">
                            <div className="modal-content text-bg-green border-0 rounded-4">
                                <div className="modal-body" >
                                    <div className='d-flex flex-row justify-content-between pb-3'>
                                        <h5 className='animate__animated animate__fadeInDown text-center fw-bold display-6'>Product Info</h5>
                                        <h5 className='animate__animated animate__fadeInUp' onClick={() => setBigmodal(false)}>
                                            <i className="bi bi-x-circle-fill"></i>
                                        </h5>
                                    </div>
                                    <div>
                                        <div>
                                            <section className="sproduct container mb-3 ">
                                                <div className="row mt-5">
                                                    <div className="col-lg-5 col-md-12 col-12">
                                                        <img className="img-fluid w-50" src={modalProduct.imageURL} id="MainImg" alt="" />
                                                    </div>

                                                    <div className="col-lg-6 col-md-12 col-12">

                                                        <div className='d-flex flex-row justify-content-between mt-3'>
                                                            <h3> {modalProduct.name}</h3>
                                                        </div>

                                                        <div className='row my-2 pt-5'>
                                                            <div className='col'>
                                                                <h2>₹{modalProduct.price} {modalProduct.type === "Wires" ? "" : "/Meter"}</h2>
                                                            </div>
                                                            <div className='col d-flex flex-column justify-content-end align-items-end'>
                                                                <div className="quantity-selector">
                                                                    <button className="quantity-btn" onClick={decrementQuantity}>-</button>
                                                                    <input className="quantity-input" type="number" value={quantity} readOnly />
                                                                    <button className="quantity-btn" onClick={incrementQuantity}>+</button>
                                                                </div>
                                                                <div>
                                                                    <button className="buy-btn btn-lg m-3" onClick={() => addtocart(modalProduct.key, quantity)}>Add to cart</button>
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <h4 className="mt-5">Product Description</h4>
                                                        <span>{modalProduct.info}</span>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {paytmentmodal && modalProduct && (
                <div>
                    <div className="modal d-block border-0" role="dialog" style={{ display: 'block', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(3px)' }}>
                        <div className="modal-dialog modal-fullscreen border-0 modal-dialog-centered">
                            <div className="modal-content text-bg-green border-0 rounded-4">
                                <div className="modal-body">
                                    <div className='d-flex flex-row justify-content-between pb-3'>
                                        <h5 className='animate__animated animate__fadeInDown text-center fw-bold'>
                                            Order Confirmation
                                        </h5>
                                        <h5 className='animate__animated animate__fadeInUp' onClick={closeModal}>
                                            <i className="bi bi-x-circle-fill"></i>
                                        </h5>
                                    </div>

                                    <div className='d-flex flex-column justify-content-between ' style={{ height: "80vh" }}>
                                        <div>
                                            <div className='container pb-5' >
                                                <div className="row">
                                                    <div className=" col-lg-6 col-12">
                                                        <form>
                                                            <div className='mb-3'>
                                                                <label htmlFor="firstName" className="form-label">First Name</label>
                                                                <input type="text" className="form-control" id="firstName" required />
                                                            </div>
                                                            <div className='mb-3'>
                                                                <label htmlFor="lastName" className="form-label">Last Name</label>
                                                                <input type="text" className="form-control" id="lastName" required />
                                                            </div>
                                                            <div className='mb-3'>
                                                                <label htmlFor="city" className="form-label">City</label>
                                                                <input type="text" className="form-control" id="city" required />
                                                            </div>
                                                            <div className='mb-3'>
                                                                <label htmlFor="state" className="form-label">State</label>
                                                                <input type="text" className="form-control" id="state" required />
                                                            </div>
                                                            <div className='mb-3'>
                                                                <label htmlFor="address" className="form-label">Address</label>
                                                                <textarea className="form-control" id="address" required></textarea>
                                                            </div>
                                                            <div className='mb-3'>
                                                                <label htmlFor="pincode" className="form-label">Pincode</label>
                                                                <input type="text" className="form-control" id="pincode" required />
                                                            </div>
                                                            <div className='mb-3'>
                                                                <label htmlFor="phone" className="form-label">Phone</label>
                                                                <input type="text" className="form-control" id="phone" required />
                                                            </div>
                                                        </form>
                                                    </div>

                                                    <div className="col-lg-6 col-12 py-5 border rounded">
                                                        <div>
                                                            <h4 className='pb-5'>Your Order</h4>
                                                            {/* <h5 className='text-coral pt-2 pb-3'>Cart Items</h5> */}
                                                            <div className="d-flex align-items-center mb-3">
                                                                <img src={modalProduct.imageURL} alt={modalProduct.name} style={{ width: "80px", height: "auto" }} />
                                                                <div className="ms-3">
                                                                    <h5>{modalProduct.name}</h5>
                                                                    <p>Quantity: {quantity}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div>
                                                                    <div className="d-flex justify-content-between">
                                                                        <h6 className='text-coral'>Subtotal</h6>
                                                                        <p>₹ {modalProduct.price * quantity}</p>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between">
                                                                        <h6 className='text-dark'>GST (18%)</h6>
                                                                        <p>₹ {(modalProduct.price * quantity * 0.18).toFixed(2)}</p>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between">
                                                                        <h6 className='text-dark'>Shipping Cost</h6>
                                                                        <p>Free</p>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between">
                                                                        <h6 className='text-dark fw-bold'>Total</h6>
                                                                        <p className='fw-bold'>₹ {(modalProduct.price * quantity + (modalProduct.price * quantity * 0.18)).toFixed(2)}</p>
                                                                    </div>
                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                        <h6 className='text-coral fw-bold'>Payment Method:</h6>
                                                                        <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                                                                            <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" onChange={() => setSelectedPaymentMethod("cod")} checked={selectedPaymentMethod === "cod"} />
                                                                            <label className="btn btn-outline-success fw-bold" htmlFor="btnradio1">COD</label>
                                                                            <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" onChange={() => setSelectedPaymentMethod("online")} checked={selectedPaymentMethod === "online"} />
                                                                            <label className="btn btn-outline-success fw-bold" htmlFor="btnradio2">Online Payment</label>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        {selectedPaymentMethod === "cod" ? (
                                                                            <button onClick={buytheproduct} className="btn w-100 btn-success fw-bold text-white animate__animated animate__fadeInUp">Place Order</button>
                                                                        ) : (
                                                                            <button className="btn w-100 btn-success fw-bold text-white animate__animated animate__fadeInUp">Proceed to Payment</button>
                                                                        )}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wires;
