import React, { useEffect, useRef } from 'react';
import '../styles/AwardWinning.css';

const AwardWinning = () => {
  const titleRef = useRef(null);
  const boxRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    boxRefs.current.forEach((box) => {
      if (box) observer.observe(box);
    });

    return () => observer.disconnect();
  }, []);

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
        <h2 ref={titleRef} className="bounce-in">Award Winning</h2>
        <div className="awards-grid">
          {awards.map((award, index) => (
            <div 
              key={award.id} 
              className="award-box fade-in-up"
              ref={(el) => (boxRefs.current[index] = el)}
            >
              <img src={award.image} alt={`Award ${award.id}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AwardWinning;
