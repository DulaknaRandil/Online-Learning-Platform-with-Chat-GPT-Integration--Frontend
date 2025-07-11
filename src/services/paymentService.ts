import { API_BASE_URL } from '@/constants';

export interface PaymentSession {
  paymentSessionId: string;
  amount: number;
  currency: string;
  courseId: string;
  courseTitle: string;
  paymentUrl: string;
}

export interface PaymentResult {
  transactionId: string;
  status: string;
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
}

export interface PaymentVerification {
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
  verifiedAt: string;
}

class PaymentService {
  private baseUrl = `${API_BASE_URL}/payment`;

  /**
   * Initiate a payment for a course
   */
  async initiatePayment(courseId: string): Promise<PaymentSession> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ courseId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initiate payment');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Process a payment
   */
  async processPayment(sessionId: string, courseId: string, cardDetails?: Record<string, unknown>): Promise<PaymentResult> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/process/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        courseId,
        ...(cardDetails && { cardDetails })
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment processing failed');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<PaymentVerification> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseUrl}/verify/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify payment');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Complete enrollment flow with payment (for paid courses)
   */
  async enrollWithPayment(courseId: string, cardDetails?: Record<string, unknown>): Promise<PaymentResult> {
    try {
      // Step 1: Initiate payment
      const paymentSession = await this.initiatePayment(courseId);
      
      // Step 2: Process payment (this is mock, so it will always succeed)
      const paymentResult = await this.processPayment(
        paymentSession.paymentSessionId, 
        courseId, 
        cardDetails
      );
      
      return paymentResult;
    } catch (error) {
      console.error('Error in payment enrollment flow:', error);
      throw error;
    }
  }

  /**
   * Simulate card validation (for UI feedback)
   */
  validateCardDetails(cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic card number validation (Luhn algorithm would be better)
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Invalid card number');
    }

    // Expiry date validation
    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      errors.push('Invalid expiry date (MM/YY format required)');
    } else {
      const [month, year] = cardDetails.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.push('Invalid month in expiry date');
      }
      
      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.push('Card has expired');
      }
    }

    // CVV validation
    if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
      errors.push('Invalid CVV');
    }

    // Cardholder name validation
    if (!cardDetails.cardholderName || cardDetails.cardholderName.trim().length < 2) {
      errors.push('Invalid cardholder name');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format card number for display
   */
  formatCardNumber(cardNumber: string): string {
    // Remove all non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Add spaces every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  }

  /**
   * Get card type from card number
   */
  getCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || (cleaned.startsWith('2') && cleaned.length >= 2)) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    if (cleaned.startsWith('6')) return 'Discover';
    
    return 'Unknown';
  }
}

export const paymentService = new PaymentService();
