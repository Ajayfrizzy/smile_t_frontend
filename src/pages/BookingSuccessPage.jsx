import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingReceipt from './BookingReceipt';

const BookingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const status = searchParams.get('status');
      const txRef = searchParams.get('tx_ref');
      const transactionId = searchParams.get('transaction_id');

      // Check if payment was successful
      if (status !== 'successful') {
        setError('Payment was not successful. Please try again.');
        setLoading(false);
        return;
      }

      if (!txRef && !transactionId) {
        setError('Invalid payment reference. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        // Verify payment with backend - using /payments/verify endpoint
        const response = await apiRequest('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            tx_ref: txRef,
            transaction_id: transactionId,
          }),
        });

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          // Payment verified successfully
          // Fetch booking details
          const bookingResponse = await apiRequest(`/bookings/by-reference/${txRef}`);
          
          if (bookingResponse.ok) {
            const bookingData = await bookingResponse.json();
            setBooking(bookingData.booking || bookingData);
          } else {
            // Create a basic booking object from the payment data
            setBooking({
              transaction_ref: txRef,
              payment_status: 'paid',
              status: 'confirmed',
              total_amount: result.data?.amount || 0,
              reference: txRef,
            });
          }
        } else {
          setError('Payment verification failed. Please contact support with reference: ' + txRef);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify payment. Please contact support with reference: ' + txRef);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-[#7B3F00]">Verifying your payment...</p>
          <p className="text-sm text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#7B3F00] mb-4">Payment Verification Failed</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/booking')}
              className="w-full bg-[#7B3F00] text-white px-6 py-3 rounded hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full bg-gray-200 text-[#7B3F00] px-6 py-3 rounded hover:bg-gray-300 transition-colors duration-300"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="text-center mb-8">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-[#7B3F00] mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Your booking has been confirmed</p>
            </div>

            <BookingReceipt booking={booking} />

            <div className="mt-8 text-center space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                  <span className="text-2xl">📧</span>
                  <span>A confirmation email has been sent to <strong>{booking.guest_email}</strong></span>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Please check your inbox (and spam folder) for booking details
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#7B3F00] text-white px-6 py-3 rounded hover:bg-[#FFD700] hover:text-[#7B3F00] transition-colors duration-300"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => navigate('/rooms')}
                  className="bg-gray-200 text-[#7B3F00] px-6 py-3 rounded hover:bg-gray-300 transition-colors duration-300"
                >
                  View Rooms
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BookingSuccessPage;
