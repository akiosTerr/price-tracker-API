const convertToFloat = (array) => {
	const filtered = array.filter((item) => item !== undefined);
	const values = filtered.map((value) => {
		const string1 = value.replace(/([a-zA-Z]\$)|\./g, '');
		const string2 = string1.replace(/[,]/g, '.');
		return Number(string2);
	});
	return values;
};

module.exports = {
	convertToFloat,
};
