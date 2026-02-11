import React from 'react';
import '../styles/AwardWinning.css';

const AwardWinning = () => {
  const awards = [
    { id: 1, image: '/images/400_filter_nobg_669792cf8e6ab.webp' },
    { id: 2, image: '/images/400_filter_nobg_669792eaa6052.webp' },
    { id: 3, image: '/images/400_filter_nobg_669793028038b.webp' },
    { id: 4, image: '/images/400_filter_nobg_6697931475a4f.webp' },
    { id: 5, image: '/images/400_filter_nobg_669875b7abcda.webp' },
    { id: 6, image: '/images/400_filter_nobg_669875cddcd24.webp' }
  ];

  return (
    <section className="award-winning">
      <div className="award-container">
        <h2>Award Winning</h2>
        <div className="awards-grid">
          {awards.map((award) => (
            <div key={award.id} className="award-box">
              <img src={award.image} alt={`Award ${award.id}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AwardWinning;
