
import { ILRequest, ILResponse, LCback, ILiweConfig, ILError, ILiWE } from '../../liwe/types';
import { mkid } from '../../liwe/utils';
import { collection_add, collection_count, collection_find_all, collection_find_one, collection_find_one_dict, collection_find_all_dict, collection_del_one_dict, collection_del_all_dict, collection_init, prepare_filters } from '../../liwe/arangodb';
import { DocumentCollection } from 'arangojs/collection';
import { $l } from '../../liwe/locale';

import {
	Order, OrderFull, OrderFullKeys, OrderItem, OrderItemKeys, OrderKeys, OrderPaymentLog, OrderPaymentLogKeys, OrderPaymentStatus, OrderStatus
} from './types';

let _liwe: ILiWE = null;

const _ = ( txt: string, vals: any = null, plural = false ) => {
	return $l( txt, vals, plural, "order" );
};

let _coll_orders: DocumentCollection = null;
let _coll_order_items: DocumentCollection = null;
let _coll_order_log: DocumentCollection = null;

const COLL_ORDERS = "orders";
const COLL_ORDER_ITEMS = "order_items";
const COLL_ORDER_LOG = "order_log";

/*=== d2r_start __file_header === */
import { system_domain_get_by_session } from '../system/methods';
import { Product } from '../product/types';
import { product_get } from '../product/methods';
import { date_format, keys_filter } from '../../liwe/utils';
import { user_get } from '../user/methods';
import { User } from '../user/types';
import { challenge_check, keys_remove } from '../../liwe/utils';

const mkcode = () => {
	const d = date_format( new Date(), 'yyyymmddHHMMSS' );

	return d;
};

const _order_get = async ( req: ILRequest, id?: string, code?: string, id_user?: string, full: boolean = false ) => {
	let order: Order = null;
	const domain = await system_domain_get_by_session( req );
	let user: User = null;

	if ( !id_user ) id_user = req?.user?.id || 'xxx';

	if ( id || code ) {
		order = await collection_find_one_dict( req.db, COLL_ORDERS, { id, code } );
	} else {
		order = await collection_find_one_dict( req.db, COLL_ORDERS, { id_user, status: 'new' } );
	}

	if ( !order ) {
		order = { id: mkid( 'order' ), id_user: req.user.id, domain: domain.code, status: OrderStatus.new, code: mkcode() };
		order = await collection_add( _coll_orders, order );
	} else {
		if ( full ) user = await user_get( order.id_user );
		( order as any ).user = user;
	}

	return order;
};

const _order_get_full = async ( req: ILRequest, id?: string | null, code?: string | null, filter = true ) => {
	let order: OrderFull = null;

	order = await _order_get( req, id, code, null, true );

	if ( !order ) return null;

	const items: OrderItem[] = await collection_find_all_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id }, OrderItemKeys );
	order.items = items;
	_calc_order_tots( order, items );

	if ( filter ) keys_filter( order, OrderFullKeys );

	return order;
};

const _add_prod = ( req: ILRequest, order: Order, prod_code: string, qnt: number, single: boolean = false ): Promise<OrderFull> => {
	return new Promise( async ( resolve, reject ) => {
		let order_item: OrderItem = null;

		if ( single ) {
			await collection_del_one_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id, prod_code } );
			qnt = 1;
		} else {
			order_item = await collection_find_one_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id, prod_code } );
		}

		if ( !order_item ) order_item = { id: mkid( 'oitem' ), domain: order.domain, quant: 0 };

		const prod: Product = await product_get( req, null, prod_code );
		const err = { message: 'Product not found' };
		if ( !prod ) return reject( err );

		order_item.name = prod.name;
		order_item.id_order = order.id;
		order_item.prod_code = prod.code;
		order_item.quant += qnt;
		// Original price is saved to see discount
		order_item.orig_price_net = prod.price_net;
		order_item.orig_price_vat = prod.price_vat;
		order_item.orig_total_net = order_item.orig_price_net * order_item.quant;
		order_item.orig_total_vat = order_item.orig_price_vat * order_item.quant;

		// In the order_item the "price_net/vat" is the price with discount
		order_item.price_net = prod.curr_price_net;
		order_item.price_vat = prod.curr_price_vat;
		order_item.total_net = order_item.price_net * order_item.quant;
		order_item.total_vat = order_item.price_vat * order_item.quant;

		order_item.vat = prod.vat;
		order_item.image = prod.image_url;

		console.log( "\n\n\n==== IMAGE: ", order_item.image );

		await collection_add( _coll_order_items, order_item );
		const items: OrderItem[] = await _calc_order_tots_fetch( req, order );

		return resolve( { ...order, items } );
	} );
};

