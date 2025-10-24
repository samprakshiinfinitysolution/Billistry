"use client";

import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  TimeSeriesScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler, BarElement);

const kpis = [
  { title: 'Active Users', value: '8,921', change: '+3.4%', positive: true },
  { title: 'New Signups', value: '1,132', change: '+6.1%', positive: true },
  { title: 'Monthly Revenue', value: '₹2,34,120', change: '+1.9%', positive: true },
  { title: 'Conversion Rate', value: '5.8%', change: '-0.3%', positive: false },
];

function KPI({ kpi }: { kpi: any }) {
  return (
    <Card className="border border-gray-200">
      <CardContent>
        <div className="text-sm text-gray-500">{kpi.title}</div>
        <div className="mt-2 flex items-baseline gap-3">
          <div className="text-2xl font-semibold text-gray-900">{kpi.value}</div>
          <div className={`text-sm font-medium ${kpi.positive ? 'text-green-600' : 'text-red-500'}`}>
            {kpi.change} {kpi.positive && <TrendingUp className="inline-block ml-1 w-4 h-4 text-green-600" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartPlaceholderLarge({ title }: { title: string }) {
  const data = {
    labels: ['Premium', 'Standard', 'Basic'],
    datasets: [
      {
        data: [45, 38, 17],
        backgroundColor: ['#7C3AED', '#6366F1', '#CBD5E1'],
        hoverOffset: 6,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">Plan distribution (mock data)</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center mt-6 min-h-[260px]">
          <div className="w-[260px] h-[260px]">
            <Doughnut data={data} options={options} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-600 inline-block" />
            <div className="text-sm text-gray-700">Premium — 45%</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />
            <div className="text-sm text-gray-700">Standard — 38%</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
            <div className="text-sm text-gray-700">Basic — 17%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholderSmall({ title, icon }: { title: string; icon?: React.ReactNode }) {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: [120, 190, 170, 220, 240, 260],
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124,58,237,0.08)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f3f4f6' } },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">Recent trend</p>
          </div>
          <div className="text-gray-400">{icon}</div>
        </div>

        <div className="flex-1 flex items-center justify-center mt-4 min-h-[92px]">
          <div className="w-full h-36">
            <Line data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-0 h-full pt-0 pb-6">
      <div className="space-y-6 pt-6 px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <KPI key={k.title} kpi={k} />
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800">Charts & Insights</h2>
          <p className="text-sm text-gray-500 mt-1">High-level charts and distribution placeholders. Replace with live charts when ready.</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-6 pt-4 md:pt-8">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr items-stretch h-full px-0">
          <div className="lg:col-span-2">
            <ChartPlaceholderLarge title="Plan Distribution" />
          </div>

          <div className="flex flex-col gap-6 h-full">
            <ChartPlaceholderSmall title="Revenue Trend" icon={<BarChart2 className="w-4 h-4" />} />
            <ChartPlaceholderSmall title="Signup Sources" icon={<TrendingUp className="w-4 h-4" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

