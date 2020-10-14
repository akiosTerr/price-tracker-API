class CreateResponse {
	response_updated(newPrice, lastPrice, createdAt) {
		return {
			status: 1,
			priceChange: true,
			createdAt,
			newPrice,
			lastPrice,
		};
	}
	response_first(newPrice, createdAt) {
		return {
			status: 1,
			priceChange: true,
			createdAt,
			newPrice,
		};
	}
	response_unchanged() {
		return {
			status: 1,
			priceChange: false,
		};
	}
	response_error(payload) {
		return {
			status: 0,
			errorData: payload,
		};
	}
}

module.exports = CreateResponse;
