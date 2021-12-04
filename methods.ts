
import { ILRequest, ILResponse, LCback, ILiweConfig, ILError, ILiWE } from '../../liwe/types';
import { collection_add, collection_count, collection_find_all, collection_find_by_id, collection_find_one, collection_find_one_dict, collection_find_all_dict, collection_del_one_dict, collection_del_all_dict, collection_init, mkid, prepare_filters } from '../../liwe/arangodb';
import { DocumentCollection } from 'arangojs/collection';
import { $l } from '../../liwe/locale';

import {
	Order, OrderFull, OrderFullKeys, OrderItem, OrderItemKeys, OrderKeys
} from './types';

let _liwe: ILiWE = null;

const _ = ( txt: string, vals: any = null, plural = false ) => {
	return $l( txt, vals, plural, "order" );
};

let _coll_orders: DocumentCollection = null;
let _coll_order_items: DocumentCollection = null;
let _coll_order_full: DocumentCollection = null;

const COLL_ORDERS = "orders";
const COLL_ORDER_ITEMS = "order_items";
const COLL_ORDER_FULL = "order_full";

/*=== d2r_start __file_header === */
import { system_domain_get_by_session } from '../system/methods';
import { Product } from '../product/types';
import { product_get } from '../product/methods';
import { date_format, keys_filter, rand_int } from '../../liwe/utils';
import { user_get } from '../user/methods';
import { User } from '../user/types';

const mkcode = () => {
	const d = date_format( new Date(), 'yyyymmddHHMMSS' );

	return d;
};

const _order_get = async ( req: ILRequest, id?: string, code?: string, id_user?: string, full: boolean = false ) => {
	let order: Order = null;
	const domain = await system_domain_get_by_session( req );
	let user: User = null;

	if ( !id_user ) id_user = req.user.id;

	if ( id || code ) {
		order = await collection_find_one_dict( req.db, COLL_ORDERS, { id, code } );
	} else {
		order = await collection_find_one_dict( req.db, COLL_ORDERS, { id_user, status: 'new' } );
	}

	if ( !order ) {
		order = { id: mkid( 'order' ), id_user: req.user.id, domain: domain.code, status: 'new', code: mkcode() };
		order = await collection_add( _coll_orders, order );
	} else {
		if ( full ) user = await user_get( order.id_user );
		( order as any ).user = user;
	}

	return order;
};

const _add_prod = ( req: ILRequest, order: Order, prod_code: string, qnt: number ): Promise<OrderItem> => {
	return new Promise( async ( resolve, reject ) => {
		let order_item: OrderItem = await collection_find_one_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id, prod_code } );
		if ( !order_item ) order_item = { id: mkid( 'o_item' ), domain: order.domain, quant: 0 };

		const prod: Product = await product_get( req, null, prod_code );
		const err = { message: 'Product not found' };
		if ( !prod ) return reject( err );

		order_item.id_order = order.id;
		order_item.prod_code = prod.code;
		order_item.quant += qnt;
		order_item.price_net = prod.price_net;
		order_item.price_vat = prod.price_vat;
		order_item.name = prod.name;
		order_item.total_net = prod.price_net * order_item.quant;
		order_item.total_vat = prod.price_vat * order_item.quant;
		order_item.vat = prod.vat;

		await collection_add( _coll_order_items, order_item );
		order = await _calc_order_tots( req, order );

		return resolve( order_item );
	} );
};

const _calc_order_tots = async ( req: ILRequest, order: Order ) => {
	const items: OrderItem[] = await collection_find_all_dict( req.db, COLL_ORDER_ITEMS, { id_order: order.id } );
	let elems = 0;
	let tot_net = 0;
	let tot_vat = 0;

	items.forEach( ( it ) => {
		elems += it.quant;
		tot_net += it.total_net;
		tot_vat += it.total_vat;
	} );

	order.items = elems;
	order.total_net = tot_net;
	order.total_vat = tot_vat;

	return await collection_add( _coll_orders, order );
};
/*=== d2r_end __file_header ===*/

