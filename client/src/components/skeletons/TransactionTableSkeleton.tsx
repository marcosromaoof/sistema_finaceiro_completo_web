import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-[80px]" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export function TransactionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-9 w-[120px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {Array.from({ length: rows }).map((_, i) => (
            <TransactionRowSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
