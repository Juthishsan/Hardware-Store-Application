import React, { useEffect, useState } from 'react';
import AllProducts from './AllProducts';
import ProductInfo from './ProductInfo';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';

const Products = () => {
    const [selectedProduct, setSelectedProduct] = useState("Wires");
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const handleProductClick = (productName) => {
        setSelectedProduct(productName);
    };

    const handleShowAllProducts = () => {
        setSelectedProduct(null);
    };

    useEffect(() => {
        fetchProducts();
    }, []);


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


    return (
        <div className='container-fluid'>
            <div className="row">


                <div className="col-12 col-lg-2 d-lg-block d-none col-auto col-sm-2 bg-white d-flex flex-column justify-content-between min-vh-100">
                    <div className="mt-2">
                        <div className='text-center'>
                            <a className="text-decoration-none d-flex align-items-center text-black" role="button">
                                <span className=''>Product Categories</span>
                            </a>
                            <hr className=''></hr>
                        </div>

                        <ul className="nav nav-pills flex-column" id="parentM">
                            <li className="nav-item">
                                <button className="nav-link text-black btn" onClick={handleShowAllProducts}>All Products</button>
                            </li>
                            <li className="nav-item my-1">
                                <a href="#submenu1" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                    <span className=''>Finolex</span>
                                    <i className='bi bi-arrow-down-short'></i>
                                </a>

                                <ul className="nav collapse ms-2 flex-column" id="submenu1" data-bs-parent="#parentM">
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Wires")}>Wires</button>
                                    </li>
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Cables")}>Cables</button>
                                    </li>
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Pipes")}>Pipes</button>
                                    </li>
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Fittings")}>Fittings</button>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item my-1">
                                <a href="#submenu2" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                    <span className=''>Hitachi</span>
                                    <i className='bi bi-arrow-down-short'></i>
                                </a>
                                <ul className="nav collapse ms-2 flex-column dropup" id="submenu2" data-bs-parent="#parentM">
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Drill")}>Drill Machine</button>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item my-1">
                                <a href="#submenu3" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                    <span className=''>Bosch</span>
                                    <i className='bi bi-arrow-down-short'></i>
                                </a>
                                <ul className="nav collapse ms-2 flex-column dropup" id="submenu3" data-bs-parent="#parentM">
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("BoschDrill")}>Drill Machine</button>
                                    </li>
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Heatgun")}>Heat Gun</button>
                                    </li>
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Heatgun")}>Air Bowler</button>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item my-1">
                                <a href="#submenu4" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                    <span className=''>Fenner</span>
                                    <i className='bi bi-arrow-down-short'></i>
                                </a>
                                <ul className="nav collapse ms-2 flex-column dropup" id="submenu4" data-bs-parent="#parentM">
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Belts")}>Belts</button>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item my-1">
                                <a href="#submenu5" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                    <span className=''>Diamond</span>
                                    <i className='bi bi-arrow-down-short'></i>
                                </a>
                                <ul className="nav collapse ms-2 flex-column dropup" id="submenu5" data-bs-parent="#parentM">
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Chains")}>Chains</button>
                                    </li>
                                </ul>
                            </li>

                            <li className="nav-item my-1">
                                <a href="#submenu6" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                    <span className=''>SKF</span>
                                    <i className='bi bi-arrow-down-short'></i>
                                </a>
                                <ul className="nav collapse ms-2 flex-column dropup" id="submenu6" data-bs-parent="#parentM">
                                    <li className="li nav-item mt-1">
                                        <button className="nav-link text-black btn" onClick={() => handleProductClick("Bearing")}>Bearing</button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>



                <div className="d-lg-none d-block">
                    <nav className="navbar text-bg-white">
                        <div className="container-fluid">

                            <div className='d-flex flex-row justify-content-center'>
                                <h4 className="px-2" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
                                    <span className="navbar-toggler-icon my-1"></span>  Products List
                                </h4>
                            </div>

                            <div className="offcanvas offcanvas-start text-bg-white w-75" tabIndex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
                                <div className="offcanvas-header">
                                    <button type="button" className="btn-close btn-close-dark" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                                </div>
                                <div className="offcanvas-body">

                                    <div className="col-auto  bg-white d-flex flex-column justify-content-between min-vh-100">
                                        <div className="mt-2">
                                            <div className='align-items-center text-center'>
                                                <a className="text-center text-decoration-none d-flex align-items-center text-black" role="button">
                                                    <span className=''>Product Categories</span>
                                                </a>
                                                <hr className=''></hr>
                                            </div>

                                            <ul className="nav nav-pills flex-column" id="parentM">
                                                <li className="nav-item">
                                                    <button className="nav-link text-black btn" onClick={handleShowAllProducts}>All Products</button>
                                                </li>
                                                <li className="nav-item my-1">
                                                    <a href="#submenu1" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                                        <span className=''>Finolex</span>
                                                        <i className='bi bi-arrow-down-short'></i>
                                                    </a>

                                                    <ul className="nav collapse ms-2 flex-column" id="submenu1" data-bs-parent="#parentM">
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Wires")}>Wires</button>
                                                        </li>
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Wires")}>Cables</button>
                                                        </li>
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Pipes")}>Pipes</button>
                                                        </li>
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Fittings")}>Fittings</button>
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li className="nav-item my-1">
                                                    <a href="#submenu2" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                                        <span className=''>Hitachi</span>
                                                        <i className='bi bi-arrow-down-short'></i>
                                                    </a>
                                                    <ul className="nav collapse ms-2 flex-column dropup" id="submenu2" data-bs-parent="#parentM">
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Drill")}>Drill Machine</button>
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li className="nav-item my-1">
                                                    <a href="#submenu3" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                                        <span className=''>Bosch</span>
                                                        <i className='bi bi-arrow-down-short'></i>
                                                    </a>
                                                    <ul className="nav collapse ms-2 flex-column dropup" id="submenu3" data-bs-parent="#parentM">
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("BoschDrill")}>Drill Machine</button>
                                                        </li>
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Heatgun")}>Heat Gun</button>
                                                        </li>
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Heatgun")}>Air Bowler</button>
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li className="nav-item my-1">
                                                    <a href="#submenu4" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                                        <span className=''>Fenner</span>
                                                        <i className='bi bi-arrow-down-short'></i>
                                                    </a>
                                                    <ul className="nav collapse ms-2 flex-column dropup" id="submenu4" data-bs-parent="#parentM">
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Belts")}>Belts</button>
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li className="nav-item my-1">
                                                    <a href="#submenu5" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                                        <span className=''>Diamond</span>
                                                        <i className='bi bi-arrow-down-short'></i>
                                                    </a>
                                                    <ul className="nav collapse ms-2 flex-column dropup" id="submenu5" data-bs-parent="#parentM">
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Chains")}>Chains</button>
                                                        </li>
                                                    </ul>
                                                </li>

                                                <li className="nav-item my-1">
                                                    <a href="#submenu6" className="nav-link text-black d-flex justify-content-between align-items-center" data-bs-toggle="collapse" aria-current="page">
                                                        <span className=''>SKF</span>
                                                        <i className='bi bi-arrow-down-short'></i>
                                                    </a>
                                                    <ul className="nav collapse ms-2 flex-column dropup" id="submenu6" data-bs-parent="#parentM">
                                                        <li className="li nav-item mt-1">
                                                            <button className="nav-link text-black btn" onClick={() => handleProductClick("Bearing")}>Bearing</button>
                                                        </li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </nav>

                </div>






                <main role="main" className="col-lg-10 col-md-12 px-md-4 col-12">

                    <div className='text-center pt-3'>
                        <h3 className='pt-2'>Our Products</h3>
                        <hr className="mx-auto" />
                        <p>Here you can check our new products with fair prices</p>
                    </div>

                    {selectedProduct ? (
                        <ProductInfo productType={selectedProduct} />
                    ) : (
                        <AllProducts />
                    )}

                </main>

            </div>
        </div>
    );
};

export default Products;
