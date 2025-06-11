// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Notifications from "layouts/notifications";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import AIAssistantLayout from "layouts/ai-assistant";
import Messagerie from "layouts/messagerie";

// @mui icons
import Icon from "@mui/material/Icon";

// Professional Development components
import SkillsAssessment from "components/Skills/SkillsAssessment";
import CareerPlanning from "components/Career/CareerPlanning";
import TrainingRecommendations from "components/Training/TrainingRecommendations";
import ProfessionalNetwork from "components/Networking/ProfessionalNetwork";
import ProfileManager from "components/Profile/ProfileManager";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Assistant IA",
    key: "ai-assistant",
    icon: <Icon fontSize="small">smart_toy</Icon>,
    route: "/ai-assistant",
    component: <AIAssistantLayout />,
  },
  {
    type: "collapse",
    name: "Skills Assessment",
    key: "skills",
    icon: <Icon fontSize="small">assessment</Icon>,
    route: "/skills",
    component: <SkillsAssessment />,
  },
  {
    type: "collapse",
    name: "Career Planning",
    key: "career",
    icon: <Icon fontSize="small">trending_up</Icon>,
    route: "/career",
    component: <CareerPlanning />,
  },
  {
    type: "collapse",
    name: "Training",
    key: "training",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/training",
    component: <TrainingRecommendations />,
  },
  {
    type: "collapse",
    name: "Messagerie",
    key: "messagerie",
    icon: <Icon fontSize="small">chat</Icon>,
    route: "/messagerie",
    component: <Messagerie />,
  },
  {
    type: "collapse",
    name: "Network",
    key: "network",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/network",
    component: <ProfessionalNetwork />,
  },
  {
    type: "collapse",
    name: "My Profile",
    key: "my-profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/my-profile",
    component: <ProfileManager />,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },

  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
