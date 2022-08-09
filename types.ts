/*=== d2r_start __header === */
import { User } from "../user/types";
/*=== d2r_end __header ===*/

export enum OrderStatus {
	cancelled = "cancelled",
	completed = "completed",
	in_pay = "in_pay",
	in_progress = "in_progress",
	new = "new",
	paid = "paid",
	payment_error = "payment_error",
	to_deliver = "to_deliver",
};

export const OrderStatusObj = {
	__name: "OrderStatus",
	cancelled: "cancelled",
	completed: "completed",
	in_pay: "in_pay",
	in_progress: "in_progress",
	new: "new",
	paid: "paid",
	payment_error: "payment_error",
	to_deliver: "to_deliver",
};

/** Order */
export interface Order {
	/** the main id field */
	id?: string;
	/** The domain name */
	domain?: string;
	/** Unique order code */
	code?: string;
	/** The user that created the owner */
	id_user?: string;
	/** The user name */
	user_name?: string;
	/** The user lastname */
	user_lastname?: string;
	/** The user email */
	user_email?: string;
	/** Session ID (when the user is not logged in) */
	session?: string;
	/** The order status [ 'new', 'open', 'confirmed', 'completed', 'canceled', 'aborted'] */
	status?: OrderStatus;
	/** Total order amount (vat excl) */
	total_net?: number;
	/** Total order amount (vat incl) */
	total_vat?: number;
	/** Number of items in the order */
	num_items?: number;
	/** Flag T/F for the orders are valid */
	valid?: boolean;
	/** Payment mode */
	id_payment?: string;
}

export const OrderKeys = {
	'id': { type: 'string', priv: false },
	'domain': { type: 'string', priv: true },
	'code': { type: 'string', priv: false },
	'id_user': { type: 'string', priv: false },
	'user_name': { type: 'string', priv: false },
	'user_lastname': { type: 'string', priv: false },
	'user_email': { type: 'string', priv: false },
	'session': { type: 'string', priv: false },
	'status': { type: 'OrderStatus', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'num_items': { type: 'number', priv: false },
	'valid': { type: 'boolean', priv: false },
	'id_payment': { type: 'string', priv: false },
};

/** OrderItem */
export interface OrderItem {
	/** the main id field */
	id?: string;
	/** The domain name */
	domain?: string;
	/** Order ID */
	id_order?: string;
	/** Product unique code */
	prod_code?: string;
	/** Product name */
	name?: string;
	/** Quantity */
	quant?: number;
	/** Original price (vat excl) */
	orig_price_net?: number;
	/** Original price (vat inc) */
	orig_price_vat?: number;
	/** Price net */
	price_net?: number;
	/** Price vat */
	price_vat?: number;
	/** Total net */
	total_net?: number;
	/** Total vat */
	total_vat?: number;
	/** Original total net */
	orig_total_net?: number;
	/** Original total vat */
	orig_total_vat?: number;
	/** The applied VAT */
	vat?: number;
	/** Coupon name */
	coupon?: string;
	/** Product image */
	image?: string;
}

export const OrderItemKeys = {
	'id': { type: 'string', priv: false },
	'domain': { type: 'string', priv: true },
	'id_order': { type: 'string', priv: false },
	'prod_code': { type: 'string', priv: false },
	'name': { type: 'string', priv: false },
	'quant': { type: 'number', priv: false },
	'orig_price_net': { type: 'number', priv: false },
	'orig_price_vat': { type: 'number', priv: false },
	'price_net': { type: 'number', priv: false },
	'price_vat': { type: 'number', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'orig_total_net': { type: 'number', priv: false },
	'orig_total_vat': { type: 'number', priv: false },
	'vat': { type: 'number', priv: false },
	'coupon': { type: 'string', priv: false },
	'image': { type: 'string', priv: false },
};

/** OrderFull */
export interface OrderFull {
	/** the main id field */
	id?: string;
	/** Unique order code */
	code?: string;
	/** The user that created the order */
	user?: User;
	/** The order status [ 'new', 'open', 'confirmed', 'completed', 'canceled', 'aborted'] */
	status?: OrderStatus;
	/** Total order amount (vat excl) */
	total_net?: number;
	/** Total order amount (vat incl) */
	total_vat?: number;
	/** Number of items */
	num_items?: number;
	/** Number of items in the order */
	items?: OrderItem[];
	/** Flag T/F for the orders are valid */
	valid?: boolean;
	/** Payment mode */
	payment?: string;
}

export const OrderFullKeys = {
	'id': { type: 'string', priv: false },
	'code': { type: 'string', priv: false },
	'user': { type: 'User', priv: false },
	'status': { type: 'OrderStatus', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'num_items': { type: 'number', priv: false },
	'items': { type: 'OrderItem[]', priv: false },
	'valid': { type: 'boolean', priv: false },
	'payment': { type: 'string', priv: false },
};

