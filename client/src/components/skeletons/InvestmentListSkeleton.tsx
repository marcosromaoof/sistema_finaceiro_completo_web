import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InvestmentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-6 w-[100px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-[80px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

export function InvestmentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <InvestmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
