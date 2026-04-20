import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import ExamplePage from "./pages/ExamplePage";

/**
 * Main application routes.
 *
 * YOUR TASK: You may optionally add a route here to display
 * your ServiceNotesPanel component, or embed it within ExamplePage.
 */
export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/service-requests" component={ExamplePage} />
      </Switch>
    </div>
  );
}
