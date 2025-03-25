import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopStudentsChart = () => {
  const data = {
    labels: ['John Doe', 'Jane Smith', 'Alex Brown', 'Emily Davis', 'Michael Lee'],
    datasets: [
      {
        label: 'Grades',
        data: [95, 88, 82, 78, 70],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Grades',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Students by Grades',
      },
    },
  };

  return (
    <div className="card p-3">
      <Bar data={data} options={options} />
    </div>
  );
};

export default TopStudentsChart;