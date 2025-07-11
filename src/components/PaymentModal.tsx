'use client';

import React, { useState } from 'react';
import { paymentService, PaymentResult } from '@/services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  onPaymentSuccess: (result: PaymentResult) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  coursePrice,
  onPaymentSuccess
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = paymentService.formatCardNumber(e.target.value);
    setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate card details
    const validation = paymentService.validateCardDetails(cardDetails);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const result = await paymentService.enrollWithPayment(courseId, cardDetails);
      onPaymentSuccess(result);
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Payment failed. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        {/* Course Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold">{courseTitle}</h3>
          <p className="text-2xl font-bold text-green-600">${coursePrice}</p>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          {/* Card Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardDetails.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={19}
              required
            />
            {cardDetails.cardNumber && (
              <p className="text-xs text-gray-500 mt-1">
                {paymentService.getCardType(cardDetails.cardNumber)}
              </p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={cardDetails.expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails(prev => ({ 
                  ...prev, 
                  cvv: e.target.value.replace(/\D/g, '').slice(0, 4) 
                }))}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardDetails.cardholderName}
              onChange={(e) => setCardDetails(prev => ({ 
                ...prev, 
                cardholderName: e.target.value 
              }))}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              {errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Pay $${coursePrice}`}
          </button>
        </form>

        {/* Security Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          🔒 This is a mock payment system for demonstration purposes
        </p>
      </div>
    </div>
  );
}
