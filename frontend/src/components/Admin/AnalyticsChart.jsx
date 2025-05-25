import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card } from 'react-bootstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsChart() {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: '	Engagement des étudiants ',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Évolution de lengagement des étudiants dans le temps',
      },
    },
  };

  return (
    <Card>
      <Card.Header>Analytics Chart</Card.Header>
      <Card.Body>
        <Bar data={data} options={options} />
      </Card.Body>
    </Card>
  );
}

export default AnalyticsChart;
