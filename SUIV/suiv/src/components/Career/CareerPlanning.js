import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Grid, TextField, Button } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function CareerPlanning() {
  const [careerGoal, setCareerGoal] = useState("");
  const [timeline, setTimeline] = useState([
    {
      id: 1,
      title: "Short Term Goal (6 months)",
      description: "Complete React certification",
      completed: false,
    },
    {
      id: 2,
      title: "Medium Term Goal (1 year)",
      description: "Lead a development team",
      completed: false,
    },
    {
      id: 3,
      title: "Long Term Goal (3 years)",
      description: "Become a Technical Architect",
      completed: false,
    },
  ]);

  const handleAddGoal = () => {
    if (careerGoal.trim()) {
      const newGoal = {
        id: timeline.length + 1,
        title: `Goal ${timeline.length + 1}`,
        description: careerGoal,
        completed: false,
      };
      setTimeline([...timeline, newGoal]);
      setCareerGoal("");
    }
  };

  const toggleGoalCompletion = (id) => {
    setTimeline(
      timeline.map((goal) => (goal.id === id ? { ...goal, completed: !goal.completed } : goal))
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        <Typography variant="h4" gutterBottom>
          Career Planning
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Add Career Goal"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="Enter your career goal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button variant="contained" color="primary" onClick={handleAddGoal} fullWidth>
                  Add Goal
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Career Timeline
            </Typography>
            <Timeline position="alternate">
              {timeline.map((goal, index) => (
                <TimelineItem key={goal.id}>
                  <TimelineSeparator>
                    <TimelineDot
                      color={goal.completed ? "success" : "primary"}
                      onClick={() => toggleGoalCompletion(goal.id)}
                      sx={{ cursor: "pointer" }}
                    />
                    {index < timeline.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="h6" component="h1">
                        {goal.title}
                      </Typography>
                      <Typography>{goal.description}</Typography>
                      <Typography
                        variant="caption"
                        color={goal.completed ? "success.main" : "text.secondary"}
                      >
                        {goal.completed ? "Completed" : "In Progress"}
                      </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CareerPlanning;
