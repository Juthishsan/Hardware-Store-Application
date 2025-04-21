import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { ref, get, update } from 'firebase/database';
import Swal from 'sweetalert2';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loggedinuid, setloggedinuid] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderedItemsModalOpen, setOrderedItemsModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const uid = user.uid;
                setloggedinuid(uid);

                // Fetch orders only for the logged-in user
                const ordersRef = ref(db, 'orders');
                get(ordersRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const orderObject = snapshot.val();
                            const orderKeys = Object.keys(orderObject);
                            const orderEntries = orderKeys
                                .filter((key) => orderObject[key].uid === uid) // Filter orders by UID
                                .map((key) => ({
                                    key,
                                    ...orderObject[key],
                                }));
                            setOrders(orderEntries);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching orders:', error);
                    });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [loggedinuid]);


    const getorders = () => {
        const ordersRef = ref(db, 'orders');
        get(ordersRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const orderObject = snapshot.val();
                    const orderKeys = Object.keys(orderObject);
                    const orderEntries = orderKeys
                        .filter((key) => orderObject[key].uid === loggedinuid) // Filter orders by UID
                        .map((key) => ({
                            key,
                            ...orderObject[key],
                        }));
                    setOrders(orderEntries);
                }
            })
            .catch((error) => {
                console.error('Error fetching orders:', error);
            });
    }

    const cancelOrder = (orderKey) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it',
            background: 'white',
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
                    background: 'white',
                });
    
                // Fetch the order details
                const orderRef = ref(db, `orders/${orderKey}`);
                get(orderRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const orderData = snapshot.val();
                            const orderItems = orderData.items;
    
                            // Iterate over each product in the order and update the stock
                            orderItems.forEach((item) => {
                                const productRef = ref(db, `products/${item.productID}`);
                                get(productRef)
                                    .then((productSnapshot) => {
                                        if (productSnapshot.exists()) {
                                            const productData = productSnapshot.val();
                                            const newStock = productData.stock + item.quantity;
    
                                            // Update the stock quantity in the database
                                            update(productRef, { stock: newStock })
                                                .then(() => {
                                                    console.log(`Stock updated for product: ${item.productID}`);
                                                })
                                                .catch((error) => {
                                                    console.error('Error updating stock:', error);
                                                });
                                        }
                                    })
                                    .catch((error) => {
                                        console.error('Error fetching product details:', error);
                                    });
                            });
    
                            // Update the order status to "cancelled" in the Realtime Database
                            update(orderRef, { orderstatus: 'Cancelled' })
                                .then(() => {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Order cancelled successfully!',
                                        showConfirmButton: true,
                                        timer: 3000
                                    });
                                    getorders();
                                })
                                .catch((error) => {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error Cancelling the order',
                                        showConfirmButton: true,
                                        timer: 3000
                                    });
                                });
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching order details:', error);
                    });
            }
        });
    };
    

    const openOrderedItemsModal = (order) => {
        setSelectedOrder(order);
        setOrderedItemsModalOpen(true);
    };

    return (
        <div className='table-responsive'>
            <h2>Orders</h2>
            {orders.length > 0 ? (
                <table className='table table-striped'>
                    <thead>
                        <tr>
                            <th>Order Date</th>
                            <th>Total Price</th>
                            <th>Payment Method</th>
                            <th>Order Status</th>
                            <th>Ordered Items</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.key}>
                                <td>{order.orderDate}</td>
                                <td>{order.grandTotal.toFixed(2)}</td>
                                <td>{order.paymentMethod}</td>
                                <td>{order.orderstatus}</td>
                                <td>
                                <i className='bi bi-cart-fill px-5' onClick={() => openOrderedItemsModal(order)}></i>
                                </td>
                                <td>
                                    {order.orderstatus !== 'Cancelled'  && order.orderstatus !== 'Delivered' && (
                                        <button onClick={() => cancelOrder(order.key)}>Cancel Order</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No orders found.</p>
            )}

            {/* Modal for displaying ordered items */}
            {isOrderedItemsModalOpen && selectedOrder && (
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
                                                    <th>Product Image</th>
                                                    <th>Product Name</th>
                                                    <th>Quantity</th>
                                                    {/* Add more headers as needed */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td><img src={item.productImage} alt={item.productName} style={{width: '70px', height: '70px'}} /></td>
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
        </div>
    );
};

export default Orders;
