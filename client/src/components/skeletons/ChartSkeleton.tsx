import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[250px] mt-2" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PieChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[250px] mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
