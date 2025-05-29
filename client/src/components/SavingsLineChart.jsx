import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const SavingsLineChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Savings',
        data: data.map(item => item.amount),
        fill: false,
        borderColor: '#7C3AED', // purple
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default SavingsLineChart;
