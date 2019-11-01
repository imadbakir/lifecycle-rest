
import env from '../util/env.js';

import { Schema } from '../schema/Schema.js';
import { Agent, Context, Resource } from './Resource.js';
import ItemResource from './ItemResource.js';
import CollectionResource from './CollectionResource.js';


/*
Create a REST API loader service from an API specification. The specification is built up from
a tree of "resource" specifications. Each resource specification should describe a REST resource
your API (an endpoint, essentially).

The actual HTTP requests are delegated to an *agent* that needs to be provided.
*/


const RestApi = <S extends Schema, R extends Resource<S>>(agent : Agent, resource : (context : Context) => R) : R => {
    //const resource = typeof _resource !== 'function' ? ItemResource(SimpleItem, _resource) : _resource;
    
    const options = {}; // In the future we may want to support additional API options
    
    // Current context while traversing through the resource hierarchy
    const context = {
        agent,
        options,
        path: [], // The current path in the API resource tree
        store: [],
        uri: '', // Note: no trailing slash (so empty string in case of empty URI)
    };
    
    // Return the root item resource
    return resource(context);
};

// Shorthands
RestApi.Item = ItemResource;
RestApi.Collection = CollectionResource;

export default RestApi;
