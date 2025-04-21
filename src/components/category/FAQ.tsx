
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQProps {
  category?: string;
  className?: string;
}

const FAQ: React.FC<FAQProps> = ({ category = 'product', className }) => {
  const faqs = [
    {
      question: `How do I use these ${category} after purchase?`,
      answer: `After completing your purchase, you'll receive an email with detailed instructions on how to access and use your ${category}. You can also find this information in your account dashboard under "My Orders".`
    },
    {
      question: `What payment methods do you accept?`,
      answer: `We accept various payment methods including credit/debit cards, PayPal, and account balance. All transactions are secure and encrypted.`
    },
    {
      question: `Can I get a refund if the ${category} doesn't work?`,
      answer: `Yes, we offer a limited warranty on our ${category}s. If you experience any issues, please contact our support team within 24 hours of your purchase for assistance or a refund.`
    },
    {
      question: `How long does delivery take?`,
      answer: `As these are digital products, delivery is almost instant. You should receive your ${category} details within minutes of completing your purchase.`
    },
    {
      question: `Do you offer bulk discounts?`,
      answer: `Yes, we offer special pricing for bulk purchases. Please contact our sales team for more information on bulk orders.`
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FAQ;
