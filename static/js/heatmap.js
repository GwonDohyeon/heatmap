function d3heatmap(dji) {
    console.log(dji);
    const width = 1000;
    const cellSize = 17;
    const height = cellSize * 7;
    const formatValue = d3.format("+.2%");
    const formatClose = d3.format("$,.2f");
    const formatDate = d3.utcFormat("%x");
    const formatDay = i => "SMTWTFS"[i];
    const formatMonth = d3.utcFormat("%b");

    const timeWeek = d3.utcMonday;
    const countDay = i => (i + 6) % 7;

    // Correct approach to calculating the percentage change
    const data = d3.pairs(dji, ({ Close: Previous }, { Date: date, Close }) => ({
        date: new Date(date),  // Ensure this is treated as a Date object
        value: (Close - Previous) / Previous,
        close: Close
    }));
    

    const max = 0.05; // 5% max value
    const color = d3.scaleSequential(d3.interpolatePiYG).domain([-max, +max]).clamp(true);

    const years = d3.groups(data, d => d.date.getUTCFullYear()).reverse();

    function pathMonth(t) {
        const d = Math.max(0, Math.min(5, countDay(t.getUTCDay())));
        const w = timeWeek.count(d3.utcYear(t), t);
        return `${d === 0 ? `M${w * cellSize},0`
            : d === 5 ? `M${(w + 1) * cellSize},0`
            : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${5 * cellSize}`;
    }

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height * years.length + 80) // Added space for legend
        .attr("viewBox", [0, 0, width, height * years.length + 80])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(40, 20)`); // Move the legend up

    const legendWidth = 500;
    const legendHeight = 20;

    // Define gradient for the legend
    const defs = svg.append("defs");

    const gradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color(-max));

    gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", color(0));

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color(max));

    // Apply gradient to the legend rectangle
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    // Legend scale
    const legendScale = d3.scaleLinear()
        .domain([-max, max])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(3)
        .tickFormat(formatValue);

    legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);

    // Visualize the data
    const year = svg.selectAll("g.year")
        .data(years)
        .join("g")
        .attr("transform", (d, i) => `translate(40.5,${height * i + cellSize * 4.5})`); // Move data down

    year.append("text")
        .attr("x", -5)
        .attr("y", -5)
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .text(([key]) => key);

    year.append("g")
        .attr("text-anchor", "end")
        .selectAll()
        .data(d3.range(1, 6))
        .join("text")
        .attr("x", -5)
        .attr("y", i => (countDay(i) + 0.5) * cellSize)
        .attr("dy", "0.31em")
        .text(formatDay);

        year.append("g")
        .selectAll()
        .data(([, values]) => values.filter(d => ![0, 6].includes(d.date.getUTCDay())))
        .join("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", d => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5)
        .attr("y", d => countDay(d.date.getUTCDay()) * cellSize + 0.5)
        .attr("fill", d => color(d.value))
        .on("mouseenter", function(e) {
            d3.select(this).style("stroke", "black").style("stroke-width", "1.5px");
        })
        .on("mouseleave", function() {
            d3.select(this).style("stroke", null); // 테두리 제거
        })
        .append("title")
        .text(d => `${formatDate(d.date)}\n변동: ${formatValue(d.value)}\n종가: ${d.close === undefined ? "정보 없음" : formatClose(d.close)}`);
    
        const month = year.append("g")
        .selectAll()
        .data(([, values]) => {
            // 각 날짜에서 월을 추출하고 고유한 값만 취합니다.
            const months = Array.from(new Set(values.map(d => d.date.getUTCMonth())));
            return months.map(month => ({
                month: month,
                date: values.find(d => d.date.getUTCMonth() === month).date
            }));
        })
        .join("g");
    
    month.append("text")
        .attr("x", d => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize)
        .attr("y", -5)
        .style("fill", "#000")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .text(d => formatMonth(d.date)); // 월을 표시
    

    document.getElementById('heatmap').appendChild(svg.node());
}
