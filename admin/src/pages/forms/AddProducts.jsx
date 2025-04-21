import React, { useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { db, storage } from '../../firebase';
import { ref as reference, uploadBytes, getDownloadURL } from 'firebase/storage';
import { push, ref } from 'firebase/database';

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

const AddProducts = ({ setaddproduct, getproducts, productTypes }) => {

    const productname = useRef();
    const productprice = useRef();
    const productstock = useRef();
    const producttype = useRef();
    const productrank = useRef();
    const productinfo = useRef();
    const [file, setFiles] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [isNewProductType, setIsNewProductType] = useState(false); // State to track if new product type is selected

    const handleFileChange = (e) => {
        const selectedFiles = e.target.files[0];
        setFiles(selectedFiles);
        setImagePreview(URL.createObjectURL(selectedFiles));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        Swal.fire({
            html: `
                <div className="">
                    <div className="spinner-border text-dark" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            background: 'transparent',
        });

        try {
            if (!file) {
                throw new Error("Please select a product image.");
            }

            const filename = generateRandomString(15);
            const imageRef = reference(storage, 'productimages/' + filename);
            await uploadBytes(imageRef, file);
            const downloadURL = await getDownloadURL(imageRef);

            const productpath = ref(db, 'products');
            const product = {
                name: productname.current ? productname.current.value : '',
                price: productprice.current ? productprice.current.value : '',
                rank: productrank.current ? productrank.current.value : '',
                type: isNewProductType ? (producttype.current ? producttype.current.value : '') : (producttype.current && producttype.current.options[producttype.current.selectedIndex] ? producttype.current.options[producttype.current.selectedIndex].text : ''),
                stock: parseInt(productstock.current ? productstock.current.value : 0), // Convert to integer
                info: productinfo.current ? productinfo.current.value : '',
                imageURL: downloadURL,
            };
            push(productpath, product);

            Swal.fire({
                icon: 'success',
                title: 'Product Upload Successful',
                showConfirmButton: true,
                confirmButtonColor: 'black',
            });

            // Reset form fields and hide loading spinner
            if (productname.current) productname.current.value = "";
            if (productrank.current) productrank.current.value = "";
            if (isNewProductType && producttype.current) producttype.current.value = "";
            if (productprice.current) productprice.current.value = "";
            if (productinfo.current) productinfo.current.value = "";
            if (productstock.current) productstock.current.value = ""; // Reset stock input
            setFiles([]);
            setImagePreview(null);
            setaddproduct();
            getproducts();
        } catch (error) {
            console.error("Error uploading file:", error);
            Swal.fire({
                icon: 'error',
                title: 'Product Upload Unsuccessful',
                text: error.message,
                showConfirmButton: true,
                confirmButtonColor: 'black',
            });
        }
    };


    const handleProductTypeChange = () => {
        setIsNewProductType(producttype.current.value === "new");
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className=''>
                <div className='row mt-4'>
                    <div className='col-md-6 mb-3'>
                        <label className='mb-2 fw-bold'>Product Image</label>
                        <input
                            accept="image/*"
                            type="file"
                            onChange={handleFileChange}
                            className="input-field"
                            style={{ paddingTop: "12px" }}
                            required
                            id="image"
                        />
                    </div>
                    <div className='col-md-6 mb-3'>
                        {imagePreview && <img src={imagePreview} alt="Product Preview" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }} />}
                    </div>
                    <div className='col-md-6 mb-3'>
                        <label className='mb-2 fw-bold'>Product Name</label>
                        <input className='input-field' placeholder='Product Name' ref={productname} required />
                    </div>
                    <div className='col-md-6 mb-3'>
                        <label className='mb-2 fw-bold'>Product Stock</label>
                        <input className='input-field' placeholder='Product Stock' ref={productstock} type="number" min="0" required />
                    </div>
                    <div className='col-md-6 mb-3'>
                        <label className='mb-2 fw-bold'>Product Price</label>
                        <input className='input-field' placeholder='Product Price' ref={productprice} type="number" min="0" required />
                    </div>
                    {isNewProductType || productTypes.length === 0 ? (
                        <div className='col-md-6 mb-3'>
                            <label className='mb-2 fw-bold'>New Product Type</label>
                            <input className='input-field' placeholder='New Product Type' ref={producttype} />
                        </div>
                    ) : (
                        <div className='col-md-6 mb-3'>
                            <label className='mb-2 fw-bold'>Product Type</label>
                            <select ref={producttype} className='input-field' onChange={handleProductTypeChange}>
                                <option value="">Select Type</option>
                                {productTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                                <option value="new">New Type</option>
                            </select>
                        </div>
                    )}

                    {/* <div className='col-md-6 mb-4 fw-bold'>
                        <label className='mb-2'>Product Rank</label>
                        <input className='input-field' placeholder='Product Rank' ref={productrank} required />
                    </div> */}
                    <div className='col-md-6 mb-4 fw-bold'>
                        <label className='mb-2'>Product Description</label>
                        <textarea className='input-field pt-2' placeholder='Product Description' ref={productinfo} required rows={5}></textarea>
                    </div>

                </div>
                <div className='col-md-12 mb-4 px-5 text-center'>
                    <button className='submit' type='submit'>Submit</button>
                </div>
            </form>
        </div>
    );
};

export default AddProducts;