const _calc_order_tots_fetch = async ( req: ILRequest, order: Order ) => {
	const items: OrderItem[] = await collection_find_all_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id }, OrderItemKeys );

	_calc_order_tots( order, items );

	await collection_add( _coll_orders, order );

	return items;
};

const _calc_order_tots = ( order: Order, items: OrderItem[] ) => {
	let elems = 0;
	let tot_net = 0;
	let tot_vat = 0;
	let orig_tot_vat = 0;

	if ( items ) {
		items.forEach( ( it: OrderItem ) => {
			elems += it.quant;
			tot_net += it.total_net;
			tot_vat += it.total_vat;
			orig_tot_vat += it.orig_total_vat;
		} );
	}

	order.num_items = elems;
	order.total_net = tot_net;
	order.total_vat = tot_vat;
	order.original_total_vat = orig_tot_vat;
	// calc discount % from original_total_vat and total_vat, as integer
	order.discount = Math.round( ( orig_tot_vat - tot_vat ) / orig_tot_vat * 100 );
};
/*=== d2r_end __file_header ===*/

// {{{ post_order_admin_add ( req: ILRequest, prod_code: string, qnt: number, id_user: string, cback: LCBack = null ): Promise<Order>
/**
 * Adds order in the system.

This function returns the full `Order` structure
 *
 * @param prod_code - Product Code [req]
 * @param qnt - Quantity to add [req]
 * @param id_user - The ID user to add the order to [req]
 *
 */
export const post_order_admin_add = ( req: ILRequest, prod_code: string, qnt: number, id_user: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_admin_add ===*/
		const order: Order = await _order_get( req, null, null, id_user, false );
		/*=== d2r_end post_order_admin_add ===*/
	} );
};
// }}}

// {{{ patch_order_admin_update ( req: ILRequest, id: string, name?: string, cback: LCBack = null ): Promise<Order>
/**
 * Updates the order specified by `id`.

This function returns the full `Order` structure
 *
 * @param id - Order ID [req]
 * @param name - Order name [opt]
 *
 */
export const patch_order_admin_update = ( req: ILRequest, id: string, name?: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start patch_order_admin_update ===*/

		/*=== d2r_end patch_order_admin_update ===*/
	} );
};
// }}}

// {{{ patch_order_admin_fields ( req: ILRequest, id: string, data: any, cback: LCBack = null ): Promise<Order>
/**
 * The call modifies one or more fields.

This function returns the full `Order` structure
 *
 * @param id - The order ID [req]
 * @param data - The field / value to patch [req]
 *
 */
export const patch_order_admin_fields = ( req: ILRequest, id: string, data: any, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start patch_order_admin_fields ===*/

		/*=== d2r_end patch_order_admin_fields ===*/
	} );
};
// }}}

// {{{ get_order_admin_list ( req: ILRequest, skip: number = 0, rows: number = -1, cback: LCBack = null ): Promise<Order[]>
/**
 * Returns all orders.

This function returns a list of full `Order` structure.

This function supports pagination.
 *
 * @param skip - First line to return [opt]
 * @param rows - How many rows to return [opt]
 *
 */
