// script.js

// Global variables
let currentSlide = 1; // Start at slide 2
let studentData = []; // Store CSV data

// Initialize slides
function initSlides() {
    updateSlide(currentSlide);
    document.getElementById('next-slide').addEventListener('click', nextSlide);
    document.getElementById('prev-slide').addEventListener('click', prevSlide);
    loadCSVData(); // Load CSV data on initialization
}

// Load and parse CSV data
function loadCSVData() {
    d3.csv("StudentsPerformance.csv").then((data) => {
        studentData = data;
        updateSlide(2); // Update Slide 2 after loading data
    });
}

// Update slide content
function updateSlide(slideNumber) {
    const container = d3.select('#visualization-container');
    container.html(''); // Clear the container

    switch (slideNumber) {
        case 1:
            // Slide 1: Title Slide with Image
            container.html(`
                <h1>Student's Performance Analysis By Santhra Thomas</h1>
                <img src="img1.jpg" alt="Student Performance Image" />
            `);
            d3.select('#prev-slide').style('display', 'none');
            d3.select('#next-slide').style('display', 'block');
            break;
        case 2:
            // Slide 2: Top Student Performances
            container.html(`
                <h1>Top Student Performances</h1>
                <div id="bar-chart"></div>
                <div id="controls">
                    <input type="number" id="top-n" placeholder="Update the Top number" />
                    <button id="update-chart">Update</button>
                </div>
            `);

            // Add bar chart drawing logic here
            drawBarChart(studentData);

            d3.select('#prev-slide').style('display', 'block');
            d3.select('#next-slide').style('display', 'block');

            // Add event listener to the update button
            document.getElementById('update-chart').addEventListener('click', function() {
                const topN = parseInt(document.getElementById('top-n').value);
                if (!isNaN(topN) && topN > 0) {
                    drawBarChart(studentData, topN);
                }
            });
            break;
        case 3:
            // Slide 3: Male/Female Pass Ratio and Top Performers
            container.html(`
                <h1>Male/Female Pass Ratio</h1>
                <div id="pie-chart"></div>
                <div id="details-table"></div>
            `);
            drawPieChart(studentData);
            drawTopPerformersTable(studentData);
            
            d3.select('#prev-slide').style('display', 'block');
            d3.select('#next-slide').style('display', 'block');
            break;
        case 4:
            // Slide 4: Race/Ethnicity of Students
            container.html(`
                <h1>Race/Ethnicity of Students</h1>
                <div id="bar-chart"></div>
                <div id="group-select">
                    <label for="group">Select Group:</label>
                    <select id="group">
                        <option value="Group A">Group A</option>
                        <option value="Group B">Group B</option>
                        <option value="Group C">Group C</option>
                        <option value="Group D">Group D</option>
                        <option value="Group E">Group E</option>
                    </select>
                </div>
            `);

            // Add event listener to the dropdown
            document.getElementById('group').addEventListener('change', function() {
                const selectedGroup = document.getElementById('group').value;
                drawGroupTotalScores(studentData, selectedGroup);
            });

            d3.select('#prev-slide').style('display', 'block');
            d3.select('#next-slide').style('display', 'block');

            // Initialize the chart with the default group
            drawGroupTotalScores(studentData, 'Group A');
            break;
        case 5:
            // Slide 5: Test Prep Course Effectiveness
            container.html(`
                <h1>Test Prep Course Effectiveness</h1>
                <div id="prep-chart"></div>
            `);
            // Add bar chart drawing logic here
            d3.select('#prev-slide').style('display', 'block');
            d3.select('#next-slide').style('display', 'none');
            break;
    }
}

// Draw bar chart for Slide 2
function drawBarChart(data, topN = 10) {
    const svgWidth = 800;
    const svgHeight = 600; // Increased height for better space utilization
    const margin = { top: 20, right: 20, bottom: 70, left: 60 }; // Adjusted margins for labels
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Clear existing chart
    d3.select('#bar-chart').html('');

    const svg = d3.select('#bar-chart').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data
    const processedData = data.map((d, index) => ({
        id: d['student id'], // Use the student id directly from CSV
        avgScore: (parseFloat(d['math score']) + parseFloat(d['reading score']) + parseFloat(d['writing score'])) / 3,
        details: d
    })).sort((a, b) => b.avgScore - a.avgScore).slice(0, topN);

    const x = d3.scaleBand()
        .domain(processedData.map(d => d.id))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.avgScore)])
        .nice()
        .range([height, 0]);

    svg.append('g')
        .selectAll('.bar')
        .data(processedData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.id))
        .attr('y', d => y(d.avgScore))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.avgScore))
        .on('mouseover', function(event, d) {
            d3.select(this).style('fill', 'orange');
            d3.select('#tooltip')
                .style('opacity', 1)
                .html(`
                    <strong>Student ID:</strong> ${d.details['student id']}<br>
                    <strong>Gender:</strong> ${d.details.gender}<br>
                    <strong>Race/Ethnicity:</strong> ${d.details['race/ethnicity']}<br>
                    <strong>Math Score:</strong> ${d.details['math score']}<br>
                    <strong>Reading Score:</strong> ${d.details['reading score']}<br>
                    <strong>Writing Score:</strong> ${d.details['writing score']}
                `)
                .style('left', `${event.pageX + 5}px`)
                .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function() {
            d3.select(this).style('fill', 'steelblue');
            d3.select('#tooltip').style('opacity', 0);
        });

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `#${d}`))
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', 50) // Adjusted position for label
        .attr('fill', 'black')
        .text('Student Id');

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', -height / 2)
        .attr('y', -50) // Adjusted position for label
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'black')
        .text('Total Student Scores');
}

