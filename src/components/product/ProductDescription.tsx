
interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm w-full transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/40 hover:scale-[1.01] hover:translate-y-[-4px]">
      <h2 className="text-xl font-semibold mb-4">Description</h2>
      <div 
        className="prose max-w-none text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};
