/*=== d2r_start __header === */
import { User } from "../user/types";
/*=== d2r_end __header ===*/

/** Order */
export interface Order {
	/** Order unique ID */
	id?: string;
	/** The domain name */
	domain?: string;
	/** Unique order code */
	code?: string;
	/** The user that created the owner */
	id_user?: string;
	/**  */
	user_name?: string;
	/**  */
	user_lastname?: string;
	/**  */
	user_email?: string;
	/** Session ID (when the user is not logged in) */
	session?: string;
	/** The order status [ 'new', 'open', 'confirmed', 'completed', 'canceled', 'aborted'] */
	status?: string;
	/** Total order amount (vat excl) */
	total_net?: number;
	/** Total order amount (vat incl) */
	total_vat?: number;
	/** of items in the order */
	items?: any;
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
	'status': { type: 'string', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'items': { type: 'any', priv: false },
	'valid': { type: 'boolean', priv: false },
	'id_payment': { type: 'string', priv: false },
};

/** OrderItem */
export interface OrderItem {
	/** item unique ID */
	id?: any;
	/** The domain name */
	domain?: string;
	/** ID */
	id_order?: any;
	/** Product unique code */
	prod_code?: string;
	/** Product name */
	name?: string;
	/** Quantity */
	quant?: number;
	/** Price net */
	price_net?: number;
	/** Price vat */
	price_vat?: number;
	/** Total net */
	total_net?: number;
	/** Total vat */
	total_vat?: number;
	/** The applied VAT */
	vat?: number;
	/** Coupon name */
	coupon?: string;
}

export const OrderItemKeys = {
	'id': { type: 'any', priv: false },
	'domain': { type: 'string', priv: false },
	'id_order': { type: 'any', priv: false },
	'prod_code': { type: 'string', priv: false },
	'name': { type: 'string', priv: false },
	'quant': { type: 'number', priv: false },
	'price_net': { type: 'number', priv: false },
	'price_vat': { type: 'number', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'vat': { type: 'number', priv: false },
	'coupon': { type: 'string', priv: false },
};

/** OrderFull */
export interface OrderFull {
	/** unique ID */
	id?: any;
	/** Unique order code */
	code?: string;
	/** The user that created the order */
	user?: User;
	/** The order status [ 'new', 'open', 'confirmed', 'completed', 'canceled', 'aborted'] */
	status?: string;
	/** Total order amount (vat excl) */
	total_net?: number;
	/** Total order amount (vat incl) */
	total_vat?: number;
	/** of items in the order */
	items?: any;
	/** Flag T/F for the orders are valid */
	valid?: boolean;
	/** Payment mode */
	payment?: string;
}

export const OrderFullKeys = {
	'id': { type: 'any', priv: false },
	'code': { type: 'string', priv: false },
	'user': { type: 'User', priv: false },
	'status': { type: 'string', priv: false },
	'total_net': { type: 'number', priv: false },
	'total_vat': { type: 'number', priv: false },
	'items': { type: 'any', priv: false },
	'valid': { type: 'boolean', priv: false },
	'payment': { type: 'string', priv: false },
};

