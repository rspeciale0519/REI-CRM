import React from 'react';
import Card from '../ui/Card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'stacked-bar';
  data: any[];
  dataKey?: string;
  xAxisKey?: string;
  series?: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  type,
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  series = [],
  colors = COLORS,
  height = 300,
  showLegend = true,
  valueFormatter = (value) => `${value}`,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip formatter={valueFormatter} />
              {showLegend && <Legend />}
              {series.length > 0 ? (
                series.map((s, index) => (
                  <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color || colors[index % colors.length]} />
                ))
              ) : (
                <Bar dataKey={dataKey} fill={colors[0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'stacked-bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip formatter={valueFormatter} />
              {showLegend && <Legend />}
              {series.map((s, index) => (
                <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} stackId="a" fill={s.color || colors[index % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip formatter={valueFormatter} />
              {showLegend && <Legend />}
              {series.length > 0 ? (
                series.map((s, index) => (
                  <Line 
                    key={s.dataKey} 
                    type="monotone" 
                    dataKey={s.dataKey} 
                    name={s.name} 
                    stroke={s.color || colors[index % colors.length]} 
                    activeDot={{ r: 8 }} 
                  />
                ))
              ) : (
                <Line type="monotone" dataKey={dataKey} stroke={colors[0]} activeDot={{ r: 8 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={xAxisKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={valueFormatter} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card title={title} subtitle={subtitle}>
      {renderChart()}
    </Card>
  );
};

export default ChartContainer;
