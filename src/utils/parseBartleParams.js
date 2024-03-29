let parseBartleParams = function() {
    const params = new URLSearchParams(window.location.search);
    let searchParams = ['soc', 'kil', 'ach', 'exp'];
    const values = [];
    for(let i = 0; i < searchParams.length; i++) {
        const val = parseInt(params.get(`${searchParams[i]}`));
        if (!isNaN(val) && val >= 0 && val <= 100) {
            values.push(val);
        } else {
            // If parameter is missing or not within range, set default value
            values.push(-1);
        }
    }
    return {
        socializer: values[0],
        killer: values[1],
        achiever: values[2],
        explorer: values[3]
    }
}

export default parseBartleParams;