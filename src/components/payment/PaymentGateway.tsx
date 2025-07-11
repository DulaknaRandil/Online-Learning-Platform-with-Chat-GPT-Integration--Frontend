import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

// Define custom Alert components since they might not exist
const Alert = ({ variant, className, children }: { 
  variant?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`p-4 rounded-md ${variant === 'destructive' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'} ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

// Define custom RadioGroup components
const RadioGroup = ({ 
  className,
  children
}: { 
  className?: string;
  children: React.ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <div className={className} role="radiogroup">
    {children}
  </div>
);

const RadioGroupItem = ({ 
  value,
  id 
}: { 
  value: string;
  id: string;
}) => (
  <input
    type="radio"
    id={id}
    name="paymentMethod"
    value={value}
    aria-label={`Select ${id} payment method`}
    className="w-4 h-4 accent-blue-600"
  />
);

interface PaymentDetails {
  paymentMethod: string;
  amount: number;
  currency: string;
  transactionId: string;
  paidAt: string;
  last4?: string;
}

interface PaymentGatewayProps {
  coursePrice: number;
  courseName: string;
  onPaymentComplete: (paymentDetails: PaymentDetails) => void;
  onCancel: () => void;
}

export default function PaymentGateway({ coursePrice, courseName, onPaymentComplete, onCancel }: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Free course doesn't need payment details
  const isFree = coursePrice <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsProcessing(true);
      
      // For free courses, complete immediately
      if (isFree) {
        const freePaymentDetails = {
          paymentMethod: 'free',
          amount: 0,
          currency: 'USD',
          transactionId: `free_${Date.now()}`,
          paidAt: new Date().toISOString()
        };
        
        // Short delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onPaymentComplete(freePaymentDetails);
        return;
      }
      
      // Validate card details for paid courses
      if (paymentMethod === 'credit_card') {
        if (!cardNumber || cardNumber.length < 16) {
          throw new Error('Please enter a valid card number');
        }
        
        if (!cardName) {
          throw new Error('Please enter the cardholder name');
        }
        
        if (!expiry || !expiry.includes('/')) {
          throw new Error('Please enter a valid expiry date (MM/YY)');
        }
        
        if (!cvv || cvv.length < 3) {
          throw new Error('Please enter a valid CVV code');
        }
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock payment response
      const paymentDetails = {
        paymentMethod,
        amount: coursePrice,
        currency: 'USD',
        transactionId: `txn_${Date.now()}`,
        paidAt: new Date().toISOString(),
        last4: cardNumber ? cardNumber.slice(-4) : undefined
      };
      
      onPaymentComplete(paymentDetails);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date (MM/YY)
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isFree ? 'Enroll in Free Course' : 'Payment Details'}</CardTitle>
        <CardDescription>
          {isFree
            ? `You're enrolling in the free course: ${courseName}`
            : `Complete your payment of $${coursePrice.toFixed(2)} for ${courseName}`
          }
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!isFree && (
            <>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="flex flex-col space-y-2 mb-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit_card" id="credit_card" />
                  <Label htmlFor="credit_card" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Credit / Debit Card
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center">
                    💳 PayPal
                  </Label>
                </div>
              </RadioGroup>
              
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        required
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'paypal' && (
                <div className="bg-blue-50 p-4 rounded-md mt-4 text-center">
                  <p>You will be redirected to PayPal to complete your payment after submission.</p>
                </div>
              )}
            </>
          )}
          
          {isFree && (
            <div className="bg-green-50 p-4 rounded-md text-center">
              <p>This is a free course. Click the button below to complete your enrollment!</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          
          <Button type="submit" disabled={isProcessing}>
            {isProcessing 
              ? 'Processing...' 
              : isFree 
                ? 'Complete Free Enrollment' 
                : `Pay $${coursePrice.toFixed(2)}`
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
