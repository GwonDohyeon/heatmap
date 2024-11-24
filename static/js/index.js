const urls = [heatmapDataUrl];
Promise.all(urls.map(url => d3.json(url))).then(run);
function run(dataset) {
d3heatmap(dataset[0]);
};