export const get_order_admin_list = ( req: ILRequest, skip: number = 0, rows: number = -1, cback: LCback = null ): Promise<Order[]> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start get_order_admin_list ===*/
		const results: any[] = await collection_find_all( req.db, `
		FOR o IN orders
			FILTER o.deleted == null
			FOR u IN users
				FILTER u.id == o.id_user
				RETURN { order: o, user: { id: u.id, name: u.name, lastname: u.lastname, email: u.email } }`, {} );

		const orders: Order[] = results.map( ( s ) => {
			s.order.user = s.user;
			keys_remove( s.order, [ '_id', '_key', '_rev' ] );
			return s.order;
		} );

		// keys_filter( orders, OrderFullKeys );

		return cback ? cback( null, orders ) : resolve( orders );
		/*=== d2r_end get_order_admin_list ===*/
	} );
};
// }}}

// {{{ delete_order_admin_del ( req: ILRequest, id: string, cback: LCBack = null ): Promise<string>
/**
 * Deletes a order from the system.
 *
 * @param id - The order id to be deleted [req]
 *
 */
export const delete_order_admin_del = ( req: ILRequest, id: string, cback: LCback = null ): Promise<string> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start delete_order_admin_del ===*/
		const err = { message: 'Order not found' };
		const order: Order = await _order_get( req, id, null, null, false );

		if ( !order ) return cback ? cback( err, null ) : reject( err );

		order.deleted = new Date();

		await collection_add( _coll_orders, order );

		return cback ? cback( null, id ) : resolve( id );
		/*=== d2r_end delete_order_admin_del ===*/
	} );
};
// }}}

// {{{ post_order_admin_tag ( req: ILRequest, id: string, tags: string[], cback: LCBack = null ): Promise<Order>
/**
 * This endpoint allows you to add tags to an order.
 *
 * @param id - The order ID [req]
 * @param tags - A list of tags to be added to the user [req]
 *
 */
export const post_order_admin_tag = ( req: ILRequest, id: string, tags: string[], cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_admin_tag ===*/

		/*=== d2r_end post_order_admin_tag ===*/
	} );
};
// }}}

// {{{ post_order_add ( req: ILRequest, prod_code: string, qnt: number, single: boolean = false, cback: LCBack = null ): Promise<OrderFull>
/**
 * Adds a product to the current order.

This function returns the full `Order` structure
 *
 * @param prod_code - Product Code [req]
 * @param qnt - Quantity to add [req]
 * @param single - If the product can be added only once to the order [opt]
 *
 */
export const post_order_add = ( req: ILRequest, prod_code: string, qnt: number, single: boolean = false, cback: LCback = null ): Promise<OrderFull> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_add ===*/
		let order: Order = await _order_get( req );
		const orderFull: OrderFull = await _add_prod( req, order, prod_code, qnt, single );

		keys_filter( orderFull, OrderFullKeys );

		return cback ? cback( null, orderFull ) : resolve( orderFull );
		/*=== d2r_end post_order_add ===*/
	} );
};
// }}}

// {{{ get_order_details ( req: ILRequest, id: string, cback: LCBack = null ): Promise<OrderFull>
/**
 * Returns all order details only if the order is `visible`.

The order can be identified by  `id`, `code` or `code_forn`.

You can pass more than a field, but one is enough.

This function returns the full `Order` structure
 *
 * @param id - Order unique ID [req]
 *
 */
export const get_order_details = ( req: ILRequest, id: string, cback: LCback = null ): Promise<OrderFull> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start get_order_details ===*/
		const order: OrderFull = await _order_get( req, id, null, null, true ) as any;
		const items: OrderItem[] = await collection_find_all_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id }, OrderItemKeys );

		keys_filter( order, OrderFullKeys );
		order.items = items;

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end get_order_details ===*/
	} );
};
// }}}

