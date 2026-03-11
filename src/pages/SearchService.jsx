import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../context/ToastContext';
import { AuthValidationByTokenAndGuestAccountID } from '../utils/auth';
import { API_BASE_URL } from '../config';
import '../styles/SearchService.css';

function SearchService() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get('ordercode');
  const hasValidated = useRef(false);
  const { showToast } = useToast();
  const [serviceName, setServiceName] = useState('');
  const [searchRemaining, setSearchRemaining] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouData, setThankYouData] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [assessmentId, setAssessmentId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [showStartSearch, setShowStartSearch] = useState(false);
  const [serviceInfoData, setServiceInfoData] = useState(null);

  const getQuestion = async (assessmentId) => {
    try {
      setLoadingText('Loading questions...');
      setIsProcessing(true);
      setAssessmentId(assessmentId);
      const response = await fetch(`${API_BASE_URL}/muinmos/question/${assessmentId}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (data.statusCode === 200) {
        if (!data.body.result || data.body.result.length === 0 || data.body.result === 'completed') {
          setShowThankYou(true);
        } else {
          generateFormFields(data.body.result);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      showToast('Error loading questions', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFormFields = (questions) => {
    const fields = questions.map(field => {
      let inputType = 'text';
      let required = true;
      let maxLength = field.maxSize;
      let pattern = null;
      let labelText = field.questionText.trim();

      switch (field.type) {
        case 'Text':
          inputType = 'text';
          required = true;
          labelText += ' *';
          break;
        case 'Optional':
          inputType = 'text';
          required = false;
          break;
        case 'OptionalDate':
          inputType = 'date';
          required = false;
          pattern = field.regEx;
          break;
        default:
          inputType = 'text';
          required = true;
          labelText += ' *';
      }

      return {
        questionId: field.questionId,
        type: inputType,
        required,
        maxLength,
        pattern,
        label: labelText,
        value: ''
      };
    });

    setFormFields(fields);
  };

  const SubmitMuinmosAnswer = async (answer) => {
    try {
      setLoadingText('Submitting your answers...');
      setIsProcessing(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      
      const response = await fetch(`${API_BASE_URL}/muinmos/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'GuestAccountId': userInfo.guest_account_id,
          'GuestLoginToken': userInfo.token
        },
        body: JSON.stringify(answer)
      });

      const data = await response.json();
      
      if (response.ok) {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        
        if (!data.body.result || data.body.result.length === 0 || (typeof data.body.result === 'string' && data.body.result.toLowerCase() === 'completed')) {
          if (serviceInfoData) {
            const dataAssessmentsLength = serviceInfoData.order_code_info.order_assessments.length;
            const searchRemaining = serviceInfoData.order_code_info.search_number - dataAssessmentsLength;
            setThankYouData({
              searchRemaining,
              searchNumber: serviceInfoData.order_code_info.search_number,
              isSearchByCredit: serviceInfoData.order_code_info.is_search_by_credit
            });
          }
          setShowThankYou(true);
        } else if (Array.isArray(data.body.result)) {
          //generateFormFields(data.body.result);
          getQuestion(answer.assessment_id);
        } else {
          if (serviceInfoData) {
            const dataAssessmentsLength = serviceInfoData.order_code_info.order_assessments.length;
            const searchRemaining = serviceInfoData.order_code_info.search_number - dataAssessmentsLength;
            setThankYouData({
              searchRemaining,
              searchNumber: serviceInfoData.order_code_info.search_number,
              isSearchByCredit: serviceInfoData.order_code_info.is_search_by_credit
            });
          }
          setShowThankYou(true);
        }
      } else {
        showToast(data.body.error, 'error');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      showToast('Error submitting answer', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const invalidFields = formFields.filter(field => field.required && !field.value.trim());
    
    if (invalidFields.length > 0) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const payload = {
      assessment_id: assessmentId,
      answer: formFields.map(field => ({
        questionId: field.questionId,
        responseKeys: [],
        text: field.value,
        uploadResponseModels: []
      }))
    };

    SubmitMuinmosAnswer(payload);
  };

  const handleFieldChange = (questionId, value) => {
    setFormFields(prev => prev.map(field => 
      field.questionId === questionId ? { ...field, value } : field
    ));
  };

  const create_muinmos_assessment_by_guest_account = async () => {
    try {
      setLoadingText('Creating new assessment...');
      setIsProcessing(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      
      const response = await fetch(`${API_BASE_URL}/muinmos/create-assessment-by-guest-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'GuestAccountId': userInfo.guest_account_id,
          'GuestLoginToken': userInfo.token
        },
        body: JSON.stringify({ order_code: orderCode })
      });

      const data = await response.json();

      if (response.ok) {
        userInfo.expiry_on = data.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        setShowStartSearch(false);
        GetServiceInfoByOrderCode(orderCode);
      } else {
        showToast('Failed to create new assessment, please contact the Administrator', 'error');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      showToast('Failed to create new assessment, please contact the Administrator', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const GetServiceInfoByOrderCode = async (orderCode) => {
    try {
      setLoadingText('Loading service information...');
      setIsProcessing(true);
      const userInfo = JSON.parse(localStorage.getItem('_userLoggedInInfo'));
      
      const resInfo = await fetch(`${API_BASE_URL}/service-info/${orderCode}`, {
        method: 'GET',
        headers: {
          'GuestAccountId': userInfo.guest_account_id,
          'GuestLoginToken': userInfo.token
        }
      });

      const serviceInfoByOrderCode = await resInfo.json();
      setServiceInfoData(serviceInfoByOrderCode);

      if (!resInfo.ok) {
        if (resInfo.status === 401) {
          showToast(serviceInfoByOrderCode.message, 'error');
          window.location.href = window.location.origin;
        } else if (resInfo.status === 204) {
          showToast(serviceInfoByOrderCode.message, 'error');
        } else {
          showToast('There was an error, please contact Administrator.', 'error');
        }
      } else {
        userInfo.expiry_on = serviceInfoByOrderCode.token_expiry_on;
        localStorage.setItem('_userLoggedInInfo', JSON.stringify(userInfo));
        
        const dataAssessmentsLength = serviceInfoByOrderCode.order_code_info.order_assessments.length;
        
        setServiceName(serviceInfoByOrderCode.order_code_info.service_name);
        
        if (serviceInfoByOrderCode.order_code_info.payment_status.trim().toLowerCase() === 'unpaid') {
          showToast('Please complete your payment to continue this process', 'warning');
          return false;
        } else if (serviceInfoByOrderCode.order_code_info.email.trim() !== userInfo.email) {
          showToast('Invalid account for existing order', 'error');
          return false;
        } else if (serviceInfoByOrderCode.order_code_info.usage_status === 0) {
          showToast('Order status are unuseable', 'error');
          return false;
        } else if (serviceInfoByOrderCode.order_code_info.payment_status.trim().toLowerCase() === 'paid' && serviceInfoByOrderCode.order_code_info.usage_status === 2) {
          const searchRemaining = serviceInfoByOrderCode.order_code_info.search_number - dataAssessmentsLength;
          setThankYouData({
            searchRemaining,
            searchNumber: serviceInfoByOrderCode.order_code_info.search_number,
            isSearchByCredit: serviceInfoByOrderCode.order_code_info.is_search_by_credit
          });
          setShowThankYou(true);
          return false;
        } else if (serviceInfoByOrderCode.order_code_info.payment_status.trim().toLowerCase() === 'paid' && 
                   serviceInfoByOrderCode.order_code_info.checkout_session_status.trim().toLowerCase() === 'complete' && 
                   serviceInfoByOrderCode.order_code_info.usage_status === 1) {
          
          if (!serviceInfoByOrderCode.order_code_info.is_search_by_credit) {
            if (serviceInfoByOrderCode.order_code_info.search_number > 1) {
              const remaining = serviceInfoByOrderCode.order_code_info.search_number - dataAssessmentsLength;
              setSearchRemaining(remaining <= 1 ? `${remaining} new search remaining` : `${remaining} new searches remaining`);
            }
            
            if (dataAssessmentsLength <= 0) {
              // divSearchButton.style.display = "block" - ignore for now
              setShowStartSearch(true);
            } else {
              if (serviceInfoByOrderCode.order_code_info.search_number >= dataAssessmentsLength) {
                if (!serviceInfoByOrderCode.order_code_info.order_assessments[dataAssessmentsLength - 1].is_complete) {
                  getQuestion(serviceInfoByOrderCode.order_code_info.order_assessments[dataAssessmentsLength - 1].assessment_id);
                } else {
                  if (serviceInfoByOrderCode.order_code_info.search_number > dataAssessmentsLength) {
                    // divSearchButton.style.display = "block" - ignore for now
                    setShowStartSearch(true);
                  } else {
                    const searchRemaining = serviceInfoByOrderCode.order_code_info.search_number - dataAssessmentsLength;
                    setThankYouData({
                      searchRemaining,
                      searchNumber: serviceInfoByOrderCode.order_code_info.search_number,
                      isSearchByCredit: serviceInfoByOrderCode.order_code_info.is_search_by_credit
                    });
                    setShowThankYou(true);
                    return false;
                  }
                }
              }
            }
          } else {
            // subscribe package - ignore for now
          }
        }
      }
    } catch (error) {
      console.error('Error fetching service info:', error);
      showToast('There was an error, please contact Administrator.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('_userLoggedInInfo');
    if (!userInfo) {
      navigate('/');
      return;
    }

    if (!orderCode || orderCode.trim() === '') {
      showToast('Order code is missing! Please check your link.', 'error');
    } else {
      GetServiceInfoByOrderCode(orderCode);
    }

    if (hasValidated.current) return;
    
    const validateAuth = async () => {
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        if (parsed.guest_account_id && parsed.token) {
          hasValidated.current = true;
          await AuthValidationByTokenAndGuestAccountID(parsed.token, parsed.guest_account_id);
          window.dispatchEvent(new Event('storage'));
        }
      }
    };
    validateAuth();
  }, [orderCode, navigate, showToast]);

  return (
    <>
      <Navbar />
      <div className="search-service-page">
        <div className="search-service-container">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Home
          </button>
          <h1>{serviceName || 'Search Service'}</h1>
          {showThankYou ? (
            <div className="thank-you-message">
              <h2>🎉 Thank You!</h2>
              <p>Your assessment has been completed successfully.</p>
              <p>The PDF report sent to your email.</p>
              {thankYouData && !thankYouData.isSearchByCredit && thankYouData.searchNumber > 1 && thankYouData.searchNumber > thankYouData.searchRemaining && (
                <div className="continue-search">
                  <p className="remaining-text">
                    You have {thankYouData.searchRemaining > 1 ? `${thankYouData.searchRemaining} new searches` : `${thankYouData.searchRemaining} new search`} remaining.
                  </p>
                  <button className="continue-btn" onClick={() => window.location.href = `${window.location.origin}/Search-Service?ordercode=${orderCode}`}>
                    Continue Search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {searchRemaining && (
                <div className="search-remaining-display">
                  <strong>Search Remaining:</strong> {searchRemaining}
                </div>
              )}
              {showStartSearch && (
                <button className="start-search-btn" onClick={create_muinmos_assessment_by_guest_account}>Start Search</button>
              )}
              {formFields.length > 0 && (
                <form className="dynamic-form" onSubmit={handleSubmit}>
                  {formFields.map(field => (
                    <div key={field.questionId} className="form-field">
                      <label>{field.label}</label>
                      <input
                        type={field.type}
                        required={field.required}
                        maxLength={field.maxLength}
                        pattern={field.pattern || undefined}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.questionId, e.target.value)}
                      />
                    </div>
                  ))}
                  <div className="form-buttons">
                    <button type="button" className="back-form-btn">Back</button>
                    <button type="submit" className="next-form-btn">Next</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="modal-overlay loading-overlay">
          <div className="loading-modal">
            <div className="spinner"></div>
            <h2>{loadingText}</h2>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

export default SearchService;
