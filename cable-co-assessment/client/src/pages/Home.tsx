import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-4">
        Cable Co — Developer Assessment
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Welcome to the assessment environment. Navigate to the Service Requests
        page to see the example pattern, then build your Service Request Notes
        feature.
      </p>
      <Link href="/service-requests">
        <Button>View Service Requests →</Button>
      </Link>
    </div>
  );
}
