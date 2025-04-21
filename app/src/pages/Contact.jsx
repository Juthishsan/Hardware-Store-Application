import React, { useRef } from 'react'
import { onValue, ref, push } from 'firebase/database';
import { db } from '../firebase';
import Swal from 'sweetalert2';

const Contact = () => {


  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      subject: subjectRef.current.value,
      message: messageRef.current.value,
    };

    // Push data to the Realtime Database
    const databaseRef = ref(db, 'contactForms');
    push(databaseRef, formData);

    Swal.fire({
      icon: "success",
      title: "Submitted Successfully",
      showConfirmButton: true, confirmButtonColor: 'black', confirmButtonColor: 'black',
      timer: 3000
    })
    nameRef.current.value = '';
    emailRef.current.value = '';
    subjectRef.current.value = '';
    messageRef.current.value = '';
  };


  return (
    <div className='container pb-5 my-5'>
      <div className='row my-5'>
        <div className='col-12 col-lg-6'>
          <section id="contact-details" className="section-p1 container">
            <div className="details">
              <span className='fw-bold'>GET IN TOUCH</span>
              <h2>Visit our store or contact us today</h2>
              <h3>Location</h3>
              <div>
                <li>
                  <i className="fa fa-map" />
                  <p>61B, Natesa Gounder Street, Muthur Road, Vellakovil - 638111.</p>
                </li>
                <li>
                  <i className="fa fa-envelope" />
                  <p>sivarajvkl@gmail.com</p>
                </li>
                <li>
                  <i className="fa fa-phone" />
                  <p>Phone : +91 96888 08708 <br /><br />
                    Office : 04257 260083</p>
                </li>
                <li>
                  <i className="fa fa-clock" />
                  <p>Monday to Saturday : 7:00 AM - 10:00 PM <br /><br />
                    Sunday : 7:00 AM - 2:30 PM
                  </p>
                </li>
              </div>
            </div>
          </section>
        </div>
        <div className='col-12 col-lg-6'>
          <div className="map pt-5">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3166.2934956457793!2d77.71193770156479!3d10.947332185702578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba99ae5a48d47fb%3A0x5c28a8662861f0a3!2sSIVARAJ%26CO%20VELLAKOVIL!5e0!3m2!1sen!2sin!4v1705856264701!5m2!1sen!2sin"
              className='w-100'
              height={450}
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>



    </div>
  )
}

export default Contact