// {{{ get_order_list ( req: ILRequest, rows: number = -1, skip: number = 0, cback: LCBack = null ): Promise<Order[]>
/**
 * Returns all visible orders.

Orders with `visible` set to `false` are not shown.

This function returns a list of full `Order` structure.

This function supports pagination.
 *
 * @param rows - How many rows to return [opt]
 * @param skip - First line to return [opt]
 *
 */
export const get_order_list = ( req: ILRequest, rows: number = -1, skip: number = 0, cback: LCback = null ): Promise<Order[]> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start get_order_list ===*/
		const orders: Order[] = await collection_find_all_dict( req.db, COLL_ORDERS, { id_user: req.user.id }, OrderKeys, { skip, rows } );

		return cback ? cback( null, orders ) : resolve( orders );
		/*=== d2r_end get_order_list ===*/
	} );
};
// }}}

// {{{ get_order_cart ( req: ILRequest, cback: LCBack = null ): Promise<OrderFull>
/**
 * Returns the current cart with products for the logged in user.

The order must be in status `new`
 *

 *
 */
export const get_order_cart = ( req: ILRequest, cback: LCback = null ): Promise<OrderFull> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start get_order_cart ===*/
		const order: OrderFull = await _order_get( req, null, null, req.user.id, false );

		// no order, or no order in 'new' means that the cart is empty
		if ( !order || order.status != OrderStatus.new ) return cback ? cback( {} ) : resolve( {} );

		const items: OrderItem[] = await collection_find_all_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id }, OrderItemKeys );
		order.items = items;
		_calc_order_tots( order, items );
		keys_filter( order, OrderFullKeys );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end get_order_cart ===*/
	} );
};
// }}}

// {{{ delete_order_item_del ( req: ILRequest, id_order: string, id_item: string, cback: LCBack = null ): Promise<OrderFull>
/**
 * Deletes an item from an order.

Order must be in state `new`.

Only admin and order owner can delete an item from an order.
 *
 * @param id_order - The order id [req]
 * @param id_item - The item id [req]
 *
 */
export const delete_order_item_del = ( req: ILRequest, id_order: string, id_item: string, cback: LCback = null ): Promise<OrderFull> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start delete_order_item_del ===*/
		const err = { message: 'Order not found' };
		const order: OrderFull = await _order_get( req, id_order );

		if ( !order ) return cback ? cback( err ) : reject( err );
		if ( order.status != OrderStatus.new ) {
			err.message = 'Order not modifiable';
			return cback ? cback( err ) : reject( err );
		}

		// TODO: also admin can delete an item
		if ( order.id_user != req.user.id ) {
			err.message = 'You are not the owner of this order';
			return cback ? cback( err ) : reject( err );
		}

		await collection_del_one_dict( req.db, COLL_ORDER_ITEMS, { id: id_item } );

		const items: OrderItem[] = await _calc_order_tots_fetch( req, order );

		await collection_add( _coll_orders, order );

		order.items = items;

		keys_filter( order, OrderFullKeys );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end delete_order_item_del ===*/
	} );
};
// }}}

// {{{ post_order_transaction_start ( req: ILRequest, id_order: string, challenge: string, payment_mode: string, transaction_id: string, session_id?: string, cback: LCBack = null ): Promise<OrderPaymentLog>
/**
 * The `challenge` parameter is a `MD5` hash created composing (`email` + `name` + `remote_secret_key` as set in the `data.json` config file under `security / remote`).
 *
 * @param id_order - The order ID [req]
 * @param challenge - The challenge verification code [req]
 * @param payment_mode - The payment mode [req]
 * @param transaction_id - The transaction ID [req]
 * @param session_id - The session ID (if any) [opt]
 *
 */
export const post_order_transaction_start = ( req: ILRequest, id_order: string, challenge: string, payment_mode: string, transaction_id: string, session_id?: string, cback: LCback = null ): Promise<OrderPaymentLog> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_transaction_start ===*/
		const err = { message: 'Invalid challenge' };

		if ( !challenge_check( challenge, [ id_order, transaction_id, session_id, payment_mode ] ) ) return cback ? cback( err ) : reject( err );

		const order = await order_transaction_start( req, id_order, payment_mode, transaction_id, session_id, 'transaction.start' );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end post_order_transaction_start ===*/
	} );
};
// }}}

