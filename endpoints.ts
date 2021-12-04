
import { ILRequest, ILResponse, ILApplication, ILiweConfig, ILError, ILiWE } from '../../liwe/types';
import { send_error, send_ok, typed_dict } from "../../liwe/utils";
import { locale_load } from '../../liwe/locale';

import { perms } from '../../liwe/auth';

import {
	post_order_admin_add, patch_order_admin_update, patch_order_admin_fields, get_order_admin_list, delete_order_admin_del, post_order_admin_tag, post_order_add, get_order_details, get_order_list, order_db_init
} from './methods';

import {
	Order, OrderFull, OrderItem
} from './types';

/*=== d2r_start __header ===*/

/*=== d2r_end __header ===*/

/* === ORDER API === */
export const init = ( liwe: ILiWE ) => {
	const app = liwe.app;

	console.log( "    - Order " );

	liwe.cfg.app.languages.map( ( l ) => locale_load( "order", l ) );
	order_db_init ( liwe );


	app.post ( "/api/order/admin/add", perms( [ "order.add" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { prod_code, qnt, id_user, ___errors } = typed_dict( req.fields, [
			{ name: "prod_code", type: "string", required: true },
			{ name: "qnt", type: "number", required: true, default: 1 },
			{ name: "id_user", type: "string", required: true }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		post_order_admin_add ( req,prod_code, qnt, id_user,  ( err: ILError, order: Order ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { order } );
		} );
	} );

	app.patch ( "/api/order/admin/update", perms( [ "order.add" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, name, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true },
			{ name: "name", type: "string" }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		patch_order_admin_update ( req,id, name,  ( err: ILError, order: Order ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { order } );
		} );
	} );

	app.patch ( "/api/order/admin/fields", perms( [ "order.add" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, data, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true },
			{ name: "data", type: "any", required: true }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		patch_order_admin_fields ( req,id, data,  ( err: ILError, order: Order ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { order } );
		} );
	} );

	app.get ( "/api/order/admin/list", perms( [ "order.add" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { skip, rows, ___errors } = typed_dict( req.query as any, [
			{ name: "skip", type: "number" },
			{ name: "rows", type: "number" }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		get_order_admin_list ( req,skip, rows,  ( err: ILError, orders: Order[] ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { orders } );
		} );
	} );

	app.delete ( "/api/order/admin/del", perms( [ "order.add" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		delete_order_admin_del ( req,id,  ( err: ILError, id: string ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { id } );
		} );
	} );

	app.post ( "/api/order/admin/tag", perms( [ "order.add" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { id, tags, ___errors } = typed_dict( req.fields, [
			{ name: "id", type: "string", required: true },
			{ name: "tags", type: "string[]", required: true }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		post_order_admin_tag ( req,id, tags,  ( err: ILError, order: Order ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { order } );
		} );
	} );

	app.post ( "/api/order/add", perms( [ "is-logged" ] ), ( req: ILRequest, res: ILResponse ) => {
		const { prod_code, qnt, ___errors } = typed_dict( req.fields, [
			{ name: "prod_code", type: "string", required: true },
			{ name: "qnt", type: "number", required: true, default: 1 }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		post_order_add ( req,prod_code, qnt,  ( err: ILError, order: Order ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { order } );
		} );
	} );

	app.get ( "/api/order/details", ( req: ILRequest, res: ILResponse ) => {
		const { id, ___errors } = typed_dict( req.query as any, [
			{ name: "id", type: "string" }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		get_order_details ( req,id,  ( err: ILError, order: OrderFull ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { order } );
		} );
	} );

	app.get ( "/api/order/list", ( req: ILRequest, res: ILResponse ) => {
		const { rows, skip, ___errors } = typed_dict( req.query as any, [
			{ name: "rows", type: "number" },
			{ name: "skip", type: "number" }
		] );

		if ( ___errors.length ) return send_error ( res, { message: `Parameters error: ${___errors.join ( ', ' )}` } );

		get_order_list ( req,rows, skip,  ( err: ILError, orders: Order[] ) => {
			if ( err ) return send_error( res, err );

			send_ok( res, { orders } );
		} );
	} );

}
