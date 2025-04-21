import React, { useEffect, useState } from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsCartFill } from 'react-icons/bs'
import { db } from '../firebase';
import { get, ref, limitToLast, orderByChild } from 'firebase/database';
import DataTable from 'react-data-table-component';


const Dashboard = () => {

    const [productCount, setProductCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchRecentOrders();
    }, []);


    const fetchDashboardData = () => {
        const productRef = ref(db, '/products');
        get(productRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const products = snapshot.val();
                    const productKeys = Object.keys(products);
                    setProductCount(Object.keys(products).length);

                    const categories = new Set();
                    productKeys.forEach((key) => {
                        categories.add(products[key].type);
                    });
                    setCategoryCount(categories.size);
                }
            })
            .catch((error) => {
                console.error('Error fetching dashboard data:', error);
            });

        const orderRef = ref(db, '/orders');
        get(orderRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const dataObject = snapshot.val();
                    setOrderCount(Object.keys(dataObject).length);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });


        const userRef = ref(db, '/users');
        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const dataObject = snapshot.val();
                    const dataKeys = Object.keys(dataObject);
                    setCustomerCount(Object.keys(dataObject).length);
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    };


    const fetchRecentOrders = () => {
        const orderRef = ref(db, '/orders');
        get(orderRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const dataObject = snapshot.val();
                    const dataKeys = Object.keys(dataObject);
                    const dataEntries = dataKeys.map((key) => ({
                        key,
                        ...dataObject[key],
                    }));
                    dataEntries.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Sort by order date in descending order
                    setRecentOrders(dataEntries.slice(0, 10)); // Get the last ten orders
                }
            })
            .catch((error) => {
                console.error('Error fetching recent orders:', error);
            });
    };



    const columns = [
        {
            name: 'Order Date',
            selector: 'orderDate',
            sortable: true,
        },
        {
            name: 'User ID',
            selector: 'uid',
        },
        {
            name: 'Total Amount',
            selector: 'grandTotal',
            sortable: true,
        },
        {
            name: 'Payment Method',
            selector: 'paymentMethod',
        },
        {
            name: 'Order Status',
            selector: 'orderstatus',
        },
    ];






    return (
        <div className="main-container">
            <div className='main-title'>
                <h3>Dashboard</h3>
            </div>

            <div className='main-cards'>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>PRODUCTS</h3>
                        <BsFillArchiveFill className='card_icon' />
                    </div>
                    <h1>{productCount}</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>CATEGORIES</h3>
                        <BsFillGrid3X3GapFill className='card_icon' />
                    </div>
                    <h1>{categoryCount}</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>CUSTOMERS</h3>
                        <BsPeopleFill className='card_icon' />
                    </div>
                    <h1>{customerCount}</h1>
                </div>
                <div className='card'>
                    <div className='card-inner'>
                        <h3>ORDERS</h3>
                        <BsCartFill className='card_icon' />
                    </div>
                    <h1>{orderCount}</h1>
                </div>
            </div>

            <div className='pt-3'>
                <h3>Recent Orders</h3>
                <div style={{ overflowX: 'auto', height: "70vh" }}>
                    <DataTable
                        className="table table-bordered table-striped "
                        columns={columns}
                        data={recentOrders}
                        highlightOnHover
                        pointerOnHover
                        striped

                    />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