// {{{ post_order_transaction_update ( req: ILRequest, challenge: string, payment_mode: string, transaction_id: string, session_id?: string, event_name?: string, data?: any, cback: LCBack = null ): Promise<OrderPaymentLog>
/**
 * The `challenge` parameter is a `MD5` hash created composing (`email` + `name` + `remote_secret_key` as set in the `data.json` config file under `security / remote`).
 *
 * @param challenge - The challenge verification code [req]
 * @param payment_mode - The payment mode [req]
 * @param transaction_id - The transaction ID [req]
 * @param session_id - The session ID (if any) [opt]
 * @param event_name - The event name [opt]
 * @param data - The JSON data [opt]
 *
 */
export const post_order_transaction_update = ( req: ILRequest, challenge: string, payment_mode: string, transaction_id: string, session_id?: string, event_name?: string, data?: any, cback: LCback = null ): Promise<OrderPaymentLog> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_transaction_update ===*/
		const err = { message: 'Invalid challenge' };

		if ( !challenge_check( challenge, [ payment_mode, transaction_id, session_id ] ) ) return cback ? cback( err ) : reject( err );

		const order: Order = await order_get_by_transaction_id( req, transaction_id, session_id, payment_mode );

		if ( !order ) {
			err.message = 'Order not found';
			return cback ? cback( err ) : reject( err );
		}

		const td = await order_transaction_update( req, order.id, transaction_id, session_id, event_name, data );

		return cback ? cback( null, td ) : resolve( td );
		/*=== d2r_end post_order_transaction_update ===*/
	} );
};
// }}}

// {{{ post_order_transaction_success ( req: ILRequest, challenge: string, transaction_id: string, session_id?: string, payment_mode?: string, cback: LCBack = null ): Promise<Order>
/**
 * Mark an order as "success"
 *
 * @param challenge - Authorization challenge [req]
 * @param transaction_id - The transaction ID [req]
 * @param session_id - The session ID (if any) [opt]
 * @param payment_mode - The payment mode [opt]
 *
 */
export const post_order_transaction_success = ( req: ILRequest, challenge: string, transaction_id: string, session_id?: string, payment_mode?: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_transaction_success ===*/
		const err = { message: 'Invalid challenge' };

		if ( !challenge_check( challenge, [ transaction_id, session_id, payment_mode ] ) ) return cback ? cback( err ) : reject( err );

		let order: Order = await order_get_by_transaction_id( req, transaction_id, session_id, payment_mode );

		if ( !order ) {
			err.message = 'Order not found';
			return cback ? cback( err ) : reject( err );
		}

		order = await order_payment_completed( req, order.id );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end post_order_transaction_success ===*/
	} );
};
// }}}

// {{{ post_order_transaction_failed ( req: ILRequest, challenge: string, transaction_id: string, session_id?: string, payment_mode?: string, cback: LCBack = null ): Promise<Order>
/**
 * Mark an order with "payment failed"


 *
 * @param challenge - Authorization challenge [req]
 * @param transaction_id - The transaction ID [req]
 * @param session_id - The Session ID [opt]
 * @param payment_mode - The payment mode [opt]
 *
 */
export const post_order_transaction_failed = ( req: ILRequest, challenge: string, transaction_id: string, session_id?: string, payment_mode?: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_transaction_failed ===*/
		const err = { message: 'Invalid challenge' };

		if ( !challenge_check( challenge, [ transaction_id, payment_mode ] ) ) return cback ? cback( err ) : reject( err );

		let order: Order = await order_get_by_transaction_id( req, transaction_id, session_id, payment_mode );

		if ( !order ) {
			err.message = 'Order not found';
			return cback ? cback( err ) : reject( err );
		}

		order = await order_payment_cancelled( req, order.id );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end post_order_transaction_failed ===*/
	} );
};
// }}}

