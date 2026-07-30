import React from 'react';
import Slider from 'react-slick';
import '../style/component/Avis.scss';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import {PhQuotesFill} from '../uikits/Icons'

const Avis = () => {
  const avis = [
    { 
      commentaires: "Grâce à Orient+, j'ai pu identifier facilement les formations qui correspondent à mes résultats et mes centres d’intérêt. L’outil est intuitif et complet.",
      name: "Sophie Martin" 
    },
    { 
      commentaires: "Orient+ m’a aidé à découvrir des filières que je ne connaissais pas du tout. Les fiches métiers sont très détaillées et m’ont permis de mieux me projeter.",
      name: "Yacine Boudiaf" 
    },
    { 
      commentaires: "Avec Orient+, j’ai pu comparer différentes universités et formations en quelques clics. Ça m’a évité des semaines de recherches sur Internet.",
      name: "Emma Girard" 
    },
    { 
      commentaires: "Les simulateurs et les tests de personnalité m’ont beaucoup aidé à faire un choix réfléchi pour mes études post-bac.",
      name: "Mehdi Benali" 
    },
    { 
      commentaires: "Orient+ centralise toutes les informations nécessaires à l’orientation : conditions d’admission, débouchés, avis d’anciens étudiants... C’est hyper pratique.",
      name: "Fatima Zahra El Idrissi" 
    },
    { 
      commentaires: "J’ai beaucoup apprécié les webinaires proposés par Orient+. Les échanges avec les conseillers m’ont vraiment rassuré sur mes choix.",
      name: "Thomas Morel" 
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <>
    {/* <h2>Avis etudiant</h2> */}
    <section className="avis-slider">
      <Slider {...settings}>
        {avis.map(({ commentaires, name }, index) => (
          <div className="slide" key={index}>
            <PhQuotesFill/>
            <p className="commentaires"> {commentaires}</p>
            <p className="name">— {name}</p>
          </div>
        ))}
      </Slider>
    </section>
    </>
  );
};

export default Avis;
