const Status={
	DELIVERED:"delivered",
	CANCELLED:"cancelled",
	FAILED:"failed",
	NEW:"new"
}
const DeliveryMode={
	STORE_DEL:"store_del",
	HOME_DEL:"home_del",
	ACCESS_PTS:"access_points"
}
const PaymentStatus={
	PAID:"paid",
	UNPAID:"unpaid"
}
const Url={
	//BASE_URL:"localhost:3000"
	BASE_URL:"https://access-points.herokuapp.com"
}
module.exports={
	Status,
	DeliveryMode,
	PaymentStatus,
	Url
};