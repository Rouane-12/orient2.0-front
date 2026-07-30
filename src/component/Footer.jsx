import React from 'react'
import { PhGithubLogo, PhTwitterLogo, PhLinkedinLogo, PhEnvelopeDuotone } from '../uikits/Icons'
import '../style/component/Footer.scss'

function Footer() {
    return (
      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            
            <span>Orient<span style={{ color: "#ffb37a" }}>+</span></span>
          </div>
          <div className="footer-links">
            <a href="#pourquoi">Pourquoi</a>
            <a href="#fonctionnement">Fonctionnement</a>
            <a href="#universites">Universités</a>
            <a href="#temoignages">Témoignages</a>
          </div>
          <div className="footer-social">
            <a href="#" aria-label="Github"><PhGithubLogo size={18} /></a>
            <a href="#" aria-label="Twitter"><PhTwitterLogo size={18} /></a>
            <a href="#" aria-label="LinkedIn"><PhLinkedinLogo size={18} /></a>
            <a href="#" aria-label="Email"><PhEnvelopeDuotone size={18} /></a>
          </div>
        </div>
      </footer>
    ) 
  }
  
  export default Footer;
  

