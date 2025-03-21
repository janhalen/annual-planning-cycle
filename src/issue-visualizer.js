import { getMonthNames } from './date-util.js';

// Function to calculate dimensions based on container
function calculateDimensions(container) {
  const containerWidth = d3.select(container).node().getBoundingClientRect().width;
  const width = Math.min(containerWidth, 1200); // Max width of 1200px
  const height = width;
  const margin = width * 0.1;
  const radius = Math.min(width, height) / 2 - margin;
  
  return { width, height, radius, margin };
}

// Function to create the SVG element
function createSVG(container) {
  const { width, height, margin } = calculateDimensions(container);
  
  return d3.select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${width + margin * 2} ${height + margin * 2}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .append('g')
    .attr('transform', `translate(${width / 2 + margin}, ${height / 2 + margin})`);
}

// Function to create the arc generator
function createArc(container) {
  const { radius } = calculateDimensions(container);
  return d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
}

// Function to create the pie generator
function createPie() {
  return d3.pie()
    .value(d => 1)
    .sort(null);
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
    .attr('class', (d, i) => `segment-${i}`);

  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.data.title);
}

// Function to append month names
function appendMonthNames(svg, months) {
  const { radius } = calculateDimensions('.wheel');
  const monthArc = d3.arc()
    .innerRadius(radius + 20)
    .outerRadius(radius + 20);

  const monthArcs = svg.selectAll('.month-arc')
    .data(months.map((d, i) => ({
      startAngle: (i * 2 * Math.PI) / 12,
      endAngle: ((i + 1) * 2 * Math.PI) / 12,
      month: d
    })))
    .enter()
    .append('g')
    .attr('class', 'month-arc');

  monthArcs.append('text')
    .attr('transform', d => `translate(${monthArc.centroid(d)})`)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.month);
}

// Main function to render the wheel
function renderWheel(container, data, months) {
  const svg = createSVG(container);
  const arc = createArc(container);
  appendArcs(svg, data, arc);
  appendMonthNames(svg, months);
}

// Load the JSON data and render the wheel
d3.json('../data/mock.json').then(data => {
  const months = getMonthNames('da-DK');
  renderWheel('.wheel', data, months);
});