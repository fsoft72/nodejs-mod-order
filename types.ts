/* Types file generated by flow2code */

/*=== f2c_start __file ===*/
import { User, UserSmall } from '../user/types';
/*=== f2c_end __file ===*/
/** OrderStatus - Status of an order */
export enum OrderStatus {
	/** The order has been cancelled */
	cancelled = "cancelled",
	/** The order is completed */
	completed = "completed",
	/** We are working on your order */
	in_progress = "in_progress",
	/** The order is brand new */
	new = "new",
	/** The order has been paid */
	paid = "paid",
	/** The order is pending */
	pending = "pending",
	/** The order is ready to be processed */
	ready = "ready",
	/** The order is ready to be delivered */
	to_deliver = "to_deliver",
	/** The transaction has started */
	transaction = "transaction",
};

export const OrderStatusObj = {
	__name: "OrderStatus",
	cancelled: "cancelled",
	completed: "completed",
	in_progress: "in_progress",
	new: "new",
	paid: "paid",
	pending: "pending",
	ready: "ready",
	to_deliver: "to_deliver",
	transaction: "transaction",
};

/** OrderPaymentStatus - The status of order payment */
export enum OrderPaymentStatus {
	/** The payment has been aborted */
	aborted = "aborted",
	/** The order has been canceled */
	canceled = "canceled",
	/** The order is in the paying process */
	in_pay = "in_pay",
	/** The order is not paied yet */
	not_paid = "not_paid",
	/** The order has been paid */
	paid = "paid",
	/** The payment has been refunded */
	refunded = "refunded",
};

export const OrderPaymentStatusObj = {
	__name: "OrderPaymentStatus",
	aborted: "aborted",
	canceled: "canceled",
	in_pay: "in_pay",
	not_paid: "not_paid",
	paid: "paid",
	refunded: "refunded",
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
	/** Session ID (when the user is not logged in) */
	session?: string;
	/** The order status [ 'new', 'open', 'confirmed', 'completed', 'canceled', 'aborted'] */
	status?: OrderStatus;
	/** Total order amount (vat excl) */
	total_net?: number;
	/** Total order amount (vat incl) */
	total_vat?: number;
	/** The full price without discounts */
	original_total_vat?: number;
	/** Percentage of discount */
	discount?: number;
	/** Number of items in the order */
	num_items?: number;
	/** Flag T/F for the orders are valid */
	valid?: boolean;
	/** Payment mode */
	payment_mode?: string;
	/** The transaction ID */
	transaction_id?: string;
	/** The session ID for payment */
	session_id?: string;
	payment_status?: OrderPaymentStatus;
	/** When the order has been deleted */
	deleted?: Date;
	/** Small user details */
	user?: UserSmall;
	/** Order user notes */
	notes?: string;
	/** The delivery address */
	address?: any;
}

export const OrderKeys = {
	'id': { type: 'string', priv: false },
	'domain': { type: 'string', priv: false },
	'code': { type: 'string', priv: false },
	'id_user': { type: 'string', priv: false },
	'session': { type: 'string', priv: false },
	'status': { type: 'OrderStatus', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'original_total_vat': { type: 'number', priv: false },
	'discount': { type: 'number', priv: false },
	'num_items': { type: 'number', priv: false },
	'valid': { type: 'boolean', priv: false },
	'payment_mode': { type: 'string', priv: false },
	'transaction_id': { type: 'string', priv: false },
	'session_id': { type: 'string', priv: false },
	'payment_status': { type: 'OrderPaymentStatus', priv: false },
	'deleted': { type: 'Date', priv: false },
	'user': { type: 'UserSmall', priv: false },
	'notes': { type: 'string', priv: false },
	'address': { type: 'any', priv: false },
};

/** OrderItem */
export interface OrderItem {
	/** the main id field */
	id: string;
	/** The domain name */
	domain: string;
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
	id: string;
	/** Unique order code */
	code: string;
	/** The user id */
	id_user: string;
	/** The user that created the order */
	user: User;
	/** The order status [ 'new', 'open', 'confirmed', 'completed', 'canceled', 'aborted'] */
	status: OrderStatus;
	/** Total order amount (vat excl) */
	total_net: number;
	/** Total order amount (vat incl) */
	total_vat: number;
	/** Number of items */
	num_items: number;
	/** Number of items in the order */
	items: OrderItem[];
	/** Flag T/F for the orders are valid */
	valid: boolean;
	/** Payment mode */
	payment?: string;
	/** The full price of all elements */
	original_total_vat: number;
	/** Total order discount */
	discount: number;
	/** The payment mode used */
	payment_mode: string;
	/** The transaction id */
	transaction_id: string;
	/** Order payment status */
	payment_status: OrderPaymentStatus;
	/** Order Creation Date */
	created: Date;
	/** Order notes */
	notes: string;
	/** Delivery address */
	address: any;
}

export const OrderFullKeys = {
	'id': { type: 'string', priv: false },
	'code': { type: 'string', priv: false },
	'id_user': { type: 'string', priv: false },
	'user': { type: 'User', priv: false },
	'status': { type: 'OrderStatus', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'num_items': { type: 'number', priv: false },
	'items': { type: 'OrderItem[]', priv: false },
	'valid': { type: 'boolean', priv: false },
	'payment': { type: 'string', priv: false },
	'original_total_vat': { type: 'number', priv: false },
	'discount': { type: 'number', priv: false },
	'payment_mode': { type: 'string', priv: false },
	'transaction_id': { type: 'string', priv: false },
	'payment_status': { type: 'OrderPaymentStatus', priv: false },
	'created': { type: 'Date', priv: false },
	'notes': { type: 'string', priv: false },
	'address': { type: 'any', priv: false },
};

/** OrderPaymentLog */
export interface OrderPaymentLog {
	/** the main id field */
	id: string;
	/** The order ID */
	id_order: string;
	/** The payment mode */
	payment_mode: string;
	/** The transaction id */
	transaction_id: string;
	session_id?: string;
	/** Event name */
	event_name?: string;
	/** Transaction data */
	data?: any;
}

export const OrderPaymentLogKeys = {
	'id': { type: 'string', priv: false },
	'id_order': { type: 'string', priv: false },
	'payment_mode': { type: 'string', priv: false },
	'transaction_id': { type: 'string', priv: false },
	'session_id': { type: 'string', priv: false },
	'event_name': { type: 'string', priv: false },
	'data': { type: 'any', priv: false },
};

