import { getMonthNames } from './date-util.js';

// Load the JSON data from the specified file
d3.json('./data/mock.json').then(data => {
  const width = 1200;
  const height =1000;
  const radius = Math.min(width, height) / 2;

  // Get month names in Danish
  const months = getMonthNames('da-DK');

  // Create an SVG element and append it to the wheel div
  const svg = d3.select('.wheel')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  // Define the arc generator for the pie chart
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // Define the pie layout
  const pie = d3.pie()
    .value(1) // Each slice has equal value
    .sort(null); // Do not sort the slices

  // Create a group for each slice of the pie
  const arcs = svg.selectAll('.arc')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc');

  // Append the path for each slice and set its color
  arcs.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => d3.schemeCategory10[i % 10]);

  // Append the text label for each slice
  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.data.title);

  // Append month names around the wheel
  const monthArcs = svg.selectAll('.month-arc')
    .data(months)
    .enter()
    .append('g')
    .attr('class', 'month-arc');

  monthArcs.append('text')
    .attr('transform', (d, i) => {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * (radius + 20);
      const y = Math.sin(angle) * (radius + 20);
      return `translate(${x}, ${y})`;
    })
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d);
});