// Draw pie chart for Slide 3
function drawPieChart(data) {
    const svgWidth = 400;
    const svgHeight = 400;
    const radius = Math.min(svgWidth, svgHeight) / 2;
    const color = d3.scaleOrdinal().range(['#98abc5', '#8a89a6']);

    const svg = d3.select('#pie-chart').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${svgWidth / 2},${svgHeight / 2})`);

    // Process data
    const passCounts = d3.rollups(data, v => v.length, d => d.gender === 'male' ? 'Male' : 'Female')
        .map(([key, value]) => ({ gender: key, count: value }));

    const pie = d3.pie().value(d => d.count)(passCounts);
    const arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
    const labelArc = d3.arc().outerRadius(radius - 40).innerRadius(radius - 40);

    const g = svg.selectAll('.arc')
        .data(pie)
        .enter().append('g')
        .attr('class', 'arc')
        .on('click', function(event, d) {
            updateTopPerformersTable(data, d.data.gender);
        });

    g.append('path')
        .attr('d', arc)
        .style('fill', d => color(d.data.gender));

    g.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('dy', '.35em')
        .text(d => `${d.data.gender}: ${d.data.count}`);

    // Initialize the table with top 3 male and top 3 female students
    drawTopPerformersTable(data);
}

// Draw the top performers table
function drawTopPerformersTable(data) {
    const topPerformers = getTopPerformers(data);

    const table = d3.select('#details-table');
    table.html(''); // Clear the table

    const thead = table.append('table').append('thead').append('tr');
    thead.append('th').text('Student ID');
    thead.append('th').text('Gender');
    thead.append('th').text('Race/Ethnicity');
    thead.append('th').text('Math Score');
    thead.append('th').text('Reading Score');
    thead.append('th').text('Writing Score');

    const tbody = table.select('table').append('tbody');

    topPerformers.forEach(d => {
        const row = tbody.append('tr');
        row.append('td').text(d['student id']);
        row.append('td').text(d.gender);
        row.append('td').text(d['race/ethnicity']);
        row.append('td').text(d['math score']);
        row.append('td').text(d['reading score']);
        row.append('td').text(d['writing score']);
    });
}

// Get the top 3 male and top 3 female students
function getTopPerformers(data) {
    const sortedData = data.sort((a, b) => ((parseFloat(b['math score']) + parseFloat(b['reading score']) + parseFloat(b['writing score'])) / 3) -
        ((parseFloat(a['math score']) + parseFloat(a['reading score']) + parseFloat(a['writing score'])) / 3));

    const topMales = sortedData.filter(d => d.gender === 'male').slice(0, 3);
    const topFemales = sortedData.filter(d => d.gender === 'female').slice(0, 3);

    return [...topMales, ...topFemales];
}

// Update the top performers table based on gender
function updateTopPerformersTable(data, gender) {
    const topPerformers = getTopPerformers(data.filter(d => d.gender.toLowerCase() === gender.toLowerCase()));

    const table = d3.select('#details-table');
    table.html(''); // Clear the table

    const thead = table.append('table').append('thead').append('tr');
    thead.append('th').text('Student ID');
    thead.append('th').text('Gender');
    thead.append('th').text('Race/Ethnicity');
    thead.append('th').text('Math Score');
    thead.append('th').text('Reading Score');
    thead.append('th').text('Writing Score');

    const tbody = table.select('table').append('tbody');

    topPerformers.forEach(d => {
        const row = tbody.append('tr');
        row.append('td').text(d['student id']);
        row.append('td').text(d.gender);
        row.append('td').text(d['race/ethnicity']);
        row.append('td').text(d['math score']);
        row.append('td').text(d['reading score']);
        row.append('td').text(d['writing score']);
    });
}

// Draw bar graph for Slide 4 based on selected group and total scores
function drawGroupTotalScores(data, selectedGroup) {
    const svgWidth = 800;
    const svgHeight = 600;
    const margin = { top: 20, right: 20, bottom: 70, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Clear existing chart
    d3.select('#ethnicity-chart').html('');

    const svg = d3.select('#ethnicity-chart').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data
    const groupData = data.filter(d => d['race/ethnicity'] === selectedGroup);
    const totalScore = groupData.reduce((sum, d) => sum + ((parseFloat(d['math score']) + parseFloat(d['reading score']) + parseFloat(d['writing score'])) / 3), 0);

    const groupScores = [{ group: selectedGroup, totalScore }];

    const x = d3.scaleBand()
        .domain(groupScores.map(d => d.group))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(groupScores, d => d.totalScore)])
        .nice()
        .range([height, 0]);

    svg.append('g')
        .selectAll('.bar')
        .data(groupScores)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.group))
        .attr('y', d => y(d.totalScore))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.totalScore))
        .attr('fill', 'steelblue');

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));
}

// Change to the next slide
function nextSlide() {
    if (currentSlide < 5) {
        currentSlide++;
        updateSlide(currentSlide);
    }
}

// Change to the previous slide
function prevSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        updateSlide(currentSlide);
    }
}

// Initialize the slides
initSlides();
