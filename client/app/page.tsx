import { ProjectedRoute } from "./auth/ProjctedRoute";
import LandingPage from "./components/LandingPage";

export default function Home() {
  return (
    <ProjectedRoute>
      <LandingPage />
    </ProjectedRoute>
  );
}
