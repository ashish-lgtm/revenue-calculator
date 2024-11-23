import React, { useState, useEffect } from 'react';
import { Download, Calculator, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueCalculator = () => {
  const [currentRevenue, setCurrentRevenue] = useState('');
  const [growthRate, setGrowthRate] = useState('');
  const [projections, setProjections] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageGrowth, setAverageGrowth] = useState(0);
  const [error, setError] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (error || successMessage) {
        const timer = setTimeout(() => {
            setError('');
            setSuccessMessage('');
        }, 2000);
        
        return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const calculateRevenue = () => {
    // Reset previous state
    setError('');
    setProjections([]);
    setShowChart(false);
    setSuccessMessage('');

    // Validate inputs
    const revenue = parseFloat(currentRevenue);
    const rate = parseFloat(growthRate);

    // Input validation with specific error messages
    if (!currentRevenue) {
      setError('Please enter the current revenue');
      return;
    }
    
    if (!growthRate) {
      setError('Please enter the growth rate');
      return;
    }

    if (isNaN(revenue) || revenue <= 0) {
      setError('Please enter a valid current revenue');
      return;
    }

    // Calculate projections
    const newProjections = [];
    let highestGrowthIndex = 0;
    let total = 0;
    let prevYearRevenue = revenue;

    for (let i = 0; i < 5; i++) {
      const projectedRevenue = prevYearRevenue * (1 + rate/100);
      const growthAmount = projectedRevenue - prevYearRevenue;

      const projectionData = {
        year: `Year ${i + 1}`,
        revenue: parseFloat(projectedRevenue.toFixed(2)),
        growthAmount: parseFloat(growthAmount.toFixed(2))
      };

      newProjections.push(projectionData);

      if (growthAmount > (newProjections[highestGrowthIndex]?.growthAmount || 0)) {
        highestGrowthIndex = i;
      }

      total += projectedRevenue;
      prevYearRevenue = projectedRevenue;
    }

    // Mark highest growth year
    newProjections[highestGrowthIndex].highlight = true;

    setSuccessMessage('Projections calculated successfully!');
    setProjections(newProjections);
    setTotalRevenue(total.toFixed(2));
    setAverageGrowth(((total/revenue - 1) * 100 / 5).toFixed(2));
    setShowChart(true);
  };

  const downloadCSV = () => {
    const headers = ['Year', 'Projected Revenue', 'Growth Amount'];
    const csvContent = [
      headers.join(','),
      ...projections.map(p => 
        `${p.year},${p.revenue},${p.growthAmount}${p.highlight ? ' (Highest Growth)' : ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'revenue_projections.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Advanced Revenue Upside Calculator</h1>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Current Revenue ($)</label>
            <input
              type="number"
              value={currentRevenue}
              onChange={(e) => setCurrentRevenue(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter current revenue"
              min="0"
              step="1"
            />
          </div>

          <div>
    <label className="block text-gray-700 mb-2">Annual Growth Rate (%)</label>
    <div className="space-y-2">
        {/* Text Input */}
        <input
            type="number"
            value={growthRate}
            onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                    setGrowthRate(value);
                }
            }}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter growth rate"
            min="0"
            max="100"
            step="0.5"
        />
        
        {/* Slider Input */}
        <div className="relative">
            <input
                type="range"
                value={growthRate || 0}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                min="0"
                max="100"
                step="0.5"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span>{growthRate || 0}%</span>
                <span>100%</span>
            </div>
                </div>
            </div>
        </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
            {error}
          </div>
        )}

        {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4">
                {successMessage}
            </div>
        )}

        <button 
          onClick={calculateRevenue}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <Calculator className="mr-2" /> Calculate Projections
        </button>

        {projections.length > 0 && (
          <div className="mt-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Projection Table */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Revenue Projections</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Year</th>
                      <th className="border p-2">Revenue</th>
                      <th className="border p-2">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.map((proj) => (
                      <tr 
                        key={proj.year} 
                        className={proj.highlight ? 'bg-green-100 font-bold' : ''}
                      >
                        <td className="border p-2 text-center">{proj.year}</td>
                        <td className="border p-2 text-right">${proj.revenue.toLocaleString()}</td>
                        <td className="border p-2 text-right">${proj.growthAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Cards */}
              <div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-semibold text-gray-700">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">${parseFloat(totalRevenue).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="font-semibold text-gray-700">Avg. Annual Growth</p>
                    <p className="text-2xl font-bold text-green-600">{averageGrowth}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            {showChart && (
              <div className="w-full h-64 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year"
                      interval={0}  // Force show all labels
                      textAnchor="end"  // Align the text
                      height={60}
                      tick={{ 
                        fontSize: 12,
                      }}
                    />
                    <YAxis 
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `$${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `$${(value / 1000).toFixed(1)}K`;
                        }
                        return `$${value}`;
                      }}
                      width={70}
                    />
                    <Tooltip formatter={(value) => ['$' + value.toLocaleString(), 'Revenue']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <button 
                onClick={downloadCSV}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 flex items-center justify-center"
              >
                <Download className="mr-2" /> Download CSV
              </button>
              <button 
                onClick={() => setShowChart(!showChart)}
                className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 flex items-center justify-center"
              >
                <BarChart2 className="mr-2" /> {showChart ? 'Hide Chart' : 'Show Chart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueCalculator;