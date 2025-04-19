
interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Description</h2>
      <div 
        className="prose max-w-none text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};
