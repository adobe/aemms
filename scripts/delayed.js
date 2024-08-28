/* eslint-disable no-console */
/* eslint-disable no-undef */
/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

function loadVegaLibraries(callback) {
  const vegaScript = document.createElement('script');
  vegaScript.src = 'https://cdn.jsdelivr.net/npm/vega@5';
  vegaScript.onload = () => {
    const vegaLiteScript = document.createElement('script');
    vegaLiteScript.src = 'https://cdn.jsdelivr.net/npm/vega-lite@5';
    vegaLiteScript.onload = () => {
      const vegaEmbedScript = document.createElement('script');
      vegaEmbedScript.src = 'https://cdn.jsdelivr.net/npm/vega-embed@6';
      vegaEmbedScript.onload = () => {
        if (typeof vegaEmbed !== 'undefined') {
          callback();
        } else {
          console.error('vegaEmbed is not defined');
        }
      };
      vegaEmbedScript.onerror = () => console.error('Failed to load vega-embed');
      document.head.appendChild(vegaEmbedScript);
    };
    vegaLiteScript.onerror = () => console.error('Failed to load vega-lite');
    document.head.appendChild(vegaLiteScript);
  };
  vegaScript.onerror = () => console.error('Failed to load vega');
  document.head.appendChild(vegaScript);
}

// Function to load Vega-Lite and render the speedometer chart
function loadVegaLiteAndRenderChart(jsonUrl, className, score, querySelect) {
  const chartContainer = document.createElement('div');
  const container = document.querySelector(querySelect);
  chartContainer.classList.add(className);
  container.appendChild(chartContainer);

  loadVegaLibraries(() => {
    fetch(jsonUrl)
      .then((response) => response.json())
      .then((spec) => {
        // Modify the JSON specification to set the score
        spec.params.push({ name: 'score', value: score });
        spec.layer.forEach((layer, index) => {
          if (index < 7) {
            layer.data = { values: [{ value: score }] };
          }
        });

        // Render the chart
        // eslint-disable-next-line no-undef
        vegaEmbed(`.${className}`, spec)
          .then(() => {
            const detailsElements = chartContainer.querySelectorAll('details');
            detailsElements.forEach((details) => details.remove());
          })
          .catch(console.error);
      })
      .catch(console.error);
  });
}

// URL to the JSON files
const jsonUrl = '../charts/speedometerPlusChart.json';
loadVegaLiteAndRenderChart(jsonUrl, 'chart-container', 73, '.banner.bpo > div');
loadVegaLiteAndRenderChart(jsonUrl, 'aem-values-container', 33, '.bpo-metric > div:nth-child(1) > div:nth-child(1)');
loadVegaLiteAndRenderChart(jsonUrl, 'exp-opt-container', 75, '.bpo-metric > div:nth-child(2) > div:nth-child(1)');
loadVegaLiteAndRenderChart(jsonUrl, 'biz-cont-container', 93, '.bpo-metric > div:nth-child(3) > div:nth-child(1)');
loadVegaLiteAndRenderChart(jsonUrl, 'operate-resilience-container', 85, '.bpo-metric > div:nth-child(4) > div:nth-child(1)');

function createAndAppendDiv(targetSelector, className) {
  const targetElement = document.querySelector(targetSelector);
  if (targetElement) {
    const newDiv = document.createElement('div');
    newDiv.classList.add(className);
    targetElement.appendChild(newDiv);
  } else {
    console.error(`Target element for ${className} not found.`);
  }
}

function createResultsDiv() {
  const elements = [
    { selector: '.bpo-metric > div > div:nth-child(2)', className: 'usage-results' },
    { selector: '.bpo-metric > div > div:nth-child(3)', className: 'adoption-results' },
    { selector: '.bpo-metric > div:nth-child(2) > div:nth-child(2)', className: 'lighthouse-results' },
    { selector: '.bpo-metric > div:nth-child(3) > div:nth-child(2) > div', className: 'performance-check-results' },
    { selector: '.bpo-metric > div:nth-child(3) > div:nth-child(3) > div', className: 'security-review-results' },
    { selector: '.bpo-metric > div:nth-child(2) > div:nth-child(3)', className: 'cache-ratio-results' },
  ];

  elements.forEach(({ selector, className }) => {
    createAndAppendDiv(selector, className);
  });
}

