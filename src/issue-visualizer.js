import { getMonthNames } from './date-util.js';

function createHierarchicalData(issues, months) {
  // Create all 12 months with empty children arrays
  const monthData = months.map((month, i) => ({
    name: month,
    monthIndex: i,
    children: [],
    value: 1  // Ensure each month segment has equal size
  }));

  // Map issues to their respective months
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
  // Reduce dimensions
  const width = 600;  
  const radius = width / 2.5;  

  // Create partition layout with fixed month sizes
  const partition = data => {
    return d3.partition()
      .size([2 * Math.PI, radius])(
        d3.hierarchy(data)
          .sum(d => {
            // Give months fixed size, issues their regular value
            if (d.depth === 1) return 1;
            return d.value || 0;
          })
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

  // Define color arrays
  const monthColors = [
    'blue', 'green', 'yellow', 'pink', 'purple', 'orange',
    'red', 'teal', 'lavender', 'mint', 'blue', 'green'
  ];

  const issueColors = [
    'green', 'yellow', 'pink', 'purple', 'orange',
    'red', 'teal', 'lavender', 'mint', 'blue'
  ];

  // Create paths for segments
  svg.selectAll('path')
    .data(root.descendants())
    .join('path')
    .attr('fill', d => {
      // Root node (center) is transparent
      if (d.depth === 0) return 'none';
      // Month segments get their own colors
      if (d.depth === 1) {
        return `var(--pastel-${monthColors[d.data.monthIndex % monthColors.length]})`;
      }
      // Issue segments get a slightly different shade
      const colorIndex = d.parent.children.indexOf(d) % issueColors.length;
      return `var(--pastel-${issueColors[colorIndex]})`;
    })
    .attr('d', arc)
    .attr('class', d => `depth-${d.depth}`);

  // Separate month labels from issue labels
  // Month labels (curved around the arcs)
  const labelRadius = radius + 0;  // Radius for the label path

  // Create invisible paths for text to follow
  const textPaths = svg.append('defs')
    .selectAll('path')
    .data(root.descendants().filter(d => d.depth === 1))
    .join('path')
    .attr('id', (d, i) => `monthArc${i}`)
    .attr('d', d => {
      const start = d.x0 * 180 / Math.PI;
      const end = d.x1 * 180 / Math.PI;
      const centerAngle = (start + end) / 2;
      return `
        M ${labelRadius * Math.cos((start - 90) * Math.PI / 180)} 
          ${labelRadius * Math.sin((start - 90) * Math.PI / 180)}
        A ${labelRadius} ${labelRadius} 0 0 1
          ${labelRadius * Math.cos((end - 90) * Math.PI / 180)}
          ${labelRadius * Math.sin((end - 90) * Math.PI / 180)}
      `;
    });

  // Add the curved text
  svg.selectAll('.month-label')
    .data(root.descendants().filter(d => d.depth === 1))
    .join('text')
    .attr('class', 'month-label')
    .append('textPath')
    .attr('xlink:href', (d, i) => `#monthArc${i}`)
    .attr('startOffset', '25%')
    .style('text-anchor', 'middle')
    .style('font-size', '8px')  // Reduced from 12px to 10px
    .style('fill', 'var(--dark-grey)')
    .text(d => d.data.name);

  // Issue labels (inside the arcs)
  svg.selectAll('.issue-label')
    .data(root.descendants().filter(d => d.depth === 2))
    .join('text')
    .attr('class', 'issue-label')
    .attr('transform', d => {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .text(d => d.data.name)
    .style('visibility', d => {
      const angle = (d.x1 - d.x0) * 180 / Math.PI;
      return angle > 10 ? 'visible' : 'hidden';
    })
    .style('font-size', '10px')
    .style('fill', 'var(--dark-grey)');
}

// Load the JSON data and render the sunburst
d3.json('../data/mock.json').then(data => {
  const months = getMonthNames('da-DK');
  renderSunburst('.wheel', data, months);
});