// {{{ post_order_admin_add ( req: ILRequest, prod_code: string, qnt: number, id_user: string, cback: LCBack = null ): Promise<Order>
/**
 * Adds a new order
 *
 * @param prod_code - Product Code [req]
 * @param qnt - Quantity to add [req]
 * @param id_user - The ID user to add the order to [req]
 *
 */
export const post_order_admin_add = ( req: ILRequest, prod_code: string, qnt: number, id_user: string, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_admin_add ===*/
		const order: Order = await _order_get( req, null, null, id_user );
		/*=== d2r_end post_order_admin_add ===*/
	} );
};
// }}}

// {{{ patch_order_admin_update ( req: ILRequest, id: string, name?: string, cback: LCBack = null ): Promise<Order>
/**
 * Updates an existing order
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
 * Modifies some fields
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
 * List all orders
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
			FOR u IN users
				FILTER u.id == o.id_user
				RETURN { order: o, user: { name: u.name, lastname: u.lastname, email: u.email } }`, {} );

		const orders: Order[] = results.map( ( s ) => {
			s.order.user_name = s.user.name;
			s.order.user_lastname = s.user.lastname;
			s.order.user_email = s.user.email;

			return s.order;
		} );

		// keys_filter( orders, OrderKeys );

		return cback ? cback( null, orders ) : resolve( orders );
		/*=== d2r_end get_order_admin_list ===*/
	} );
};
// }}}

// {{{ delete_order_admin_del ( req: ILRequest, id: string, cback: LCBack = null ): Promise<string>
/**
 * Deletes a order
 *
 * @param id - The order id to be deleted [req]
 *
 */
export const delete_order_admin_del = ( req: ILRequest, id: string, cback: LCback = null ): Promise<string> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start delete_order_admin_del ===*/

		/*=== d2r_end delete_order_admin_del ===*/
	} );
};
// }}}

// {{{ post_order_admin_tag ( req: ILRequest, id: string, tags: string[], cback: LCBack = null ): Promise<Order>
/**
 * Tag a order
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

// {{{ post_order_add ( req: ILRequest, prod_code: string, qnt: number, cback: LCBack = null ): Promise<Order>
/**
 * Adds a product to the current order
 *
 * @param prod_code - Product Code [req]
 * @param qnt - Quantity to add [req]
 *
 */
export const post_order_add = ( req: ILRequest, prod_code: string, qnt: number, cback: LCback = null ): Promise<Order> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start post_order_add ===*/
		let order: Order = await _order_get( req );
		const item: OrderItem = await _add_prod( req, order, prod_code, qnt );

		keys_filter( order, OrderKeys );

		return cback ? cback( null, order ) : resolve( order );
		/*=== d2r_end post_order_add ===*/
	} );
};
// }}}

// {{{ get_order_details ( req: ILRequest, id?: string, cback: LCBack = null ): Promise<OrderFull>
/**
 * Get all order details
 *
 * @param id - Order unique ID [opt]
 *
 */
export const get_order_details = ( req: ILRequest, id?: string, cback: LCback = null ): Promise<OrderFull> => {
	return new Promise( async ( resolve, reject ) => {
		/*=== d2r_start get_order_details ===*/
		const order: OrderFull = await _order_get( req, id, null, null, true );
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
 * List all orders
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
			{ type: "persistent", fields: [ "id_payment" ], unique: false },
		], false );

		_coll_order_items = await collection_init( liwe.db, COLL_ORDER_ITEMS, [
			{ type: "persistent", fields: [ "id" ], unique: true },
			{ type: "persistent", fields: [ "domain" ], unique: false },
			{ type: "persistent", fields: [ "id_order" ], unique: false },
			{ type: "persistent", fields: [ "prod_code" ], unique: false },
		], false );

		/*=== d2r_start order_db_init ===*/

		/*=== d2r_end order_db_init ===*/
	} );
};
