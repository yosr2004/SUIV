import React, { useEffect, useState } from "react";
import axios from "axios";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// Default avatar
import defaultAvatar from "assets/images/team-2.jpg";

export default function useUserTableData() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/signup")
      .then((res) => {
        const users = res.data;

        const formattedRows = users.map((user) => ({
          author: (
            <Author
              image={defaultAvatar}
              name={`${user.firstName} ${user.lastName}`}
              email={user.email}
            />
          ),
          function: <Job title="User" description="Registered" />,
          status: (
            <MDBox ml={-1}>
              <MDBadge badgeContent="online" color="success" variant="gradient" size="sm" />
            </MDBox>
          ),
          employed: (
            <MDTypography variant="caption" color="text" fontWeight="medium">
              N/A
            </MDTypography>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, []);

  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Job = ({ title, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "author", accessor: "author", width: "45%", align: "left" },
      { Header: "function", accessor: "function", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "employed", accessor: "employed", align: "center" },
    ],
    rows,
  };
}
