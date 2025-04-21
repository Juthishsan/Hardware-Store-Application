import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { ref, get, remove, set, push, runTransaction } from 'firebase/database';
import Swal from 'sweetalert2';
import { onAuthStateChanged } from 'firebase/auth';
import { encode as base64encode } from 'base-64';


const Cart = ({ componentrender }) => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalCartPrice, setTotalCartPrice] = useState(0);
  const [data, setdata] = useState();
  const [loggedinuid, setloggedinuid] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [paytmentmodal, setpaymentmodal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        setloggedinuid(uid);

        const userRef = ref(db, 'users/' + uid + '/profile');
        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              setloggedinuid(uid);
              const userData = snapshot.val();
              setdata(userData);
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




  useEffect(() => {
    const dataRef = ref(db, 'users/' + loggedinuid + '/cart');
    get(dataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const dataObject = snapshot.val();
          const dataKeys = Object.keys(dataObject);
          const dataEntries = dataKeys.map((key) => ({
            key,
            ...dataObject[key],
          }));
          setTableData(dataEntries);
        }
      })
      .catch((error) => {
        console.error('Error fetching cart data:', error);
      });
  }, [loggedinuid]);




  useEffect(() => {
    const fetchProductDetails = async () => {
      const productDetails = [];

      for (const entry of tableData) {
        const productRef = ref(db, 'products/' + entry.productID);

        try {
          const productSnapshot = await get(productRef);

          if (productSnapshot.exists()) {
            const productData = productSnapshot.val();

            productDetails.push({
              key: entry.key,
              productID: entry.productID,
              productImage: productData.imageURL,
              productName: productData.name,
              productPrice: productData.price,
              quantity: entry.quantity,
            });
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }

      setFilteredData(productDetails);
    };

    fetchProductDetails();
  }, [tableData]);


  useEffect(() => {
    if (totalCartPrice < 500) {
      setShippingCost(50);
    } else {
      setShippingCost(0);
    }
  }, [totalCartPrice]);


  useEffect(() => {
    calculateTotalCartPrice();
  }, [filteredData]);



  const calculateTotalCartPrice = () => {
    let total = 0;

    for (const productDetails of filteredData) {
      total += productDetails.productPrice * productDetails.quantity;
    }

    setTotalCartPrice(total);
  };


  const fetchfromcart = () => {
    const dataRef = ref(db, 'users/' + loggedinuid + '/cart');
    get(dataRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const dataObject = snapshot.val();
          const dataKeys = Object.keys(dataObject);
          const dataEntries = dataKeys.map((key) => ({
            key,
            ...dataObject[key],
          }));
          setTableData(dataEntries);
        }
      })
      .catch((error) => {
        console.error('Error fetching cart data:', error);
      });
  };


  const handleQuantityChange = (key, newQuantity) => {
    // Update the quantity in the Realtime Database
    const cartItemRef = ref(db, `users/${loggedinuid}/cart/${key}`);

    // Use transaction to update the quantity without removing other properties
    runTransaction(cartItemRef, (currentData) => {
      return { ...currentData, quantity: parseInt(newQuantity, 10) || 1 };
    })
      .then(() => {
        console.log(`Quantity updated for key ${key}. New quantity: ${newQuantity}`);
      })
      .catch((error) => {
        console.error('Error updating quantity:', error);
      });
  };


  const decrease = (key) => {
    // Decrease the quantity in the Realtime Database
    const cartItemRef = ref(db, `users/${loggedinuid}/cart/${key}`);

    // Use transaction to update the quantity without removing other properties
    runTransaction(cartItemRef, (currentData) => {
      if (!currentData || currentData.quantity === null) {
        // If currentData is null or quantity is null, return currentData
        return currentData;
      }

      const currentQuantity = currentData.quantity;

      // Ensure quantity does not go below 1
      const newQuantity = Math.max(1, currentQuantity - 1);

      return { ...currentData, quantity: newQuantity };
    })
      .then(() => {
        console.log(`Quantity decreased for key ${key}.`);
        // Fetch updated cart data after quantity update
        fetchfromcart();
        Swal.close();
      })
      .catch((error) => {
        console.error('Error updating quantity:', error);
      });

    // Update local state immediately for better responsiveness
    setFilteredData(prevData => {
      return prevData.map(item => {
        if (item.key === key) {
          return { ...item, quantity: Math.max(1, item.quantity - 1) };
        }
        return item;
      });
    });
  };

  const increase = (key) => {
    // Increase the quantity in the Realtime Database
    const cartItemRef = ref(db, `users/${loggedinuid}/cart/${key}`);

    // Use transaction to update the quantity without removing other properties
    runTransaction(cartItemRef, (currentData) => {
      if (currentData) {
        const currentQuantity = currentData.quantity || 0;
        const newQuantity = currentQuantity + 1;
        return { ...currentData, quantity: newQuantity };
      } else {
        console.error('Error: currentData is null.');
        return null;
      }
    })
      .then(() => {
        // Fetch updated cart data after quantity update
        fetchfromcart();
        Swal.close();
        console.log(`Quantity increased for key ${key}.`);
      })
      .catch((error) => {
        console.error('Error updating quantity:', error);
      });

    // Update local state immediately for better responsiveness
    setFilteredData(prevData => {
      return prevData.map(item => {
        if (item.key === key) {
          return { ...item, quantity: (item.quantity || 0) + 1 };
        }
        return item;
      });
    });
  };



  const deletecartitem = (cartKey) => {
    Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to delete this item from the cart?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
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

        setFilteredData((prevData) => prevData.filter((item) => item.key !== cartKey));

        const cartItemRef = ref(db, 'users/' + loggedinuid + '/cart/' + cartKey);

        remove(cartItemRef)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Item removed from the cart',
              showConfirmButton: true,
              timer: 3000
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error removing item from the cart:',
              showConfirmButton: true,
              timer: 3000
            });
            console.error('Error removing item from the cart:', error);
          });
      }
    });
  };


  const clearCart = (loggedinuid) => {
    // Reference to the user's cart
    const cartRef = ref(db, `users/${loggedinuid}/cart/`);

    // Remove the entire cart
    remove(cartRef)
      .then(() => {
        console.log('Cart cleared successfully!');
      })
      .catch((error) => {
        console.error('Error clearing the cart:', error);
      });
  };


  const handleProceedToCheckout = () => {
    // Check if the cart is empty
    if (filteredData.length === 0) {
      // Display a warning to the user
      Swal.fire({
        icon: 'warning',
        title: 'Your cart is empty',
        text: 'Please add items to your cart before proceeding to checkout',
        showConfirmButton: true,
      });
      return; // Exit the function
    }
    setpaymentmodal(true);
    // Proceed with the checkout process...
  };


  const updateStock = (productDetails) => {
    productDetails.forEach((product) => {
      const productRef = ref(db, `products/${product.productID}`);

      get(productRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const currentStock = snapshot.val().stock;
            const updatedStock = currentStock - product.quantity;
            if (updatedStock >= 0) {
              set(ref(db, `products/${product.productID}/stock`), updatedStock)
                .then(() => {
                  console.log(`Stock updated for product ${product.productID}. New stock: ${updatedStock}`);
                })
                .catch((error) => {
                  console.error('Error updating stock:', error);
                });
            } else {
              console.error(`Error: Insufficient stock for product ${product.productID}`);
            }
          } else {
            console.error(`Error: Product ${product.productID} not found`);
          }
        })
        .catch((error) => {
          console.error('Error fetching product details:', error);
        });
    });
  };


  const sendWhatsappMessage = async (orderDetails) => {
    const { orderDate, items, total, grandTotal, paymentMethod, address } = orderDetails;

    // Construct the message body with order details
    let messageBody = `Order Details:\n\n`;
    messageBody += `Order Date: ${orderDate}\n\n`;
    messageBody += `Items:\n`;
    items.forEach((product, index) => {
      messageBody += `${index + 1}. ${product.productName} - Qty: ${product.quantity}\n`;
    });
    messageBody += `\nTotal: ₹ ${total}\n`;
    messageBody += `Grand Total: ₹ ${grandTotal}\n`;
    messageBody += `Payment Method: ${paymentMethod}\n\n`;

    messageBody += `Delivery Address:\n`;
    messageBody += `Name: ${address.firstName} ${address.lastName}\n`;
    messageBody += `City: ${address.city}\n`;
    messageBody += `State: ${address.state}\n`;
    messageBody += `Address: ${address.address}\n`;
    messageBody += `Pincode: ${address.pincode}\n`;
    messageBody += `Phone: ${address.phone}\n`;

    // Construct the Twilio API request
    const twilioUrl = process.env.REACT_APP_TWILIO_ID;
    const credentials = 'AC1e1a19c88f9fe54b01f012134028a347:be042dede79a856601429ff67fb35127';
    const to = `whatsapp:+919965929856`;
    const from = 'whatsapp:+14155238886'; // Your Twilio WhatsApp number
    const body = messageBody;
    const base64Credentials = base64encode(credentials);

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
        console.log("Message sent to user. SID:", data.sid);
      } else {
        console.error("Twilio API Error:", data.message);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message to user:", error);
    }
  };


  const sendUserOrderConfirmation = async (orderDetails) => {
    const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/AC1e1a19c88f9fe54b01f012134028a347/Messages.json';
    const credentials = 'AC1e1a19c88f9fe54b01f012134028a347:be042dede79a856601429ff67fb35127';
    const to = `whatsapp:+91${orderDetails.address.phone}`;
    const from = 'whatsapp:+14155238886';
    const body = `
      Hello ${orderDetails.address.firstName},
  
      Your order has been placed successfully!
  
      Order Details:
      Order Date: ${orderDetails.orderDate}
      Total Price: ₹${orderDetails.total}
      Grand Total (incl. GST and shipping): ₹${orderDetails.grandTotal}
      Payment Method: ${orderDetails.paymentMethod}
      Order Status: ${orderDetails.orderstatus}
  
      Shipping Address:
      ${orderDetails.address.firstName} ${orderDetails.address.lastName}
      ${orderDetails.address.address}
      ${orderDetails.address.city}, ${orderDetails.address.state} - ${orderDetails.address.pincode}
      Phone: ${orderDetails.address.phone}
  
      Thank you for shopping with us!
    `;
    const base64Credentials = base64encode(credentials);

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
        console.log("Message sent to user. SID:", data.sid);
      } else {
        console.error("Twilio API Error:", data.message);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message to user:", error);
    }
  };


  const cashOnDelivery = async () => {

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

    const phoneRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!phoneRegex.test(phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid phone number',
        text: 'Please enter a valid 10-digit phone number',
        showConfirmButton: true,
      });
      return;
    }

    if (!pincodeRegex.test(pincode)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid pincode',
        text: 'Please enter a valid 6-digit pincode',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid name',
        text: 'Please enter a valid name (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(city) || !nameRegex.test(state)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid city or state',
        text: 'Please enter a valid city or state name (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(address)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid address',
        text: 'Please enter a valid address (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    const stockPromises = filteredData.map(async (product) => {
      const productRef = ref(db, `products/${product.productID}`);
      const productSnapshot = await get(productRef);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.val();
        if (productData.stock < product.quantity) {
          // If quantity exceeds stock, show error message and prevent order placement
          Swal.fire({
            icon: 'error',
            title: `Not enough stock available for ${product.productName}`,
            text: `Available stock: ${productData.stock}`,
            showConfirmButton: true,
          });
          return false;
        }
      }
      return true;
    });

    const stockResults = await Promise.all(stockPromises);

    // If any product quantity exceeds stock, return early and do not proceed with order placement
    if (stockResults.includes(false)) {
      return;
    }


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

    const productDetails = filteredData;

    let totalWithGST = (totalCartPrice + (totalCartPrice * 0.18)).toFixed(2);

    // Calculate shipping cost
    const shippingCost = totalCartPrice < 500 ? 50 : 0;
    totalWithGST += shippingCost;

    const orderDetails = {
      orderDate,
      items: productDetails,
      total: totalCartPrice,
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
      clearCart(loggedinuid);
      setpaymentmodal(false);
      fetchfromcart();
      updateStock(productDetails);
      componentrender("Cart");
      setTimeout(() => {
        window.location.reload();
      }, 3000);

      // Send WhatsApp message to the admin
      await sendWhatsappMessage(orderDetails);


      // Send WhatsApp message to the user
      await sendUserOrderConfirmation(orderDetails);

      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully',
        showConfirmButton: true,
      });
    } catch (error) {
      console.error('Error placing the order:', error);
    }
  };


  const onlinePayment = async () => {
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

    const phoneRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!phoneRegex.test(phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid phone number',
        text: 'Please enter a valid 10-digit phone number',
        showConfirmButton: true,
      });
      return;
    }

    if (!pincodeRegex.test(pincode)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid pincode',
        text: 'Please enter a valid 6-digit pincode',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid name',
        text: 'Please enter a valid name (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(city) || !nameRegex.test(state)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid city or state',
        text: 'Please enter a valid city or state name (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }

    if (!nameRegex.test(address)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid address',
        text: 'Please enter a valid address (only alphabets and spaces allowed)',
        showConfirmButton: true,
      });
      return;
    }


    const addressInfo = {
      firstName,
      lastName,
      city,
      state,
      address,
      pincode,
      phone,
    };

    // Calculate totalWithGST
    let totalWithGST = totalCartPrice + (totalCartPrice * 0.18);

    // Calculate shipping cost
    const shippingCost = totalCartPrice < 500 ? 50 : 0;
    totalWithGST += shippingCost;

    var options = {
      key: "rzp_test_9t45F6uqof6zxQ",
      key_secret: "juz4o22naJGLuiaCt8z5SlEG",
      amount: parseInt(totalWithGST * 100), // Using totalWithGST instead of totalCartPrice
      currency: "INR",
      order_receipt: 'order_rcptid_' + loggedinuid,
      name: firstName + ' ' + lastName,
      description: "for testing purpose",
      handler: function (response) {
        console.log(response)
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful',
          showConfirmButton: false,
          timer: 2000
        });

        const paymentId = response.razorpay_payment_id;

        const orderDetails = {
          orderDate: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }),
          items: filteredData,
          total: totalCartPrice,
          grandTotal: totalWithGST,
          paymentId,
          paymentMethod: "online",
          uid: loggedinuid,
          orderstatus: "Processing",
          address: addressInfo
        }

        try {
          const ordersRef = ref(db, 'orders');
          push(ordersRef, orderDetails);
          clearCart(loggedinuid); // Clear cart after successful order placement
          setpaymentmodal(false); // Close payment modal
          fetchfromcart(); // Fetch updated cart data
          updateStock(filteredData); // Update stock
          componentrender("Cart");
          setTimeout(() => {
            window.location.reload();
          }, 3000);

          // Send WhatsApp message to the admin
          sendWhatsappMessage(orderDetails);

          // Send WhatsApp message to the user
          sendUserOrderConfirmation(orderDetails);
        } catch (error) {
          console.log(error)
        }
      },
      theme: {
        color: "#3399cc"
      }
    };

    var pay = new window.Razorpay(options);
    pay.open();
  }


  return (
    <div className='d-flex flex-column '>

      <section id="cart-container" className="container my-5">
        <div className="table-wrapper">
          <table width="100%" className="cart-table">
            <thead>
              <tr>
                <td>Remove</td>
                <td>Product Image</td>
                <td>Product Name</td>
                <td>Price</td>
                <td>Quantity</td>
                <td>Total</td>
              </tr>
            </thead>

            {filteredData.length > 0 ? (
              <tbody>
                {filteredData.map((productDetails) => (
                  <tr key={productDetails.key}>
                    <td>
                      <i
                        onClick={() => deletecartitem(productDetails.key)}
                        className="fas fa-trash-alt"
                      ></i>
                    </td>
                    <td>
                      <img
                        src={productDetails?.productImage}
                        alt={productDetails?.productName}
                        className='img-fluid'
                      />
                    </td>
                    <td>{productDetails?.productName}</td>
                    <td>₹ {productDetails?.productPrice}</td>
                    <td>
                      <div className="quantity-container px-5">
                        <button className="quantity-btn" onClick={() => decrease(productDetails.key)}>
                          <i className="fas fa-minus"></i>
                        </button>
                        <input
                          className="quantity-input"
                          value={productDetails?.quantity || 1}
                          type="number"
                          onChange={(e) => handleQuantityChange(productDetails.key, e.target.value)}
                        />
                        <button className="quantity-btn" onClick={() => increase(productDetails.key)}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </td>

                    <td>₹ {(productDetails?.productPrice || 0) * (productDetails?.quantity || 1)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="5" className="text-end py-3 pe-2">Total Cart Price</td>
                  <td>₹ {totalCartPrice}</td>
                </tr>
              </tbody>
            ) : (
              <p className='text-center mt-3'>No items found in the cart.</p>
            )}
          </table>
        </div>
      </section>

      <section id="cart-bottom" class="container pb-5">
        <div class="row">
          <div class="total col-lg-12 col-md-12 col-12">
            <div>
              <h5>Cart Total</h5>
              <div class="d-flex justify-content-between">
                <h6>Subtotal</h6>
                <p>₹ {totalCartPrice}</p>
              </div>
              <div class="d-flex justify-content-between">
                <h6>GST (18%)</h6>
                <p>₹ {totalCartPrice * 0.18}</p>
              </div>
              {filteredData.length > 0 && ( // Check if there are products in the cart
                <div class="d-flex justify-content-between">
                  <h6>Shipping Cost</h6>
                  {totalCartPrice < 500 ? (
                    <p>₹ 50</p>
                  ) : (
                    <p>Free</p>
                  )}
                </div>
              )}
              <div class="d-flex justify-content-between">
                <h6>Total</h6>
                <p>₹ {(totalCartPrice + (totalCartPrice * 0.18) + (totalCartPrice < 500 && filteredData.length > 0 ? 50 : 0)).toFixed(2)}</p>
              </div>
              <hr class="second-hr" />
              <div className='d-flex justify-content-between'>
                <h6>Grand Total</h6>
                <p>₹ {(totalCartPrice + (totalCartPrice * 0.18) + (totalCartPrice < 500 && filteredData.length > 0 ? 50 : 0)).toFixed(2)}</p>
              </div>
              <div className=''>
                <button class="or-button mx-auto" onClick={handleProceedToCheckout} >Proceed to checkout</button>
              </div>
            </div>
          </div>

        </div>
      </section>


      {paytmentmodal && (
        <div>
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
              <div className="modal-dialog modal-fullscreen border-0 modal-dialog-centered">
                <div className="modal-content text-bg-green border-dark rounded-4">
                  <div className="modal-body">
                    <div className='d-flex flex-row justify-content-between pb-3'>
                      <h5 className='animate__animated animate__fadeInDown text-center fw-bold'>
                        Order Confirmation
                      </h5>
                      <h5 className='animate__animated animate__fadeInUp' onClick={() => setpaymentmodal(false)}>
                        <i className="bi bi-x-circle-fill"></i>
                      </h5>
                    </div>

                    <div className='d-flex flex-column justify-content-between ' style={{ height: "80vh" }}>
                      <div>
                        <div className='container pb-5' >
                          <div className="row">
                            <div className=" col-lg-6 col-12">

                              <form className="border border rounded p-3 shadow-lg">
                                <h5 className="text-dark pt-3 pb-3 fw-bold">Customer Detail</h5>
                                <div className='mb-3 row'>
                                  <div className="col">
                                    <label htmlFor="firstName" className="form-label text-dark">
                                      <i className="bi bi-person-fill"></i> First Name
                                    </label>
                                    <input type="text" className="form-control rounded border-dark" id="firstName" required />
                                  </div>
                                  <div className="col">
                                    <label htmlFor="lastName" className="form-label text-dark">
                                      <i className="bi bi-person-fill"></i> Last Name
                                    </label>
                                    <input type="text" className="form-control rounded border-dark" id="lastName" required />
                                  </div>
                                </div>
                                <div className='mb-3 row'>
                                  <div className="col">
                                    <label htmlFor="pincode" className="form-label text-dark">
                                      <i className="bi bi-geo-alt-fill"></i> Pincode
                                    </label>
                                    <input type="text" className="form-control rounded border-dark" id="pincode" required />

                                  </div>
                                  <div className="col">
                                    <label htmlFor="phone" className="form-label text-dark">
                                      <i className="bi bi-telephone-fill"></i> Phone
                                    </label>
                                    <input type="text" className="form-control rounded border-dark" id="phone" required />

                                  </div>
                                </div>
                                <div className='mb-3'>
                                  <label htmlFor="address" className="form-label text-dark">
                                    <i className="bi bi-house-fill"></i> Address
                                  </label>
                                  <textarea className="form-control rounded border-dark" id="address" required></textarea>
                                </div>
                                <div className='mb-3'>
                                  <label htmlFor="city" className="form-label text-dark">
                                    <i className="bi bi-geo-alt-fill"></i> City
                                  </label>
                                  <input type="text" className="form-control rounded border-dark" id="city" required />
                                </div>
                                <div className='mb-3'>
                                  <label htmlFor="state" className="form-label text-dark">
                                    <i className="bi bi-geo-alt-fill"></i> State
                                  </label>
                                  <input type="text" className="form-control rounded border-dark" id="state" required />
                                </div>
                              </form>
                            </div>


                            <div className="col-lg-6 col-12 pt-4 border rounded shadow">
                              <div>
                                <h4 className='pt-3 pb-3'>Your Order</h4>
                                <h5 className='text-dark pb-3'>Cart Items</h5>
                                <div className='border shadow-sm'>
                                  {filteredData.map((product) => (
                                    <div className="d-flex align-items-center mb-3" key={product.key}>
                                      <img src={product.productImage} alt={product.productName} style={{ width: "80px", height: "auto" }} />
                                      <div className="ms-3">
                                        <h5>{product.productName}</h5>
                                        <p>Quantity - {product.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div>
                                  <div className="d-flex justify-content-between pt-3">
                                    <h6 className='text-dark'>Subtotal</h6>
                                    <p>₹ {totalCartPrice}</p>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <h6 className='text-dark'>GST</h6>
                                    <p>₹ {totalCartPrice * 0.18}</p>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <h6 className='text-dark'>Shipping Cost</h6>
                                    <p>{shippingCost === 0 ? "Free" : `₹ ${shippingCost}`}</p>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <h6 className='text-dark fw-bold'>Total</h6>
                                    <p className='fw-bold'>₹ {(totalCartPrice + (totalCartPrice * 0.18 + shippingCost)).toFixed(2)}</p>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className='text-dark fw-bold'>Payment Method</h6>
                                    <div className="dropdown">
                                      <button className="button btn-outline-success dropdown-toggle fw-bold" type="button" id="paymentDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                        {selectedPaymentMethod === '' ? 'Select Payment Method' : selectedPaymentMethod === 'cod' ? 'Cash On Delivery' : 'Online Payment'}
                                      </button>
                                      <ul className="dropdown-menu" aria-labelledby="paymentDropdown">
                                        <li><button className="dropdown-item payment-option" onClick={() => setSelectedPaymentMethod("cod")}>Cash On Delivery</button></li>
                                        <li><button className="dropdown-item payment-option" onClick={() => setSelectedPaymentMethod("online")}>Online Payment</button></li>
                                      </ul>
                                    </div>
                                  </div>

                                  <div className='text-center p-4'>
                                    {selectedPaymentMethod === "cod" ? (
                                      <button onClick={() => cashOnDelivery()} className="or-button btn-success fw-bold text-white animate__animated animate__fadeInUp">Place Order</button>
                                    ) : (
                                      <button onClick={() => onlinePayment()} className="or-button  btn-success fw-bold text-white animate__animated animate__fadeInUp">Proceed to Payment</button>
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

export default Cart;
