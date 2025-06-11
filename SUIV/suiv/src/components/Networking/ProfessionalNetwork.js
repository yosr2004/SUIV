import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Tab,
  Tabs,
} from "@mui/material";
import { Event as EventIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Mock data for mentors and events
const mockMentors = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Software Architect",
    company: "Tech Solutions Inc.",
    expertise: ["Cloud Architecture", "System Design", "Team Leadership"],
    avatar: "https://example.com/avatar1.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Lead Developer",
    company: "Innovation Labs",
    expertise: ["Full Stack Development", "Agile Methodologies", "Mentoring"],
    avatar: "https://example.com/avatar2.jpg",
  },
];

const mockEvents = [
  {
    id: 1,
    title: "Tech Leadership Workshop",
    date: "2024-03-15",
    time: "14:00",
    type: "Workshop",
    attendees: 45,
  },
  {
    id: 2,
    title: "AI in Enterprise Development",
    date: "2024-03-20",
    time: "10:00",
    type: "Webinar",
    attendees: 120,
  },
];

function ProfessionalNetwork() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleViewProfile = (mentorId) => {
    console.log("Viewing mentor profile:", mentorId);
    // Future implementation: View mentor profile
  };

  const handleJoinEvent = (eventId) => {
    console.log("Joining event:", eventId);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        <Typography variant="h4" gutterBottom>
          Professional Network
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="network tabs">
            <Tab label="Mentors" />
            <Tab label="Events" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <Grid container spacing={3}>
            {mockMentors.map((mentor) => (
              <Grid item xs={12} md={6} key={mentor.id}>
                <Card>
                  <CardHeader
                    avatar={
                      <Avatar src={mentor.avatar} sx={{ width: 56, height: 56 }}>
                        {mentor.name.charAt(0)}
                      </Avatar>
                    }
                    title={mentor.name}
                    subheader={`${mentor.title} at ${mentor.company}`}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Expertise:
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {mentor.expertise.map((skill) => (
                        <Typography
                          key={skill}
                          variant="body2"
                          color="text.secondary"
                          component="span"
                          sx={{
                            mr: 1,
                            padding: "4px 8px",
                            backgroundColor: "background.default",
                            borderRadius: 1,
                            display: "inline-block",
                            mb: 1,
                          }}
                        >
                          {skill}
                        </Typography>
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewProfile(mentor.id)}
                      >
                        Voir profil
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {currentTab === 1 && (
          <List>
            {mockEvents.map((event) => (
              <React.Fragment key={event.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <EventIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {event.type}
                        </Typography>
                        {` — ${event.date} at ${event.time}`}
                        <br />
                        {`${event.attendees} attendees`}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleJoinEvent(event.id)}
                    >
                      Join
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProfessionalNetwork;
