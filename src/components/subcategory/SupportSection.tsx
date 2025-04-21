
import React from 'react';
import { Headphones, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SupportSection = () => {
  return (
    <Card className="border border-gray-200 shadow-sm mt-12">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <Headphones className="mr-2 h-5 w-5 text-primary" /> 
          Need Help?
        </CardTitle>
        <CardDescription>
          Our support team is ready to assist you 24/7
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="flex-1 gap-2">
          <MessageSquare className="h-4 w-4" />
          Live Chat
        </Button>
        <Button variant="default" className="flex-1">
          Contact Support
        </Button>
      </CardContent>
    </Card>
  );
}

export default SupportSection;
