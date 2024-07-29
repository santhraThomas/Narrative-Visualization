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
        updateSlide(1); // Update Slide 2 after loading data
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
                    <input type="number" id="top-n" placeholder="Enter number" />
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
            // Slide 3: Male/Female Pass Ratio
            container.html(`
                <h1>Male/Female Pass Ratio</h1>
                <div id="pie-chart"></div>
                <div id="details-table"></div>
            `);
            // Add pie chart drawing logic here
            d3.select('#prev-slide').style('display', 'block');
            d3.select('#next-slide').style('display', 'block');
            break;
        case 4:
            // Slide 4: Race/Ethnicity of Students
            container.html(`
                <h1>Race/Ethnicity of Students</h1>
                <div id="ethnicity-chart"></div>
            `);
            // Add bar chart drawing logic here
            d3.select('#prev-slide').style('display', 'block');
            d3.select('#next-slide').style('display', 'block');
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
