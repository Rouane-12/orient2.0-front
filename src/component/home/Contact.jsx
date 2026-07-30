import React from 'react';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import {PhEnvelopeDuotone,PhMapPinArea,PhPhone} from '../../uikits/Icons'
import "../../style/component/Contact.scss"

function Contact ()  {

  return (
    <>
    <div className='Contact'>
        <h2 className='titres'>Contact</h2>
       <div className='c-elements'>
         <h1>
           Nos informations 
         </h1>
         <b>
         Nous aimerions avoir de vos nouvelles.
         </b>
          <section>
            <span>
            <PhEnvelopeDuotone/>
            <b>Assistance par e-mail</b>
            <p>Notre équipe peut répondre en temps réel.</p>
            <a href="">djossouvirouane6@gmail.com</a>
            </span>
            <span>
            <PhMapPinArea/>
            <b>On taff en freelance </b>
            <p>Visitez notre emplacement en temps réel.</p>
            <a href="">Freelance</a>
            </span>
            <span>
            <PhPhone/>
            <b>Appelez-nous directement</b>
            <p>Disponible pendant les heures de travail.</p>
            <a href="">+2290146449300</a>
            </span>
          </section>
       </div>
    </div>
     
    </>
  );
};

export default Contact;
