let currentSlide = 0;
const slides = [showTopStudents, showGenderPassRatio, showEthnicityGroups, showTestPreparationStatus];

function showTopStudents() {
    // Load data and create bar chart with top students
    d3.csv('StudentsPerformance.csv').then(data => {
        // Calculate average score for each student
        data.forEach(d => {
            d.avg_score = (+d['math score'] + +d['reading score'] + +d['writing score']) / 3;
        });

        // Sort data by average score in descending order
        data.sort((a, b) => b.avg_score - a.avg_score);

        // Select the number of top students to display
        let topN = 10; // default value, you can change this as needed

        // Create an input field to change the number of top students
        d3.select('#visualization-container').append('input')
            .attr('type', 'number')
            .attr('id', 'topNInput')
            .attr('value', topN)
            .on('change', function() {
                topN = +this.value;
                updateChart();
            });

        function updateChart() {
            // Filter the top N students
            let topStudents = data.slice(0, topN);

            // Remove any existing SVG elements
            d3.select('#visualization-container').selectAll('svg').remove();

            // Create the SVG container
            const svg = d3.select('#visualization-container').append('svg')
                .attr('width', 800)
                .attr('height', 400);

            // Define scales
            const x = d3.scaleBand()
                .domain(d3.range(topN))
                .range([0, 800])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(topStudents, d => d.avg_score)])
                .nice()
                .range([400, 0]);

            // Create axes
            svg.append('g')
                .attr('transform', 'translate(0,400)')
                .call(d3.axisBottom(x).tickFormat(i => i + 1));

            svg.append('g')
                .call(d3.axisLeft(y));

            // Create bars
            svg.selectAll('.bar')
                .data(topStudents)
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', (d, i) => x(i))
                .attr('y', d => y(d.avg_score))
                .attr('width', x.bandwidth())
                .attr('height', d => 400 - y(d.avg_score))
                .on('mouseover', function(event, d) {
                    // Show tooltip with student details
                    const tooltip = d3.select('#visualization-container').append('div')
                        .attr('class', 'tooltip')
                        .style('position', 'absolute')
                        .style('background', '#f4f4f4')
                        .style('padding', '5px')
                        .style('border', '1px solid #ccc')
                        .style('border-radius', '5px')
                        .html(`Gender: ${d.gender}<br>Ethnicity: ${d['race/ethnicity']}<br>Math: ${d['math score']}<br>Reading: ${d['reading score']}<br>Writing: ${d['writing score']}`)
                        .style('left', (event.pageX + 5) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', function() {
                    // Remove tooltip
                    d3.select('.tooltip').remove();
                });
        }

        updateChart(); // Initial chart rendering
    });
}

function showGenderPassRatio() {
    // Load data and create pie chart with male/female pass ratio
    d3.csv('StudentsPerformance.csv').then(data => {
        // Calculate pass/fail for each student
        data.forEach(d => {
            d.pass = (+d['math score'] >= 60 && +d['reading score'] >= 60 && +d['writing score'] >= 60) ? 'pass' : 'fail';
        });

        // Aggregate pass/fail counts by gender
        const passCounts = d3.rollups(data, v => v.filter(d => d.pass === 'pass').length, d => d.gender);

        const pieData = passCounts.map(([gender, count]) => ({
            gender,
            count
        }));

        // Set up the pie chart
        const width = 400, height = 400, radius = Math.min(width, height) / 2;

        const color = d3.scaleOrdinal()
            .domain(['female', 'male'])
            .range(d3.schemeCategory10);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const pie = d3.pie()
            .value(d => d.count);

        const svg = d3.select('#visualization-container').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const arcs = svg.selectAll('.arc')
            .data(pie(pieData))
            .enter().append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.gender));

        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .text(d => `${d.data.gender}: ${d.data.count}`);
    });
}

function showEthnicityGroups() {
    // Load data and create bar chart with ethnicity groups
    d3.csv('StudentsPerformance.csv').then(data => {
        // Aggregate count of students by ethnicity group
        const groupCounts = d3.rollups(data, v => v.length, d => d['race/ethnicity']);

        const barData = groupCounts.map(([ethnicity, count]) => ({
            ethnicity,
            count
        }));

        // Set up the bar chart
        const svg = d3.select('#visualization-container').append('svg')
            .attr('width', 800)
            .attr('height', 400);

        const x = d3.scaleBand()
            .domain(barData.map(d => d.ethnicity))
            .range([0, 800])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(barData, d => d.count)])
            .nice()
            .range([400, 0]);

        svg.append('g')
            .attr('transform', 'translate(0,400)')
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));

        svg.selectAll('.bar')
            .data(barData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.ethnicity))
            .attr('y', d => y(d.count))
            .attr('width', x.bandwidth())
            .attr('height', d => 400 - y(d.count));
    });
}

function showTestPreparationStatus() {
    // Load data and create line graph with test preparation status
    d3.csv('StudentsPerformance.csv').then(data => {
        // Aggregate count of students by test preparation status
        const prepCounts = d3.rollups(data, v => v.length, d => d['test preparation course']);

        const lineData = prepCounts.map(([status, count]) => ({
            status,
            count
        }));

        // Set up the line chart
        const svg = d3.select('#visualization-container').append('svg')
            .attr('width', 800)
            .attr('height', 400);

        const x = d3.scalePoint()
            .domain(lineData.map(d => d.status))
            .range([0, 800]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(lineData, d => d.count)])
            .nice()
            .range([400, 0]);

        svg.append('g')
            .attr('transform', 'translate(0,400)')
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));

        const line = d3.line()
            .x(d => x(d.status))
            .y(d => y(d.count));

        svg.append('path')
            .datum(lineData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('d', line);
    });
}

document.getElementById('prev-slide').addEventListener('click', () => {
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1;
    updateSlide();
});

document.getElementById('next-slide').addEventListener('click', () => {
    currentSlide = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0;
    updateSlide();
});
function updateSlide() {
  d3.select('#visualization-container').selectAll('svg').remove(); // Clear existing content
  slides[currentSlide](); // Call the function for the current slide
}
showTopStudents();