function loadUsageChartJs(callback) {
  const loadScript = (src, onload) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = onload;
    document.head.appendChild(script);
  };

  loadScript('https://cdn.jsdelivr.net/npm/chart.js', () => {
    loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels', callback);
  });
}

function createAndAppendCanvas(parentSelector, canvasId, width, height) {
  const parentDiv = document.querySelector(parentSelector);
  if (parentDiv) {
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.width = width;
    canvas.height = height;
    parentDiv.appendChild(canvas);
  } else {
    console.error(`${parentSelector} not found.`);
  }
}

function createCanvas() {
  const canvasConfigs = [
    {
      selector: '.usage-results', id: 'usageChart', width: 480, height: 250,
    },
    {
      selector: '.adoption-results', id: 'adoptionChart', width: 480, height: 250,
    },
    {
      selector: '.lighthouse-results', id: 'lighthouseChart', width: 480, height: 250,
    },
    {
      selector: '.performance-check-results', id: 'myRingChart', width: 100, height: 100,
    },
    {
      selector: '.security-review-results', id: 'securityReviewChart', width: 100, height: 100,
    },
    {
      selector: '.cache-ratio-results', id: 'cacheRatio', width: 480, height: 250,
    },
  ];

  canvasConfigs.forEach(({
    selector, id, width, height,
  }) => {
    createAndAppendCanvas(selector, id, width, height);
  });
}

function createLineGraph(url, chartId, datasets, yAxisConfig) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Format the date to "MMM-DD" format
      const formattedData = data.map((item) => {
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).replace(',', '-');
        return { ...item, formattedDate };
      });
      const ctx = document.getElementById(chartId).getContext('2d');

      // Plugin to draw background colors
      const backgroundColorPlugin = {
        id: 'backgroundColorPlugin',
        beforeDraw: (chart) => {
          // eslint-disable-next-line no-shadow
          const { ctx, chartArea: { left, right }, scales: { y } } = chart;
          ctx.save();

          yAxisConfig.forEach(({ color, start, end }) => {
            ctx.fillStyle = color;
            // eslint-disable-next-line max-len
            ctx.fillRect(left, y.getPixelForValue(start), right - left, y.getPixelForValue(end) - y.getPixelForValue(start));
          });

          ctx.restore();
        },
      };

      // eslint-disable-next-line no-new
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: formattedData.map((item) => item.formattedDate),
          datasets: datasets.map(({
            label, dataKey, borderColor, pointBackgroundColor,
          }) => ({
            label,
            data: formattedData.map((item) => item[dataKey]),
            fill: false,
            borderColor,
            tension: 0.1,
            pointRadius: 2,
            pointBackgroundColor,
            borderWidth: 1,
          })),
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              min: yAxisConfig[0].start,
              max: yAxisConfig[yAxisConfig.length - 1].end,
              ticks: {
                // eslint-disable-next-line max-len
                stepSize: (yAxisConfig[yAxisConfig.length - 1].end - yAxisConfig[0].start) / yAxisConfig.length,
              },
              grid: {
                display: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
        },
        plugins: [backgroundColorPlugin],
      });
    })
    .catch((error) => console.error('Error fetching data:', error));
}

function createLineGraphforAEMUsage(coreCompanyId) {
  const url = `http://127.0.0.1:5000/api/unique-users?core_company_id=${coreCompanyId}&start_date=2024-03-01&end_date=2024-05-31`;
  const chartId = 'usageChart';
  const datasets = [
    {
      label: 'Unique Users', dataKey: 'unique_users', borderColor: 'rgb(0, 0, 139)', pointBackgroundColor: 'rgb(75, 192, 192)',
    },
  ];
  const yAxisConfig = [
    { color: 'rgba(255, 99, 132, 0.2)', start: 0, end: 5 },
    { color: 'rgba(255, 205, 86, 0.2)', start: 5, end: 20 },
    { color: 'rgba(75, 192, 192, 0.2)', start: 20, end: 30 },
  ];

  createLineGraph(url, chartId, datasets, yAxisConfig);
}

