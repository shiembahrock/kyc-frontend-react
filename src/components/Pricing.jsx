import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultFeatures = {
    1: [
      'ID Verification',
      'AML (Anti-money laundering)',
      'PEP (Politically Exposed Person)',
      'Sanctions list',
      'Adverse Media Screening'
    ],
    2: [
      'ID Verification',
      'AML (Anti-money laundering)',
      'PEP (Politically Exposed Person)',
      'Sanctions list',
      'Adverse Media Screening',
      '** Bulk deal above 10 searches at USD 8 / search'
    ],
    3: [
      'ID Verification',
      'AML (Anti-money laundering)',
      'PEP (Politically Exposed Person)',
      'Sanctions list',
      'Adverse Media Screening',
      '** Subscription based, USD 500 setup + USD 500 credit @USD 5 / search'
    ]
  };

  const defaultPlans = [
    {
      id: 1,
      name: 'Starter',
      price: 'USD$29.00',
      features: defaultFeatures[1],
      popular: false,
      sortOrder: 1
    },
    {
      id: 2,
      name: 'Professional',
      price: 'USD$79.00',
      features: defaultFeatures[2],
      popular: true,
      sortOrder: 2
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 'USD$199.00',
      features: defaultFeatures[3],
      popular: false,
      sortOrder: 3
    }
  ];

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        // const response = await fetch('https://ht8c7p7tt4.execute-api.us-east-1.amazonaws.com/dev/service-prices', {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   }
        // });

        const response = await fetch(
            'https://ht8c7p7tt4.execute-api.us-east-1.amazonaws.com/dev/service-prices'
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to pricing plans
        const transformedPlans = data.map((item, index) => {
          const planIndex = index + 1;
          const formattedPrice = `${item.currency_code}${item.currency_symbol}${parseFloat(item.price).toFixed(2)}`;
          
          return {
            id: item.service_price_id,
            name: item.service_name,
            price: formattedPrice,
            features: defaultFeatures[planIndex] || defaultFeatures[1],
            popular: planIndex === 2,
            sortOrder: item.sort_order
          };
        });

        // Sort by sort_order
        transformedPlans.sort((a, b) => a.sortOrder - b.sortOrder);
        setPlans(transformedPlans);
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing data:', err);
        setError(err.message);
        // Use default plans when API fails
        setPlans(defaultPlans);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  if (loading && plans.length === 0) {
    return (
      <section id="pricing" className="pricing">
        <div className="pricing-container">
          <h2>Pricing Plans</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>Loading pricing plans...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="pricing">
      <div className="pricing-container">
        <h2>Pricing Plans</h2>
        <div className="pricing-grid">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">{plan.price}</span>
              </div>
              <ul className="features">
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    {feature.startsWith('**') ? '' : '✓ '}
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className="pricing-button"
                onClick={() => navigate(`/complete-order/${plan.id}`)}
                disabled={plan.sortOrder !== 1}
              >
                ORDER NOW
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Pricing;