// {{{ get_order_admin_details ( req: ILRequest, id: string, cback: LCBack = null ): Promise<OrderFull>
/**
 *
 *
 * @param id - The order ID [req]
 *
 */
export const get_order_admin_details = ( req: ILRequest, id: string, cback: LCback = null ): Promise<OrderFull> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start get_order_admin_details ===*/
		const order: OrderFull = await _order_get_full( req, id );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end get_order_admin_details ===*/
	} );
};
// }}}

// {{{ delete_order_admin_del_real ( req: ILRequest, id: string, cback: LCBack = null ): Promise<string>
/**
 * Deletes a order from the system for real (removing everything from the database)
 *
 * @param id - The order id to be deleted [req]
 *
 */
export const delete_order_admin_del_real = ( req: ILRequest, id: string, cback: LCback = null ): Promise<string> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start delete_order_admin_del_real ===*/
		// deletes all order items
		await collection_del_all_dict( req.db, COLL_ORDER_ITEMS, { id_order: id } );

		// deletes the order
		await collection_del_one_dict( req.db, COLL_ORDERS, { id } );

		return cback ? cback( null, id ) : resolve( id );
		/*=== d2r_end delete_order_admin_del_real ===*/
	} );
};
// }}}


/**
 * Initializes the order database
 *
 * @param liwe - LiWE full config [req]
 *
 */
export const order_db_init = ( liwe: ILiWE, cback: LCback = null ): Promise<boolean> => {
	return new Promise( async ( resolve, reject ) => {
		_liwe = liwe;

		_coll_orders = await collection_init( liwe.db, COLL_ORDERS, [
			{ type: "persistent", fields: [ "id" ], unique: true },
			{ type: "persistent", fields: [ "domain" ], unique: false },
			{ type: "persistent", fields: [ "code" ], unique: true },
			{ type: "persistent", fields: [ "id_user" ], unique: false },
			{ type: "persistent", fields: [ "session" ], unique: false },
			{ type: "persistent", fields: [ "status" ], unique: false },
			{ type: "persistent", fields: [ "valid" ], unique: false },
			{ type: "persistent", fields: [ "payment_mode" ], unique: false },
			{ type: "persistent", fields: [ "transaction_id" ], unique: false },
			{ type: "persistent", fields: [ "session_id" ], unique: false },
			{ type: "persistent", fields: [ "payment_status" ], unique: false },
			{ type: "persistent", fields: [ "deleted" ], unique: false },
		], { drop: false } );

		_coll_order_items = await collection_init( liwe.db, COLL_ORDER_ITEMS, [
			{ type: "persistent", fields: [ "id" ], unique: true },
			{ type: "persistent", fields: [ "domain" ], unique: false },
			{ type: "persistent", fields: [ "id_order" ], unique: false },
			{ type: "persistent", fields: [ "prod_code" ], unique: false },
		], { drop: false } );

		_coll_order_log = await collection_init( liwe.db, COLL_ORDER_LOG, [
			{ type: "persistent", fields: [ "id" ], unique: true },
			{ type: "persistent", fields: [ "id_order" ], unique: false },
			{ type: "persistent", fields: [ "payment_mode" ], unique: false },
			{ type: "persistent", fields: [ "transaction_id" ], unique: false },
			{ type: "persistent", fields: [ "session_id" ], unique: false },
			{ type: "persistent", fields: [ "event_name" ], unique: false },
		], { drop: false } );

		/*=== d2r_start order_db_init ===*/

		/*=== d2r_end order_db_init ===*/
	} );
};

/**
 * Starts a transaction for the given order.
 *
 * @param req - the Request field [req]
 * @param id_order - The order ID [req]
 * @param payment_mode - The payment mode [req]
 * @param transaction_id - The transatction id [req]
 * @param session_id - The session ID [opt]
 * @param event_name - The event name [opt]
 * @param data - Additional data [opt]
 *
 */
