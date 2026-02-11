import React from 'react';
import '../styles/AwardWinning.css';

const AwardWinning = () => {
  const awards = [
    { id: 1, icon: '🏆', title: 'Best Innovation' },
    { id: 2, icon: '⭐', title: 'Excellence Award' },
    { id: 3, icon: '🥇', title: 'Industry Leader' },
    { id: 4, icon: '🎯', title: 'Top Performance' },
    { id: 5, icon: '💯', title: 'Quality Standard' },
    { id: 6, icon: '🔥', title: 'Rising Star' }
  ];

  return (
    <section className="award-winning">
      <div className="award-container">
        <h2>Award Winning</h2>
        <div className="awards-grid">
          {awards.map((award) => (
            <div key={award.id} className="award-box">
              <div className="award-icon">{award.icon}</div>
              <h3>{award.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AwardWinning;
