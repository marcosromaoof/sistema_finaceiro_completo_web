import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </div>
  );
}