function createLineGraphforAEMAdoption(coreCompanyId) {
  const url = `http://127.0.0.1:5000/api/adoption?core_company_id=${coreCompanyId}&start_date=2024-03-01&end_date=2024-05-31`;
  const chartId = 'adoptionChart';
  const datasets = [
    {
      label: 'Authoring Activities', dataKey: 'total_activities', borderColor: 'rgb(0, 0, 139)', pointBackgroundColor: 'rgb(75, 192, 192)',
    },
  ];
  const yAxisConfig = [
    { color: 'rgba(255, 99, 132, 0.2)', start: 0, end: 200 },
    { color: 'rgba(255, 205, 86, 0.2)', start: 200, end: 500 },
    { color: 'rgba(75, 192, 192, 0.2)', start: 500, end: 800 },
  ];

  createLineGraph(url, chartId, datasets, yAxisConfig);
}

function createLineGraphForCacheRatio(coreCompanyId) {
  const url = `http://127.0.0.1:5000/api/cache-ratio?core_company_id=${coreCompanyId}&start_date=2024-03-01&end_date=2024-05-31`;
  const chartId = 'cacheRatio';
  const datasets = [
    {
      label: 'Cache Ratio', dataKey: 'cache_ratio', borderColor: 'rgb(0, 0, 139)', pointBackgroundColor: 'rgb(75, 192, 192)',
    },
  ];
  const yAxisConfig = [
    { color: 'rgba(255, 99, 132, 0.2)', start: 0, end: 50 },
    { color: 'rgba(255, 205, 86, 0.2)', start: 50, end: 80 },
    { color: 'rgba(75, 192, 192, 0.2)', start: 80, end: 100 },
  ];

  createLineGraph(url, chartId, datasets, yAxisConfig);
}

function createLineGraphforLightHouseScore(coreCompanyId) {
  const url = `http://127.0.0.1:5000/api/lighthouse-score?core_company_id=${coreCompanyId}&start_date=2024-03-01&end_date=2024-05-31`;
  const chartId = 'lighthouseChart';
  const datasets = [
    {
      label: 'Accessibility', dataKey: 'accessibility_score', borderColor: 'rgb(0, 0, 139)', pointBackgroundColor: 'rgb(0, 0, 139)',
    },
    {
      label: 'Performance', dataKey: 'performance_score', borderColor: 'rgb(255, 140, 0)', pointBackgroundColor: 'rgb(255, 140, 0)',
    },
    {
      label: 'SEO', dataKey: 'seo_score', borderColor: 'rgb(0, 100, 0)', pointBackgroundColor: 'rgb(0, 100, 0)',
    },
  ];
  const yAxisConfig = [
    { color: 'rgba(255, 99, 132, 0.2)', start: 0, end: 50 },
    { color: 'rgba(255, 205, 86, 0.2)', start: 50, end: 75 },
    { color: 'rgba(75, 192, 192, 0.2)', start: 75, end: 100 },
  ];

  createLineGraph(url, chartId, datasets, yAxisConfig);
}

function createColoredRing(elementId, value) {
  const canvas = document.getElementById(elementId);
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10; // Adjust radius to fit within canvas
  const startAngle = -Math.PI / 2; // Start from the top
  const endAngle = startAngle + (2 * Math.PI * (value / 100)); // End angle based on value

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fill();

  // Draw the value arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.lineWidth = 10; // Adjust the thickness of the ring
  // eslint-disable-next-line no-nested-ternary
  ctx.strokeStyle = value <= 50 ? 'red' : value <= 80 ? 'yellow' : 'green';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();

  ctx.font = '25px Arial';
  // eslint-disable-next-line no-nested-ternary
  ctx.fillStyle = value <= 50 ? 'red' : value <= 80 ? 'yellow' : 'green';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${value}`, centerX, centerY);
}

loadUsageChartJs(() => {
  const coreCompanyId = '00b7e61597926994fabd354de053afd0';
  createResultsDiv();
  createCanvas();
  createLineGraphforAEMUsage(coreCompanyId);
  createLineGraphforAEMAdoption(coreCompanyId);
  createLineGraphforLightHouseScore(coreCompanyId);
  createLineGraphForCacheRatio(coreCompanyId);
  createColoredRing('myRingChart', 89);
  createColoredRing('securityReviewChart', 97);
});
