
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const AccountStatsLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((index) => (
        <Card key={index}>
          <CardContent className="p-6 flex items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <Skeleton className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AccountStatsLoader;
