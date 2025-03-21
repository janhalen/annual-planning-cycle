import { getMonthNames } from './date-util.js';

// Configuration constants
const width = 1000;
const height = 1000;
const radius = Math.min(width, height) / 2;
const pastelColors = [
  'var(--pastel-blue)', 'var(--pastel-green)', 'var(--pastel-yellow)',
  'var(--pastel-pink)', 'var(--pastel-purple)', 'var(--pastel-orange)',
  'var(--pastel-red)', 'var(--pastel-teal)', 'var(--pastel-lavender)',
  'var(--pastel-mint)'
];

// Function to create the SVG element
function createSVG(container) {
  return d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);
}

// Function to create the arc generator
function createArc() {
  return d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
}

// Function to create the pie layout
function createPie() {
  return d3.pie()
    .value(1) // Each slice has equal value
    .sort(null); // Do not sort the slices
}

// Function to append arcs to the SVG
function appendArcs(svg, data, arc) {
  const arcs = svg.selectAll('.arc')
    .data(createPie()(data))
    .enter()
    .append('g')
    .attr('class', 'arc');

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => pastelColors[i % pastelColors.length]);

  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.data.title);
}

// Function to append month names around the wheel
function appendMonthNames(svg, months) {
  const monthArcs = svg.selectAll('.month-arc')
    .data(months)
    .enter()
    .append('g')
    .attr('class', 'month-arc');

  monthArcs.append('text')
    .attr('transform', (d, i) => {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * (radius + 30);
      const y = Math.sin(angle) * (radius + 30);
      return `translate(${x}, ${y})`;
    })
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d);
}

// Main function to render the wheel
function renderWheel(container, data, months) {
  const svg = createSVG(container);
  const arc = createArc();
  appendArcs(svg, data, arc);
  appendMonthNames(svg, months);
}

// Load the JSON data and render the wheel
d3.json('../data/mock.json').then(data => {
  const months = getMonthNames('da-DK');
  renderWheel('.wheel', data, months);
});
