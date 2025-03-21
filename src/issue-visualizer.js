import { getMonthNames } from './date-util.js';

function createHierarchicalData(issues, months) {
  const monthData = months.map((month, i) => ({
    name: month,
    monthIndex: i,
    children: []
  }));

  issues.forEach(issue => {
    const date = new Date(issue.created_at);
    const monthIndex = date.getMonth();
    monthData[monthIndex].children.push({
      name: issue.title,
      value: 1
    });
  });

  return {
    name: "root",
    children: monthData
  };
}

function renderSunburst(container, data, months) {
  // Set up dimensions
  const width = 800;
  const radius = width / 2;

  // Create partition layout
  const partition = data => {
    return d3.partition()
      .size([2 * Math.PI, radius])(
        d3.hierarchy(data)
          .sum(d => d.value || 0)
      );
  };

  // Create arc generator
  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 1);

  // Create SVG container
  const svg = d3.select(container)
    .append('svg')
    .style('width', '100%')
    .style('height', 'auto')
    .attr('viewBox', `-${width/2} -${width/2} ${width} ${width}`)
    .style('font', '10px sans-serif');

  // Process data
  const root = partition(createHierarchicalData(data, months));

  // Define color array for issues
  const colors = ['blue', 'green', 'yellow', 'pink', 'purple', 
                 'orange', 'red', 'teal', 'lavender', 'mint'];

  // Create paths for segments
  svg.selectAll('path')
  .data(root.descendants())
  .join('path')
  .attr('fill', d => {
    // Root node (center) is transparent
    if (d.depth === 0) return 'none';
    // Month segments get their own colors
    if (d.depth === 1) {
      const monthColors = ['blue', 'green', 'yellow', 'pink', 'purple', 
                         'orange', 'red', 'teal', 'lavender', 'mint'];
      return `var(--pastel-${monthColors[d.data.monthIndex % monthColors.length]})`;
    }
    // Issue segments get a slightly different shade
    const issueColors = ['green', 'yellow', 'pink', 'purple', 'orange', 
                        'red', 'teal', 'lavender', 'mint', 'blue'];
    const colorIndex = d.parent.children.indexOf(d) % issueColors.length;
    return `var(--pastel-${issueColors[colorIndex]})`;
  })
  .attr('d', arc)
  .attr('class', d => `depth-${d.depth}`);

  // Add text labels
  svg.selectAll('text')
    .data(root.descendants())
    .join('text')
    .attr('transform', d => {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.data.name)
    .attr('class', 'sunburst-text')
    .style('visibility', d => {
      // Hide text for very small segments or root
      return d.depth === 0 ? 'hidden' : 'visible';
    });
}

d3.json('../data/mock.json').then(data => {
  const months = getMonthNames('da-DK');
  renderSunburst('.wheel', data, months);
});