
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MessageCircle } from 'lucide-react';

interface SupportSectionProps {
  className?: string;
}

export const SupportSection: React.FC<SupportSectionProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Need Help?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Email Support</h3>
            <p className="text-sm text-muted-foreground">
              Get support via email within 24 hours
            </p>
            <a href="mailto:support@digitaldealshub.com" className="text-sm text-primary hover:underline mt-1 inline-block">
              support@digitaldealshub.com
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Phone Support</h3>
            <p className="text-sm text-muted-foreground">
              Available Monday-Friday, 9AM-5PM EST
            </p>
            <a href="tel:+18001234567" className="text-sm text-primary hover:underline mt-1 inline-block">
              +1 (800) 123-4567
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Live Chat</h3>
            <p className="text-sm text-muted-foreground">
              Chat with our support team in real-time
            </p>
            <button className="text-sm text-primary hover:underline mt-1">
              Start Chat
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportSection;
