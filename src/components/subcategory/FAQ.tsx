
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  return (
    <div className="mt-12 space-y-4">
      <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Are these products guaranteed to work?</AccordionTrigger>
          <AccordionContent>
            Yes, all products come with a satisfaction guarantee. If you encounter any issues, our support team will assist you promptly.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How quickly will I receive my digital product?</AccordionTrigger>
          <AccordionContent>
            Delivery is automatic and immediate after successful payment. You'll receive access credentials directly in your account and via email.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
          <AccordionContent>
            We accept all major credit cards, PayPal, and account balance payments. All transactions are secure and encrypted.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default FAQ;