export const order_transaction_start = ( req: ILRequest, id_order: string, payment_mode: string, transaction_id: string, session_id?: string, event_name?: string, data?: any, cback: LCback = null ): Promise<OrderPaymentLog> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start order_transaction_start ===*/
		const order: Order = await _order_get( req, id_order );
		const log: OrderPaymentLog = {
			id: mkid( 'trns' ),
			id_order,
			payment_mode,
			transaction_id,
			session_id,
			event_name,
			data,
		};

		order.payment_status = OrderPaymentStatus.in_pay;
		order.payment_mode = payment_mode;
		order.transaction_id = transaction_id;

		await collection_add( _coll_orders, order );
		const log2 = await collection_add( _coll_order_log, log, false, OrderPaymentLogKeys );

		return cback ? cback( null, log2 ) : resolve( log2 );
		/*=== d2r_end order_transaction_start ===*/
	} );
};

/**
 * Updates the status of a transaction
 *
 * @param req - the Request field [req]
 * @param id_order - The ID order [req]
 * @param transaction_id - The transaction ID [req]
 * @param session_id - The session ID [opt]
 * @param event_name - The event name [opt]
 * @param data - Additional data [opt]
 *
 */
export const order_transaction_update = ( req: ILRequest, id_order: string, transaction_id: string, session_id?: string, event_name?: string, data?: any, cback: LCback = null ): Promise<OrderPaymentLog> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start order_transaction_update ===*/
		let log: OrderPaymentLog = {
			id: mkid( 'trns' ),
			id_order,
			transaction_id,
			session_id,
			event_name,
			data,
		};

		log = await collection_add( _coll_order_log, log, false, OrderPaymentLogKeys );

		return cback ? cback( null, log ) : resolve( log );
		/*=== d2r_end order_transaction_update ===*/
	} );
};

/**
 * Marks an order as paid completely.
 *
 * @param req - the Request field [req]
 * @param id_order - The Order ID [req]
 *
 */
export const order_payment_completed = ( req: ILRequest, id_order: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start order_payment_completed ===*/
		const err = { message: "Order not found" };
		let order: Order = await _order_get( req, id_order );

		if ( !order ) return cback ? cback( err ) : reject( err );

		order.payment_status = OrderPaymentStatus.paid;
		order.status = OrderStatus.ready;

		order = await collection_add( _coll_orders, order, false, OrderKeys );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end order_payment_completed ===*/
	} );
};

/**
 * This function marks an order as 'cancelled'
 *
 * @param req - the Request field [req]
 * @param id_order -  [req]
 *
 */
export const order_payment_cancelled = ( req: ILRequest, id_order: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start order_payment_cancelled ===*/
		const err = { message: "Order not found" };
		let order: Order = await _order_get( req, id_order );

		if ( !order ) return cback ? cback( err ) : reject( err );

		order.payment_status = OrderPaymentStatus.aborted;
		order = await collection_add( _coll_orders, order, false, OrderKeys );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end order_payment_cancelled ===*/
	} );
};

/**
 * Returns the order with the `transaction_id` / `session_id` specified.

To avoid duplicates, you can also specify the `payment_mode` but it is optional.

At least one between `transaction_id` and `session_id` must be specified.
 *
 * @param req - the Request field [req]
 * @param transaction_id - The transaction ID [opt]
 * @param session_id - The session ID [opt]
 * @param payment_mode - The payment mode [opt]
 *
 */
export const order_get_by_transaction_id = ( req: ILRequest, transaction_id?: string, session_id?: string, payment_mode?: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start order_get_by_transaction_id ===*/
		const err = { message: "Order not found" };
		const order: Order = await collection_find_one_dict( req.db, COLL_ORDERS, { transaction_id, payment_mode }, OrderKeys );

		if ( !order || ( !transaction_id && !payment_mode ) ) return cback ? cback( err ) : reject( err );
		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end order_get_by_transaction_id ===*/
	} );
};
